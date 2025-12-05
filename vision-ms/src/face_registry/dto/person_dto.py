from typing import List, Optional, Dict
from dataclasses import dataclass, field
from ...helpers.utils.enums import RiskLevel, FaceSource

@dataclass
class FaceEmbeddingDTO:
    id: Optional[int]
    embedding: list[float]
    source: FaceSource
    cameraId: Optional[int]
    createdAt: str
    qualityScore: float
    thumbnail: Optional[str] = None

@dataclass
class PersonDTO:
    id: Optional[int]
    userId: int
    displayName: str
    tags: Optional[List[str]]
    riskLevel: RiskLevel
    metadata: Dict[str, str]
    embeddings: List[FaceEmbeddingDTO] = field(default_factory=list)
