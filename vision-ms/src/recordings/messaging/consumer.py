from __future__ import annotations
import base64
import json
import logging
import threading
import cv2
import numpy as np
import pika
import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..dto.recordings_dto import RecordingDTO, RecordingStatus
from ..services.recordings_service import RecordingsService
from ..recorder.recorder_manager import RecorderManager
from ...helpers.constants.constants import constants

logger = logging.getLogger(__name__)

class VideoConsumer(threading.Thread):

    def __init__(self, camera_id: int, db: AsyncIOMotorDatabase, main_loop: asyncio.AbstractEventLoop):
        super().__init__(daemon=True)
        self.camera_id = camera_id
        # Servicios
        self._main_loop: asyncio.AbstractEventLoop = main_loop
        self._recordings_service = RecordingsService(db=db)
        self._recorder = RecorderManager(camera_id=camera_id)
        # Flag de parada del thread
        self._stop_flag = threading.Event()
        # RabbitMQ
        self._amqp_url = constants["AMQP_URL"]
        self._exchange = constants["AMQP_EXCHANGE"]
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[pika.adapters.blocking_connection.BlockingChannel] = None

    def stop(self):
        self._stop_flag.set()

    def connect(self) -> None:
        if self._connection and self._connection.is_open:
            return

        logger.info("VideoConsumer %s conectando a RabbitMQ %s", self.camera_id, self._amqp_url)

        params = pika.URLParameters(self._amqp_url)
        params.heartbeat = 30
        params.blocked_connection_timeout = 30
        params.socket_timeout = 30
        params.connection_attempts = 5
        params.retry_delay = 5
        params.port = 5672

        self._connection = pika.BlockingConnection(params)
        self._channel = self._connection.channel()

        logger.info("Conectado a RabbitMQ %s", self._amqp_url)

    def run(self):
        logger.info("VideoConsumer started for camera %s", self.camera_id)
        self.connect()

        queue_name = f"video-archive.{self.camera_id}"

        self._channel.exchange_declare(
            exchange=self._exchange,
            exchange_type="topic",
            durable=True
        )
        self._channel.queue_declare(queue=queue_name, durable=True)
        self._channel.queue_bind(
            exchange=self._exchange,
            queue=queue_name,
            routing_key=f"camera.{self.camera_id}",
        )

        def callback(ch, method, properties, body):
            if self._stop_flag.is_set():
                ch.basic_cancel(consumer_tag=self.camera_id)
                return
            try:
                msg = json.loads(body)
                frame_b64 = msg["frame"]
                timestamp = float(msg.get("timestamp", 0))
                camera_id = msg["camera_id"]
                user_id = msg["user_id"]
                fps = msg["fps"]
                width = msg["width"]
                height = msg["height"]

                frame_bytes = base64.b64decode(frame_b64)
                arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if frame is None:
                    logger.warning("Frame inválido recibido en camera %s", self.camera_id)
                    return

                event = self._recorder.handle_frame(frame, timestamp, fps, width, height)
                if event:  
                    recording = RecordingDTO(
                        userId=user_id,
                        cameraId=camera_id,
                        filePath=event["file_path"],
                        contentType=event["content_type"],
                        fileSize=event["file_size"],
                        durationMs=event["duration_ms"],
                        startedAt=event["started_at"],
                        endedAt=event["ended_at"],
                        status=RecordingStatus.READY,
                        movementScore=event["movement_score"],
                        createdAt=event["created_at"],
                    )
                    try:
                        self._main_loop.call_soon_threadsafe(
                            asyncio.create_task,
                            self._recordings_service.create(recording)
                        )
                        logger.info(f"Evento guardado en Mongo: {recording}")
                    except Exception as e:
                        logger.exception("Error guardando en Mongo: %s", e)
                    
                    ch.basic_ack(delivery_tag=method.delivery_tag)

            except Exception as e:
                logger.exception("Error processing message for camera %s: %s", self.camera_id, e)

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

            logger.info("VideoConsumer stopped for camera %s", self.camera_id)
        
        return
