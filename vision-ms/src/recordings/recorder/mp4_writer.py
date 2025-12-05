import os
from datetime import datetime
import cv2
import logging

logger = logging.getLogger(__name__)

class MP4Writer:

    def __init__(self, base_path: str, camera_id: int):
        self.base_path = base_path
        self.camera_id = camera_id
        self.writer = None
        self.path = None

    def open(self, width: int, height: int, fps: int) -> str:
        root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        date_path = datetime.utcnow().strftime("%Y/%m/%d")
        folder = os.path.join(root, self.base_path, str(self.camera_id), date_path)
        os.makedirs(folder, exist_ok=True)

        filename = datetime.utcnow().strftime("%H%M%S_event.mp4")
        self.path = os.path.join(folder, filename)
        logger.info(f"Ruta final del video: ${self.path}")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        self.writer = cv2.VideoWriter(self.path, fourcc, fps, (width, height), isColor=True)
        
        if not self.writer.isOpened():
            raise RuntimeError(f"No se pudo abrir el archivo MP4 para escritura: {self.path}")

        return self.path

    def write(self, frame):
        if self.writer is None:
            raise RuntimeError("Writer no ha sido inicializado. Debes llamar a open() antes.")

        self.writer.write(frame)

    def close(self) -> str | None:
        if self.writer is not None:
            self.writer.release()
            self.writer = None

        return self.path
