from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
from ..ingest.dto.camera_dto import IngestReq, IngestRes
from ..ingest.ingest.manager import CameraManager
from ..utils.metrics import metrics

class CamerasRouter:
    def __init__(self, settings: dict):
        self.settings = settings
        self.manager = CameraManager(settings)
        self.router = APIRouter(prefix="/ingest", tags=["Cameras"])
        self._register_routes()

    def _register_routes(self):

        @self.router.get("/health")
        def health():
            return {"status": "ok"}

        @self.router.get("/metrics")
        def get_metrics():
            return metrics.snapshot()
        
        @self.router.get("/status", response_model=List[IngestRes])
        def cameras_status():
            status = self.manager.status()
            return [
                IngestRes(
                    camera_id=info["camera_id"],
                    running=info["running"],
                    rtsp_url=info["rtsp_url"],
                )
                for info in status.values()
            ]

        @self.router.post("/cameras/start")
        def start_camera(req: IngestReq):
            try:
                self.manager.start_camera(
                    camera_id=req.camera_id,
                    user_id=req.user_id,
                    rtsp_url=req.rtsp_url
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
            return {"message": f"Camera {req.camera_id} started"}

        @self.router.post("/cameras/{camera_id}/stop")
        def stop_camera(camera_id: str):
            try:
                self.manager.stop_camera(camera_id)
            except KeyError as e:
                raise HTTPException(status_code=404, detail=str(e))
            return {"message": f"Camera {camera_id} stopped"}

