import logging
from dataclasses import asdict, Optional
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from ..dto.person_dto import PersonDTO, FaceEmbeddingDTO, RiskLevel, FaceSource
from ...helpers.utils.utils import generate_unique_number

logger = logging.getLogger(__name__)

class PersonRepository:

    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["vision_persons"]
        logger.info("PersonRepository inicializado con colección 'vision_persons'")


    async def create(self, dto: PersonDTO) -> int:
        logger.info("Creando nueva registro...")
        try:
            doc = asdict(dto)
            new_id = generate_unique_number()
            doc["_id"] = new_id
            doc.pop("id", None)
            await self.col.insert_one(doc)
            logger.info(f"Registro creada con ID={new_id}")
            return new_id
        except Exception as e:
            logger.exception(f"Error creando el registro: {e}")
            raise e

    async def get(self, id: int) -> Optional[PersonDTO]:
        logger.debug(f"Obteniendo el registro ID={id}")
        doc = await self.col.find_one({"_id": id})
        if not doc:
            logger.warning(f"ID={id} no encontrada")
            return None
        return self._to_dto(doc)

    async def list(self) -> List[PersonDTO]:
        cursor = self.col.find({})
        out = [self._to_dto(doc) async for doc in cursor]
        return out

    async def update(self, id: int, dto: PersonDTO) -> Optional[PersonDTO]:
        logger.info(f"Actualizando ID={id}")
        try:
            data = asdict(dto)
            data.pop("id", None)            
            result = await self.col.find_one_and_update(
                {"_id": id},
                {"$set": data},
                upsert=False,
                return_document=ReturnDocument.AFTER
            )
            return self._to_dto(result) if result else None
        except Exception as e:
            logger.exception(f"Error actualizando el registro ID={id}: {e}")
            raise e
        
    async def update_field(self, id: int, field: str, value) -> Optional[PersonDTO]:
        try:
            result = await self.col.find_one_and_update(
                {"_id": id},
                {"$set": {field: value}},
                upsert=False,
                return_document=ReturnDocument.AFTER
            )
            return self._to_dto(result) if result else None
        except Exception as e:
            logger.exception(f"Error actualizando campo '{field}' para el ID {id}: {e}")
            raise e

    async def delete(self, id: int) -> bool:
        result = await self.col.delete_one({"_id": id})
        return result.deleted_count > 0

    async def list_by_user(self, user_id: int) -> list[PersonDTO]:
        cursor = self.col.find({"userId": user_id})
        return [self._to_dto(doc) async for doc in cursor]

    async def add_embedding(self, person_id: int, embedding: FaceEmbeddingDTO) -> Optional[FaceEmbeddingDTO]:
        embedding.id = generate_unique_number()
        result = await self.col.update_one(
            {"_id": person_id},
            {"$push": {"embeddings": asdict(embedding)}}
        )
        if not result:
            return None
        return embedding
    
    async def add_embeddings(self, person_id: int, embeddings: list[FaceEmbeddingDTO]) -> Optional[List[FaceEmbeddingDTO]]:
        for emb in embeddings:
            emb.id = generate_unique_number()
        payload = [asdict(emb) for emb in embeddings]
        result = await self.col.update_one(
            {"_id": person_id},
            {"$push": {"embeddings": {"$each": payload}}}
        )

        if not result:
            return None

        return embeddings

    def _to_dto(self, doc) -> PersonDTO:
        embeddings = []
        for e in doc.get("embeddings", []):
            embeddings.append(
                FaceEmbeddingDTO(
                    id=e.get("id"),
                    embedding=e.get("embedding", []),
                    source=FaceSource(e.get("source", FaceSource.CAMERA.value)),
                    cameraId=e.get("cameraId"),
                    createdAt=e.get("createdAt"),
                    qualityScore=e.get("qualityScore", 0.0),
                    thumbnail=e.get("thumbnail"),
                    metadata=e.get("metadata", {}),
                )
            )

        return PersonDTO(
            id=doc["_id"],
            userId=doc["userId"],
            displayName=doc["displayName"],
            tags=doc.get("tags", []),
            riskLevel=RiskLevel(doc["riskLevel"]),
            metadata=doc.get("metadata", {}),
            embeddings=embeddings,
        )
