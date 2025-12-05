from __future__ import annotations
import base64
import json
import logging
import threading
import cv2
import numpy as np
import pika
from typing import Optional, Dict
import datetime
import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..dto.person_dto import PersonDTO, FaceEmbeddingDTO
from ...helpers.utils.enums import FaceSource, RiskLevel
from ..recognition.face_engine import FaceEngine
from ..services.person_service import PersonService
from ...helpers.constants.constants import constants

logger = logging.getLogger(__name__)


class RabbitConsumer(threading.Thread):

    def __init__(self, camera_id: int, db: AsyncIOMotorDatabase, face_engine: FaceEngine, main_loop: asyncio.AbstractEventLoop):
        super().__init__(daemon=True)
        self.camera_id = camera_id
        # Face engine
        self._face_engine = face_engine
        self.main_loop: asyncio.AbstractEventLoop = main_loop
        # Servicio de personas
        self._person_service = PersonService(db=db, engine=self._face_engine)
        # Flag de parada del thread
        self._stop_flag = threading.Event()
        # RabbitMQ
        self._amqp_url = constants["AMQP_URL"]
        self._exchange = constants["AMQP_EXCHANGE"]
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[pika.adapters.blocking_connection.BlockingChannel] = None
        # Reconocimiento
        self.MATCH_THRESHOLD = 0.55
        self.UNKNOWN_ALERT_THRESHOLD = 15  # Ej: si un desconocido aparece 15 veces → alerta
        self.RISK_NOTIFY_LEVELS = {RiskLevel.DANGEROUS, RiskLevel.HIGH}
        # "Modelo" en memoria: { userId: { personId: {centroid, embeddings[], risk} } }
        self.embedding_index: Dict[int, Dict[int, Dict]] = {}

    def stop(self):
        self._stop_flag.set()

    def connect(self) -> None:
        if self._connection and self._connection.is_open:
            return
        logger.info("FaceIdentificationConsumer %s conectando a RabbitMQ %s", self.camera_id, self._amqp_url)
        params = pika.URLParameters(self._amqp_url)
        params.heartbeat = 30
        params.blocked_connection_timeout = 30
        params.socket_timeout = 30
        params.connection_attempts = 5
        params.retry_delay = 5
        self._connection = pika.BlockingConnection(params)
        self._channel = self._connection.channel()
        logger.info("Conectado a RabbitMQ %s", self._amqp_url)

    def cosine_distance(self, v1, v2):
        v1 = np.asarray(v1, dtype=np.float32)
        v2 = np.asarray(v2, dtype=np.float32)
        
        # Evitar vectores vacíos o corruptos
        if v1.size == 0 or v2.size == 0:
            return 1.0

        # Normalización explícita
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 1.0

        v1 = v1 / norm1
        v2 = v2 / norm2

        sim = float(np.dot(v1, v2))
        # clamp [-1, 1]
        sim = max(min(sim, 1.0), -1.0)

        return 1.0 - sim


    def pose_bucket(self, pose: dict) -> str:
        if not pose:
            return "UNKNOWN"

        yaw = pose.get("yaw")
        if yaw is None:
            return "UNKNOWN"

        try:
            yaw = float(yaw)
        except Exception:
            return "UNKNOWN"
        
        # =======================
        # Umbrales recomendados
        # =======================
        # > 40° -> PERFIL
        # 20°–40° -> SEMIPERFIL
        # -20° – 20° -> FRONTAL
        # < -40° -> PERFIL izquierdo
        # =======================
        if yaw > 40:
            return "PROFILE_RIGHT"
        elif 20 < yaw <= 40:
            return "HALF_RIGHT"
        elif -20 <= yaw <= 20:
            return "FRONTAL"
        elif -40 <= yaw < -20:
            return "HALF_LEFT"
        else:
            return "PROFILE_LEFT"


    async def _ensure_embedding_index(self, user_id: int):
        if user_id in self.embedding_index:
            return

        persons: list[PersonDTO] = await self._person_service.list_by_user(user_id)
        self.embedding_index[user_id] = {}

        for p in persons:
            # Lista de vectores numpy normalizados
            emb_vecs = []
            for e in p.embeddings:
                v = np.asarray(e.embedding, dtype=np.float32)
                n = np.linalg.norm(v)
                if n > 0:
                    v = v / n
                    emb_vecs.append(v)

            if not emb_vecs:
                continue

            centroid = np.mean(emb_vecs, axis=0)
            ncent = np.linalg.norm(centroid)
            if ncent > 0:
                centroid = centroid / ncent

            self.embedding_index[user_id][p.id] = {
                "embeddings": emb_vecs,
                "centroid": centroid,
                "risk": p.riskLevel
            }

        logger.info("Embedding index cargado para userId=%s, personas=%s", user_id, len(self.embedding_index[user_id]))


    def _update_embedding_index(self,
                                user_id: int,
                                person_id: int,
                                embedding, risk: RiskLevel):
        emb = np.asarray(embedding, dtype=np.float32)
        n = np.linalg.norm(emb)
        if n == 0:
            return
        emb = emb / n

        user_bucket = self.embedding_index.setdefault(user_id, {})
        entry = user_bucket.setdefault(person_id, {
            "embeddings": [],
            "centroid": None,
            "risk": risk
        })

        entry["embeddings"].append(emb)
        centroid = np.mean(entry["embeddings"], axis=0)
        ncent = np.linalg.norm(centroid)
        if ncent > 0:
            centroid = centroid / ncent
        entry["centroid"] = centroid
        entry["risk"] = risk


    def _match_person(self, user_id: int, embedding):
        emb = np.asarray(embedding, dtype=np.float32)
        n = np.linalg.norm(emb)
        if n == 0:
            return None, 999.0
        emb = emb / n

        best_person_id = None
        best_distance = 999.0

        user_bucket = self.embedding_index.get(user_id, {})
        for pid, data in user_bucket.items():
            centroid = data.get("centroid")
            if centroid is None:
                continue
            d = self.cosine_distance(emb, centroid)
            if d < best_distance:
                best_distance = d
                best_person_id = pid

        return best_person_id, best_distance


    async def process_face(self, user_id: int, camera_id: int, face: dict):

        embedding = face["embedding"]
        quality = face["score"]
        thumbnail = face["thumbnail"]
        pose = face.get("pose", {})
        now_iso = datetime.datetime.utcnow().isoformat()

        # Asegurar que el índice del usuario está cargado
        await self._ensure_embedding_index(user_id)

        # 1. Matching rápido en memoria
        person_id, best_distance = self._match_person(user_id, embedding)

        # ----------------- UNKNOWN -----------------
        if person_id is None or best_distance > self.MATCH_THRESHOLD:
            logger.info(f"[UNKNOWN] user={user_id} dist={best_distance:.3f}")

            emb_dto = FaceEmbeddingDTO(
                id=None,
                embedding=embedding,
                source=FaceSource.CAMERA,
                cameraId=camera_id,
                createdAt=datetime.datetime.utcnow(),
                qualityScore=quality,
                thumbnail=thumbnail,
                pose=pose,
                metadata={"poseBucket": self.pose_bucket(pose)},
            )

            p_unknown = PersonDTO(
                id=None,
                userId=user_id,
                displayName="unknown",
                tags=[],
                riskLevel=RiskLevel.UNKNOWN,
                metadata={"seenCount": 1, "unknown": True},
                embeddings=[emb_dto],
            )

            new_id = await self._person_service.create(dto=p_unknown)

            # Actualizar índice en memoria
            self._update_embedding_index(
                user_id=user_id,
                person_id=new_id,
                embedding=embedding,
                risk=RiskLevel.UNKNOWN
            )

            # Si supera umbral de desconocido frecuente
            seen = p_unknown.metadata.get("seenCount", 1)
            if seen >= self.UNKNOWN_ALERT_THRESHOLD:
                logger.warning(f"[UNKNOWN ALERT] Persona desconocida vista {seen} veces - user={user_id}")
            return

        # ----------------- PERSONA EXISTENTE -----------------
        person: PersonDTO = await self._person_service.get(person_id)
        if not person:
            logger.warning(f"Persona {person_id} no encontrada en BD aunque estaba en índice")
            return

        logger.info(f"[MATCH] PersonId={person.id} user={user_id} dist={best_distance:.3f}")

        # Embedding para agregar
        emb_dto = FaceEmbeddingDTO(
            id=None,
            embedding=embedding,
            source=FaceSource.CAMERA,
            cameraId=camera_id,
            createdAt=now_iso,
            qualityScore=quality,
            thumbnail=thumbnail,
            pose=pose,
            metadata={"poseBucket": self.pose_bucket(pose)},
        )

        # === Persona peligrosa ===
        if person.riskLevel in self.RISK_NOTIFY_LEVELS:
            logger.warning(f"[HIGH RISK] Persona peligrosa detectada: {person.displayName}")
            # Aquí iría la notificación real

        # Guardar embedding en BD
        await self._person_service.add_embedding(
            person_id=person.id,
            embedding=emb_dto
        )

        # Actualizar índice en memoria
        self._update_embedding_index(
            user_id=user_id,
            person_id=person.id,
            embedding=embedding,
            risk=person.riskLevel
        )

        # Actualizar seenCount
        meta = person.metadata or {}
        freq = meta.get("seenCount", 0) + 1
        await self._person_service.update_field(person.id, "metadata.seenCount", freq)

        # Notificación para normales muy frecuentes
        if person.riskLevel == RiskLevel.NORMAL and freq > 20:
            logger.info(f"[NORMAL FREQUENT] {person.displayName} visto {freq} veces")
        return


    def run(self):
        logger.info("FaceIdentificationConsumer started for camera %s", self.camera_id)
        self.connect()
        
        queue_name = f"vision.face.detected.{self.camera_id}"

        self._channel.exchange_declare(
            exchange=self._exchange,
            exchange_type="topic",
            durable=True
        )
        self._channel.queue_declare(queue=queue_name, durable=False)
        self._channel.queue_bind(
            exchange=self._exchange,
            queue=queue_name,
            routing_key=f"camera.{self.camera_id}",
        )

        def callback(ch, method, properties, body):
            if self._stop_flag.is_set():
                ch.basic_cancel(consumer_tag=str(self.camera_id))
                return

            try:
                msg = json.loads(body)

                frame_b64 = msg["frame"]
                camera_id = msg["camera_id"]
                user_id = msg.get("user_id", 0)

                frame_bytes = base64.b64decode(frame_b64)
                arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if frame is None:
                    logger.warning("Frame inválido")
                    ch.basic_ack(method.delivery_tag)
                    return

                faces = self._face_engine.extract(frame)
                logger.info(
                    "%s rostros detectados en cámara %s",
                    len(faces), camera_id
                )

                for idx, face in enumerate(faces):
                    logger.debug(
                        "Procesando rostro %s/%s (score=%.3f)",
                        idx + 1, len(faces), face["score"]
                    )
                    self.main_loop.call_soon_threadsafe(
                        asyncio.create_task,
                        self.process_face(
                            user_id=user_id,
                            camera_id=camera_id,
                            face=face
                        )
                    )
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.exception(
                    "Error procesando mensaje para cámara %s: %s",
                    self.camera_id, e
                )

        self._channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback,
            auto_ack=False,
            consumer_tag=str(self.camera_id),
        )

        try:
            while not self._stop_flag.is_set():
                #self._channel._process_data_events(time_limit=1)
                self._connection.process_data_events(time_limit=1)
        finally:
            try:
                self._channel.close()
            except Exception:
                pass
            try:
                self._connection.close()
            except Exception:
                pass

            logger.info("FaceIdentificationConsumer stopped for camera %s", self.camera_id)
        
        return
