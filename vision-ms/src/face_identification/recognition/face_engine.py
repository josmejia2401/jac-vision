import cv2
import base64
import insightface
import logging
from typing import List, Optional
from ..dto.person_dto import PoseDTO, FaceExtractedDTO
from ...helpers.constants.constants import constants

logger = logging.getLogger(__name__)

class FaceEngine:
    
    def __init__(self):
        # Configuración
        self.jpeg_quality: int = constants["INGEST_JPEG_QUALITY"]
        self.thumbnail_width: int = constants["INGEST_THUMBNAIL_WIDTH"]
        self.thumbnail_height: int = constants["INGEST_THUMBNAIL_HEIGHT"]
        # Inicializar InsightFace
        try:
            self.model = insightface.app.FaceAnalysis(name="buffalo_l", allowed_modules=["detection", "recognition"])
            self.model.providers = ["CoreMLExecutionProvider", "CPUExecutionProvider"]
            self.model.prepare(ctx_id=-1, det_size=(512, 512))
            logger.info("FaceEngine inicializado correctamente.")
        except Exception as e:
            logger.exception("Error inicializando FaceAnalysis: %s", str(e))
            raise e

    def extract(self, frame_bgr) -> List[FaceExtractedDTO]:
        if frame_bgr is None:
            logger.warning("Frame vacío recibido en extract()")
            return []
        # Convertir a RGB
        try:
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        except Exception as e:
            logger.error("Error convirtiendo frame a RGB: %s", e)
            return []

        # Detección del modelo
        try:
            faces = self.model.get(frame_rgb)
        except Exception as e:
            logger.error("Error ejecutando face detection: %s", e)
            return []

        results: list[FaceExtractedDTO] = []
        for face in faces:

            if face.normed_embedding is None:
                continue

            bbox = face.bbox.astype(int).tolist()
            emb = face.normed_embedding.tolist()
            score = float(face.det_score)
            thumbnail_b64 = self._create_thumbnail(frame_bgr, bbox)
            pose: PoseDTO = {}
            try:
                if hasattr(face, "pose") and face.pose is not None:
                    yaw, pitch, roll = face.pose
                    pose = {
                        "yaw": float(yaw),
                        "pitch": float(pitch),
                        "roll": float(roll),
                    }
            except Exception as e:
                logger.warning(f"Error extrayendo pose del rostro: {e}")

            results.append({
                "embedding": emb,
                "bbox": bbox,
                "score": score,
                "thumbnail": thumbnail_b64,
                "pose": pose
            })
        return results


    def _create_thumbnail(self, frame, bbox: List[int]) -> Optional[str]:
        try:
            x1, y1, x2, y2 = bbox
            # Validar límites
            h, w = frame.shape[:2]
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(w, x2)
            y2 = min(h, y2)

            crop = frame[y1:y2, x1:x2]

            # Evitar errores si el recorte es muy pequeño
            if crop.size == 0:
                logger.warning("Thumbnail vacío para bbox %s", bbox)
                return None

            crop = cv2.resize(
                crop,
                (self.thumbnail_width, self.thumbnail_height),
                interpolation=cv2.INTER_AREA,
            )

            _, buffer = cv2.imencode(
                ".jpg",
                crop,
                [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality],
            )

            return base64.b64encode(buffer).decode("utf-8")
        except Exception as e:
            logger.error("Error creando thumbnail: %s", e)
            return None
