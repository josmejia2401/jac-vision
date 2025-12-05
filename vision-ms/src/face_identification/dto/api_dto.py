from typing import Optional
from dataclasses import dataclass

@dataclass
class FaceReqDTO:
    userId: Optional[int]
    cameraId: Optional[int]