from __future__ import annotations
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..dto.recordings_dto import RecordingDTO
from ..repository.recordings_repository import RecordingRepository

logger = logging.getLogger(__name__)

class NotFoundException(Exception):
    pass

class RecordingsService:

    def __init__(self, db: AsyncIOMotorDatabase):
        self._repo = RecordingRepository(db)
        logger.info("RecordingsService inicializado con RecordingRepository")

    async def create(self, dto: RecordingDTO) -> int:
        logger.info("Service: creando grabación...")
        new_id = await self._repo.create(dto=dto)
        logger.info(f"Service: grabación creada con ID={new_id}")
        return new_id

    async def get(self, id: int) -> RecordingDTO | None:
        logger.info(f"Service: obteniendo grabación ID={id}")
        recording = await self._repo.get(id)
        if not recording:
            logger.warning(f"Service: grabación ID={id} no encontrada")
            return None
        return recording

    async def list(self) -> list[RecordingDTO]:
        logger.info("Service: listando grabaciones...")
        return await self._repo.list()

    async def update(self, id: int, dto: RecordingDTO) -> RecordingDTO:
        logger.info(f"Service: actualizando grabación ID={id}")
        
        updated = await self._repo.update(id, dto)

        if not updated:
            logger.warning(f"Service: intento de actualizar ID={id}, pero no existe")
            raise NotFoundException(f"Recording {id} not found")

        logger.info(f"Service: grabación ID={id} actualizada")
        return updated

    async def update_field(self, id: int, field: str, value):
        logger.info(f"Service: actualizando campo '{field}' en grabación ID={id}")

        updated = await self._repo.update_field(id, field, value)

        if not updated:
            logger.warning(f"Service: intento de actualizar campo en ID={id}, pero no existe")
            raise NotFoundException(f"Recording {id} not found")

        logger.info(f"Service: campo '{field}' actualizado en grabación ID={id}")
        return updated

    async def delete(self, id: int) -> bool:
        logger.info(f"Service: intentando eliminar grabación ID={id}")

        deleted = await self._repo.delete(id)

        if not deleted:
            logger.warning(f"Service: no se pudo eliminar ID={id} — no existe")
            raise NotFoundException(f"Recording {id} not found")

        logger.info(f"Service: grabación ID={id} eliminada correctamente")
        return True

    async def list_by_user(self, user_id: int) -> list[RecordingDTO]:
        logger.info(f"Service: listando grabaciones del usuario ID={user_id}")
        return await self._repo.list_by_user(user_id)
