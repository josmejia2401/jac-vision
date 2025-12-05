from typing import Optional
from dataclasses import dataclass

@dataclass
class ApiReqDTO:
    userId: Optional[int]
    cameraId: Optional[int]
    rtspUrl: Optional[str]