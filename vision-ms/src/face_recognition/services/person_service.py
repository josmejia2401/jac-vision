from __future__ import annotations
import logging
import numpy as np
import datetime
import cv2
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..dto.person_dto import PersonDTO, FaceEmbeddingDTO
from ..recognition.face_engine import FaceEngine
from ..repository.person_repository import PersonRepository
from ...helpers.utils.enums import FaceSource

logger = logging.getLogger(__name__)

class PersonService:

    def __init__(self, db: AsyncIOMotorDatabase, engine: FaceEngine):
        self.engine = engine
        self._repo = PersonRepository(db)
        logger.info("PersonService inicializado con colección 'vision_persons'")

    async def create(self, dto: PersonDTO) -> int:
        logger.info("Creando persona '%s' …", dto.displayName)
        return await self._repo.create(dto)

    async def get(self, person_id: int) -> PersonDTO | None:
        return await self._repo.get(person_id)

    async def list(self):
        return await self._repo.list()

    async def update(self, person_id: int, dto: PersonDTO):
        logger.info("Actualizando persona ID=%s", person_id)
        updated = await self._repo.update(person_id, dto)
        if not updated:
            logger.warning("Intento de actualización fallido: persona %s no existe", person_id)
        return updated
    
    async def update_field(self, person_id: int, field: str, value):
        logger.info("Actualizando campo '%s' de persona ID=%s", field, person_id)
        updated = await self._repo.update_field(person_id, field, value)
        if not updated:
            logger.warning("Intento de actualización fallido: persona %s no existe", person_id)
        return updated

    async def delete(self, person_id: int) -> bool:
        logger.info("Eliminando persona ID=%s", person_id)
        deleted = await self._repo.delete(person_id)
        if not deleted:
            logger.warning("Intento de borrar fallido: persona %s no existe", person_id)
        return deleted

    async def add_embedding(self, person_id: int, embedding: FaceEmbeddingDTO):
        logger.info("Agregando embedding a persona ID=%s", person_id)

        person = await self._repo.get(person_id)
        if not person:
            logger.error("No se puede agregar embedding: persona %s no existe", person_id)
            return None

        return await self._repo.add_embedding(person_id, embedding)

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
        
    async def add_embeddings_from_bytes(self, person_id: int, file_bytes: bytes):
        logger.info("Procesando imagen para embeddings de persona ID=%s", person_id)
        # Verificar existencia de persona
        person = await self._repo.get(person_id)
        if not person:
            logger.error("Persona %s no existe — no se pueden agregar embeddings", person_id)
            return []

        # Decodificar imagen
        arr = np.frombuffer(file_bytes, np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if frame is None:
            logger.error("No fue posible decodificar la imagen proporcionada")
            return []

        # Extraer rostros
        faces = self.engine.extract(frame)
        if not faces:
            logger.warning("No se detectaron rostros en la imagen para persona %s", person_id)
            return []

        now = datetime.datetime.utcnow()

        embeddings = []
        for face in faces:
            emb = FaceEmbeddingDTO(
                embedding=face.embedding,
                source=FaceSource.MANUAL_UPLOAD,
                cameraId=None,
                createdAt=now,
                qualityScore=face.score,
                thumbnail=face.thumbnail,
                pose=face.pose,
                metadata={"poseBucket": self.pose_bucket(face.pose)},
            )
            embeddings.append(emb)

        logger.info("Se encontraron %s rostros para persona %s. Guardando embeddings…", len(embeddings), person_id)

        return await self._repo.add_embeddings(person_id, embeddings)

    async def list_by_user(self, user_id: int):
        return await self._repo.list_by_user(user_id)
