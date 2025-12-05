from enum import Enum

class RiskLevel(str, Enum):
    NORMAL = "NORMAL"
    DANGEROUS = "DANGEROUS"
    HIGH = "HIGH"
    UNKNOWN = "UNKNOWN"

class FaceSource(str, Enum):
    CAMERA = "CAMERA"
    MANUAL_UPLOAD = "MANUAL_UPLOAD"
    ARCHIVE = "ARCHIVE"
