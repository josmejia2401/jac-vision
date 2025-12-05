import time
from typing import Optional, Dict, Any
import logging
import os
from .mp4_writer import MP4Writer
from ..detection.motion_detector import MotionDetector
from ...helpers.constants.constants import constants
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class RecorderManager:

    def __init__(self, camera_id: int):
        self.camera_id = camera_id
        self.idle_seconds = constants["INGEST_IDLE_ON_MOTION_SECONDS"]
        self.base_path = constants["STORAGE_BASE_PATH"]
        self.motion_detector = MotionDetector()
        self.writer: Optional[MP4Writer] = None
        self.recording: bool = False
        self.last_motion_ts: Optional[float] = None
        self.event_start_ts: Optional[float] = None
        self.current_file_path: Optional[str] = None
        self.movement_score: int = 0
        self.last_frame = None

    def handle_frame(self, frame, timestamp: float, fps: float, width: int, height: int) -> Optional[Dict[str, Any]]:
        now = timestamp or time.time()
        self.last_frame = frame
        movement = self.motion_detector.detect(frame)
        is_motion = movement and movement > 0.1

        if is_motion:
            return self._on_motion(frame, now, width, height, fps)

        return self._on_no_motion(now)

    def _on_motion(self, frame, now: float, width: int, height: int, fps: float):
        self.last_motion_ts = now
        self.movement_score += 1
        
        if not self.recording:
            logger.info("Motion detected — starting recording for camera %s", self.camera_id)
            try:
                self.writer = MP4Writer(base_path=self.base_path, camera_id=self.camera_id)
                self.current_file_path = self.writer.open(width, height, fps)
            except Exception as e:
                logger.error("Error creating writer for camera %s: %s", self.camera_id, e)
                self.writer = None
                return None

            self.recording = True
            self.event_start_ts = now
            self.movement_score = 1

        try:
            self.writer.write(frame)
        except Exception as e:
            logger.error("Error writing frame for camera %s: %s", self.camera_id, e)

        return None

    def _on_no_motion(self, now: float) -> Optional[Dict[str, Any]]:
        if not self.recording:
            return None

        if self.last_motion_ts is None:
            return None

        time_since_last_motion = now - self.last_motion_ts

        if time_since_last_motion < self.idle_seconds:
            try:
                if self.writer and self.last_frame is not None:
                    self.writer.write(self.last_frame)
            except Exception as e:
                logger.error("Error writing idle frame for camera %s: %s", self.camera_id, e)

            return None

        return self._close_recording(now)

    def _close_recording(self, end_ts: float) -> Dict[str, Any]:
        logger.info("Stopping recording after %s idle seconds for camera %s", self.idle_seconds, self.camera_id)
        try:
            file_path = self.writer.close() if self.writer else self.current_file_path
        except Exception as e:
            logger.error("Error closing MP4 file for camera %s: %s", self.camera_id, e)
            file_path = self.current_file_path
            
        duration = end_ts - (self.event_start_ts or end_ts)
        started_at_dt = (
            datetime.fromtimestamp(self.event_start_ts, tz=timezone.utc)
            if self.event_start_ts else None
        )
        ended_at_dt = datetime.fromtimestamp(end_ts, tz=timezone.utc)

        file_size = None
        if file_path and os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            
        content_type = "video/mp4"

        event = {
            "file_path": file_path,
            "started_at": started_at_dt,
            "ended_at": ended_at_dt,
            "duration_ms": float(duration * 1000),
            "movement_score": self.movement_score,
            "created_at": datetime.now(timezone.utc), 
            "file_size": file_size,
            "content_type": content_type
        }

        # Reset
        self.writer = None
        self.recording = False
        self.last_motion_ts = None
        self.event_start_ts = None
        self.current_file_path = None
        self.movement_score = 0
        self.last_frame = None

        return event
