from __future__ import annotations
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..face_registry.dto.person_dto import PersonDTO
from ..face_registry.services.person_service import PersonService
from ..face_recognition.recognition.face_engine import FaceEngine

class PersonRouter:
    def __init__(self, db: AsyncIOMotorDatabase, engine: FaceEngine): 
        self.person_service = PersonService(db=db, engine=engine)
        self.router = APIRouter(prefix="/person-services", tags=["Person services"])
        self._register_routes()
        
    def _register_routes(self):

        @self.router.get("/health")
        def health():
            return {"status": "ok"}

        @self.router.post("/")
        async def create(req: PersonDTO):
            res = await self.person_service.create(dto=req)
            return {"data": res, "message": "OK"}
        
        @self.router.put("/{person_id}")
        async def update(person_id: int, req: PersonDTO):
            res = await self.person_service.update(person_id=person_id, dto=req)
            return {"data": res, "message": "OK"}
        
        @self.router.get("/{user_id}")
        async def list_by_user(user_id: int):
            res = await self.person_service.list_by_user(user_id=user_id)
            return {"data": res, "message": "OK"}
        
        @self.router.delete("/{person_id}")
        async def delete(person_id: int):
            res = await self.person_service.delete(person_id==person_id)
            return {"data": res, "message": "OK"}
        
        @self.router.put("/{person_id}/embeddings")
        async def add_embeddings_from_bytes(person_id: int, file: UploadFile = File(...)):
            if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El archivo debe ser una imagen (jpg o png)",
                )
            file_bytes = await file.read()
            res = await self.person_service.add_embeddings_from_bytes(person_id=person_id, file_bytes=file_bytes)
            return {"data": res, "message": "OK"}
