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
    id: Optional[int]
    embedding: list[float]
    source: FaceSource
    cameraId: Optional[int]
    qualityScore: Optional[float]
    pose: Optional[PoseDTO] = None
    thumbnail: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    createdAt: datetime.datetime = field(default_factory=lambda: datetime.datetime.utcnow())

@dataclass
class PersonDTO:
    id: Optional[int]
    userId: Optional[int]
    displayName: Optional[str]
    tags: Optional[List[str]]
    riskLevel: RiskLevel
    metadata: Dict[str, Any] = field(default_factory=dict)
    embeddings: List[FaceEmbeddingDTO] = field(default_factory=list)
    createdAt: datetime.datetime = field(default_factory=lambda: datetime.datetime.utcnow())
