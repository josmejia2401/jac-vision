from typing import Optional
from dataclasses import dataclass

@dataclass
class CameraConfig:
    camera_id: Optional[int]
    user_id: Optional[int]
    rtsp_url: str
    amqp_url: str
    exchange: str
    jpeg_quality: int
    reconnect_delay_seconds: int
    frame_width: int
    frame_height: int
    
    