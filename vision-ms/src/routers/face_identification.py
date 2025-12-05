from __future__ import annotations
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..face_identification.dto.api_dto import FaceReqDTO
from ..face_identification.messaging.rabbit_manager import RabbitManager

class FaceIdentificationRouter:
    def __init__(self, settings: dict, db: AsyncIOMotorDatabase): 
        self.settings = settings
        self.manager = RabbitManager(settings=settings, db=db)
        self.router = APIRouter(prefix="/faces-identification", tags=["Faces Identification"])
        self._register_routes()

    def _register_routes(self):

        @self.router.get("/health")
        def health():
            return {"status": "ok"}

        @self.router.post("/start")
        async def start(dto: FaceReqDTO):
            self.manager.start(dto)
            return {"id": dto.cameraId, "message": "OK"}
        
        @self.router.post("/restart")
        async def restart(dto: FaceReqDTO):
            self.manager.restart(dto)
            return {"id": dto.cameraId, "message": "OK"}
        
        @self.router.post("/stop")
        async def stop(dto: FaceReqDTO):
            self.manager.stop(dto)
            return {"id": dto.cameraId, "message": "OK"}
        
        @self.router.post("/stop-all")
        async def stop_all():
            self.manager.stop_all()
            return {"message": "OK"}
