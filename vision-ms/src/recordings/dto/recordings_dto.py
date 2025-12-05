from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime
import time
from enum import Enum

class RecordingStatus(str, Enum):
    READY = "READY"
    PROCESSING = "PROCESSING"
    FAILED = "FAILED"
    DELETED = "DELETED"

@dataclass
class RecordingDTO:
    id: Optional[int] = None
    userId: Optional[int] = None
    cameraId: str = ""
    filePath: str = ""

    contentType: Optional[str] = None
    fileSize: Optional[int] = None

    durationMs: float = 0.0

    startedAt: Optional[datetime] = None
    endedAt: Optional[datetime] = None

    status: RecordingStatus = RecordingStatus.READY
    
    movementScore: Optional[int] = None

    createdAt: float = field(default_factory=lambda: time.time())
