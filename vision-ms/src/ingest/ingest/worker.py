from __future__ import annotations
import base64
import logging
import threading
import time
import cv2
from ..publishers.publisher import RabbitPublisher
from ..dto.ingest_dto import CameraConfig

logger = logging.getLogger(__name__)

class CameraWorker(threading.Thread):

    def __init__(self, config: CameraConfig) -> None:
        super().__init__(daemon=True)
        self.config = config
        self._stop_event = threading.Event()
        self._publisher = RabbitPublisher(config.amqp_url, config.exchange)

    def stop(self) -> None:
        logger.info("Stopping CameraWorker for camera %s", self.config.camera_id)
        self._stop_event.set()

    def is_stopped(self) -> bool:
        return self._stop_event.is_set()
    
    def is_int(self, value: str) -> bool:
        try:
            int(value)
            return True
        except ValueError:
            return False

    def run(self) -> None:
        camera_id = self.config.camera_id
        routing_key = f"camera.{camera_id}"
        cap = None
        
        logger.info("CameraWorker thread STARTED for camera %s (exchange=%s, routingKey=%s)", camera_id, self.config.exchange, routing_key)
        while not self._stop_event.is_set():
            try:
                if cap is None or not cap.isOpened():
                    logger.info("Camera %s: No active capture. Trying to open stream: %s", camera_id, self.config.rtsp_url)
                    
                    cap = self._open_capture()
                    if cap is None:
                        logger.warning("Camera %s: Failed to open stream. Retrying in %s seconds...", camera_id, self.config.reconnect_delay_seconds)
                        time.sleep(self.config.reconnect_delay_seconds)
                        continue

                    fps, width, height = self._read_video_properties(cap)
                    logger.info("Camera %s: Stream opened (fps=%s, resolution=%sx%s)", camera_id, fps, width, height)
                    first_frame_sent = False

                ok, frame = cap.read()
                if not ok or frame is None:
                    logger.warning("Camera %s: Frame read failed. Releasing and reconnecting.", camera_id)
                    cap.release()
                    cap = None
                    time.sleep(self.config.reconnect_delay_seconds)
                    continue

                frame_b64 = self._encode_frame(frame)
                if not frame_b64:
                    continue

                payload = self._build_payload(
                    camera_id=camera_id,
                    timestamp=time.time(),
                    frame_b64=frame_b64,
                    fps=fps,
                    width=width,
                    height=height,
                )

                self._publisher.publish(routing_key, payload)
                if not first_frame_sent:
                    first_frame_sent = True
                    logger.info("Camera %s: First frame published (payloadSize=%d bytes)", camera_id, len(frame_b64))

            except Exception as ex:
                logger.exception("Camera %s: Unexpected worker error: %s", camera_id, ex)
                if cap is not None:
                    cap.release()
                    cap = None
                time.sleep(self.config.reconnect_delay_seconds)

        if cap is not None:
            cap.release()
            logger.debug("Camera %s: VideoCapture released on shutdown.", camera_id)

        try:
            self._publisher.close()
        except Exception as e:
            logger.error("Camera %s: Error closing RabbitMQ publisher: %s", camera_id, e)

        logger.info("CameraWorker for camera %s STOPPED", camera_id)

    def _open_capture(self):
        logger.info("Opening RTSP for camera %s: %s", self.config.camera_id, self.config.rtsp_url)
        rtsp_url = int(self.config.rtsp_url) if self.is_int(self.config.rtsp_url) else self.config.rtsp_url
        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            logger.error("Failed to open RTSP stream for camera %s", self.config.camera_id)
            return None
        return cap
    
    def _read_video_properties(self, cap):
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        if width == 0 or height == 0:
            ok, frame = cap.read()
            if ok and frame is not None:
                height, width = frame.shape[:2]

        return fps, width, height
    
    def _encode_frame(self, frame):
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), int(self.config.jpeg_quality)]
        success, buf = cv2.imencode(".jpg", frame, encode_param)
        if not success:
            logger.warning("JPEG encode failed for camera %s", self.config.camera_id)
            return None
        return base64.b64encode(buf).decode("utf-8")
    
    def _build_payload(self, camera_id, timestamp, frame_b64, fps, width, height):
        return {
            "camera_id": camera_id,
            "user_id": self.config.user_id,
            "timestamp": timestamp,
            "frame": frame_b64,
            "fps": fps,
            "width": width,
            "height": height
        }




