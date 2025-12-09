from __future__ import annotations
import logging
import threading
from typing import Dict
from .worker import CameraWorker
from ..dto.ingest_dto import CameraConfig
from ...helpers.constants.constants import constants

logger = logging.getLogger(__name__)

class CameraManager:

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._workers: Dict[int, CameraWorker] = {}
        self._rtsp_urls: Dict[int, str] = {}
        logger.info("CameraManager initialized")

    def start_camera(self, camera_id: int, user_id: int, rtsp_url: str) -> None:
        logger.debug("Request to START camera '%s' with RTSP='%s', user_id=%s", camera_id, rtsp_url, user_id)

        with self._lock:

            if not rtsp_url.startswith("rtsp://"):
                logger.warning("RTSP URL may be invalid: %s", rtsp_url)

            if camera_id in self._workers and self._workers[camera_id].is_alive():
                logger.warning("Camera '%s' is already running.", camera_id)
                raise ValueError(f"Camera {camera_id} is already running")

            cfg = CameraConfig(
                user_id=user_id,
                camera_id=camera_id,
                rtsp_url=rtsp_url,
                amqp_url=constants["AMQP_URL"],
                exchange=constants["AMQP_EXCHANGE"],
                jpeg_quality=constants["INGEST_JPEG_QUALITY"],
                reconnect_delay_seconds=constants["INGEST_RECONNECT_DELAY_SECONDS"],
                frame_width=constants["INGEST_VIDEO_WIDTH"],
                frame_height=constants["INGEST_VIDEO_HEIGHT"]
            )

            logger.debug("CameraConfig generated: %s", cfg)

            worker = CameraWorker(cfg)
            self._workers[cfg.camera_id] = worker
            self._rtsp_urls[cfg.camera_id] = cfg.rtsp_url

            logger.info("Starting CameraWorker thread for camera '%s'...", cfg.camera_id)
            worker.start()
            logger.info("Camera '%s' has started successfully.", cfg.camera_id)

    def stop_camera(self, camera_id: str) -> None:
        logger.debug("Request to STOP camera '%s'", camera_id)

        with self._lock:
            worker = self._workers.get(camera_id)

            if worker is None:
                logger.error("Camera '%s' not found when trying to stop.", camera_id)
                raise KeyError(f"Camera {camera_id} not found")

            logger.info("Stopping camera '%s'...", camera_id)
            worker.stop()

            # Limpieza
            self._workers.pop(camera_id, None)
            self._rtsp_urls.pop(camera_id, None)

            logger.info("Camera '%s' stopped successfully.", camera_id)

    def status(self) -> dict:
        with self._lock:
            status = {
                camera_id: {
                    "camera_id": camera_id,
                    "running": worker.is_alive(),
                    "rtsp_url": self._rtsp_urls.get(camera_id, ""),
                }
                for camera_id, worker in self._workers.items()
            }

        logger.debug("CameraManager status requested: %s", status)
        return status
    
    def restart_camera(self, camera_id: str) -> None:
        self.stop_camera(camera_id=camera_id)
        self.start_camera(camera_id=camera_id)

    def stop_all(self) -> None:
        logger.info("Request received to STOP ALL cameras.")

        with self._lock:
            if not self._workers:
                logger.info("No cameras running. Nothing to stop.")
                return

            total = len(self._workers)
            logger.info("Stopping ALL %d active cameras...", total)

            # Copia para evitar cambios mientras iteramos
            camera_ids = list(self._workers.keys())

            for camera_id in camera_ids:
                worker = self._workers[camera_id]
                logger.debug("Stopping worker for camera '%s'...", camera_id)
                worker.stop()

            # Limpieza global
            self._workers.clear()
            self._rtsp_urls.clear()

        logger.info("All %d cameras have been stopped successfully.", total)
