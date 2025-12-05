from __future__ import annotations
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorDatabase
import asyncio
from ..helpers.dto.api_dto import ApiReqDTO
from ..ingest.ingest.manager import CameraManager
from ..face_recognition.messaging.rabbit_manager import FaceRecognitionRabbitManager
from ..recordings.messaging.rabbit_manager import RecordingRabbitManager
from ..face_recognition.recognition.face_engine import FaceEngine

class DefaultRouter:
    def __init__(self, db: AsyncIOMotorDatabase, engine: FaceEngine, main_loop: asyncio.AbstractEventLoop): 
        self.camera_manager = CameraManager()
        self.face_recognition_rm = FaceRecognitionRabbitManager(db=db, engine=engine, main_loop=main_loop)
        self.recording_rm = RecordingRabbitManager(db=db, main_loop=main_loop)
        self.router = APIRouter(prefix="/vision-services", tags=["Vision services"])
        self._register_routes()
        
    
    def stop_all(self):
        self.camera_manager.stop_all()
        self.face_recognition_rm.stop_all()
        self.recording_rm.stop_all()
        return {"message": "OK"}

    def _register_routes(self):

        @self.router.get("/health")
        def health():
            return {"status": "ok"}

        @self.router.post("/start")
        async def start(req: ApiReqDTO):
            self.camera_manager.start_camera(camera_id=req.cameraId, user_id=req.userId, rtsp_url=req.rtspUrl)
            self.face_recognition_rm.start(req=req)
            self.recording_rm.start(req=req)
            return {"id": req.cameraId, "message": "OK"}
        
        @self.router.post("/restart")
        async def restart(req: ApiReqDTO):
            self.camera_manager.restart_camera(camera_id=req.cameraId)
            self.face_recognition_rm.restart(req)
            self.recording_rm.restart(req=req)
            return {"id": req.cameraId, "message": "OK"}
        
        @self.router.post("/stop")
        async def stop(req: ApiReqDTO):
            self.camera_manager.stop_camera(camera_id=req.cameraId)
            self.face_recognition_rm.stop(req)
            self.recording_rm.stop_camera(req=req)
            return {"id": req.cameraId, "message": "OK"}
        
        @self.router.post("/stop-all")
        async def stop_all():
            self.camera_manager.stop_all()
            self.face_recognition_rm.stop_all()
            self.recording_rm.stop_all()
            return {"message": "OK"}
