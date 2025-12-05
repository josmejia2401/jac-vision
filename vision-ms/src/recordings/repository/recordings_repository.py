from __future__ import annotations
import logging
from dataclasses import asdict
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from typing import Any
from ..dto.recordings_dto import RecordingDTO
from ...helpers.utils.utils import generate_unique_number

logger = logging.getLogger(__name__)

class RecordingRepository:

    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["vision_recordings"]
        logger.info("RecordingRepository inicializado con colección 'vision_recordings'")

    async def create(self, dto: RecordingDTO) -> int:
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

    async def get(self, id: int) -> Optional[RecordingDTO]:
        logger.debug(f"Obteniendo el registro ID={id}")
        doc = await self.col.find_one({"_id": id})
        if not doc:
            logger.warning(f"ID={id} no encontrada")
            return None
        return self._to_dto(doc)

    async def list(self) -> List[RecordingDTO]:
        cursor = self.col.find({})
        out = [self._to_dto(doc) async for doc in cursor]
        return out

    async def update(self, id: int, dto: RecordingDTO) -> Optional[RecordingDTO]:
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
        
    async def update_field(self, id: int, field: str, value) -> Optional[RecordingDTO]:
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

    async def list_by_user(self, user_id: int) -> list[RecordingDTO]:
        cursor = self.col.find({"userId": user_id})
        return [self._to_dto(doc) async for doc in cursor]

    def _to_dto(self, doc) -> RecordingDTO:
        return RecordingDTO(
            id=doc["_id"],
            userId=doc["userId"],
            cameraId=doc["cameraId"],
            filePath=doc["filePath"],
            startTimestamp=doc["startTimestamp"],
            endTimestamp=doc["endTimestamp"],
            durationSec=doc["durationSec"],
            movementScore=doc["movementScore"],
            createdAt=doc["createdAt"],
        )
