from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from ...helpers.utils.enums import RiskLevel, FaceSource

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
    createdAt: str
    qualityScore: float
    pose: Optional[PoseDTO] = None
    thumbnail: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PersonDTO:
    id: Optional[int]
    userId: int
    displayName: str
    tags: Optional[List[str]]
    riskLevel: RiskLevel
    metadata: Dict[str, Any] = field(default_factory=dict)
    embeddings: List[FaceEmbeddingDTO] = field(default_factory=list)
    createdAt: str
