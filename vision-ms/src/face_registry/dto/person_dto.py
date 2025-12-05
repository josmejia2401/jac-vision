from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from ...helpers.utils.enums import RiskLevel, FaceSource
import datetime

@dataclass
class PoseDTO:
    yaw: Optional[float]
    pitch: Optional[float]
    roll: Optional[float]
    
@dataclass
class FaceExtractedDTO:
    embedding: List[float]
    bbox: List[int]
    score: float
    thumbnail: Optional[str]
    pose: Optional[PoseDTO]
    
@dataclass
class FaceEmbeddingDTO:
    source: FaceSource
    embedding: Optional[list[float]] = field(default_factory=list)
    id: Optional[int] = None
    cameraId: Optional[int] = 0
    qualityScore: Optional[float] = 0
    pose: Optional[PoseDTO] = None
    thumbnail: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    createdAt: datetime.datetime = field(default_factory=lambda: datetime.datetime.utcnow())

@dataclass
class PersonDTO:
    riskLevel: RiskLevel
    id: Optional[int] = 0
    userId: Optional[int] = 0
    displayName: Optional[str] = None
    tags: Optional[List[str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    #embeddings: List[FaceEmbeddingDTO] = field(default_factory=list)
    embeddings: Dict[str, List[FaceEmbeddingDTO]] = field(
        default_factory=lambda: {"manual": [], "auto": []}
    )
    createdAt: datetime.datetime = field(default_factory=lambda: datetime.datetime.utcnow())
