from __future__ import annotations
import logging
from typing import Dict, Optional
import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase
from .consumer import VideoConsumer
from ...helpers.dto.api_dto import ApiReqDTO

logger = logging.getLogger(__name__)

class RecordingRabbitManager:

    def __init__(self, db: AsyncIOMotorDatabase, main_loop: asyncio.AbstractEventLoop):
        self.db = db
        self.consumers: Dict[int, VideoConsumer] = {}
        self.main_loop: asyncio.AbstractEventLoop = main_loop

    def is_running(self, camera_id: int) -> bool:
        consumer = self.consumers.get(camera_id)
        if consumer is None:
            return False

        if not consumer.is_alive():
            del self.consumers[camera_id]
            return False

        return True

    def _safe_stop(self, consumer: VideoConsumer):
        try:
            consumer.stop()
            consumer.join(timeout=2)
            del self.consumers[consumer.camera_id]
        except Exception as e:
            logger.error("Error stopping consumer: %s", e)

    def start(self, req: ApiReqDTO):
        if req.cameraId in self.consumers and self.is_running(req.cameraId ):
            logger.warning("Consumer for camera %s already running.", req.cameraId )
            return

        logger.info("Starting consumer for camera %s …", req.cameraId )
        
        consumer = VideoConsumer(camera_id=req.cameraId, db=self.db, main_loop=self.main_loop)
        try:
            consumer.start()
            self.consumers[req.cameraId ] = consumer
            logger.info("Consumer for camera %s started.", req.cameraId )
        except Exception as e:
            logger.error("Failed to start consumer for camera %s: %s", req.cameraId , e)

    def stop(self, req: ApiReqDTO):
        consumer = self.consumers.get(req.cameraId)
        if not consumer:
            logger.warning("No consumer found for camera %s", req.cameraId)
            return

        logger.info("Stopping consumer for camera %s …", req.cameraId)
        self._safe_stop(consumer)

        del self.consumers[req.cameraId]
        logger.info("Consumer for camera %s stopped.", req.cameraId)

    def restart(self, req: ApiReqDTO):
        logger.info("Restarting consumer for camera %s …", req.cameraId)
        self.stop(req.cameraId)
        self.start(req.cameraId)
        logger.info("Consumer for camera %s restarted.", req.cameraId)

    def status(self, req: ApiReqDTO) -> Optional[str]:
        if req.cameraId not in self.consumers:
            return "NOT_STARTED"

        return "RUNNING" if self.is_running(req.cameraId) else "STOPPED"

    def stop_all(self):
        logger.info("Stopping all consumers …")
        for cam_id, consumer in list(self.consumers.items()):
            self._safe_stop(consumer)
            logger.info("Consumer for camera %s stopped.", cam_id)

        self.consumers.clear()
        logger.info("All consumers stopped.")
