from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..face_registry.dto.person_dto import PersonDTO
from ..face_registry.services.person_service import PersonService


class FaceRegistryRouter:
    def __init__(self, settings: dict, db: AsyncIOMotorDatabase): 
        self.settings = settings
        self.service = PersonService(db, settings)
        self.router = APIRouter(prefix="/faces-registry", tags=["Faces Registry"])
        self._register_routes()

    def _register_routes(self):

        @self.router.get("/health")
        def health():
            return {"status": "ok"}

        @self.router.post("/persons")
        async def create_person(dto: PersonDTO):
            new_id = await self.service.create(dto)
            return {"id": new_id}
        
        @self.router.get("/persons")
        async def list_persons():
            return await self.service.list()
        
        @self.router.get("/persons/{person_id}")
        async def get_person(person_id: int):
            p = await self.service.get(person_id)
            if not p:
                raise HTTPException(404, "Person not found")
            return p
        
        @self.router.put("/persons/{person_id}")
        async def update_person(person_id: int, dto: PersonDTO):
            await self.service.update(person_id, dto)
            return {"status": "ok"}

        @self.router.delete("/persons/{person_id}")
        async def delete_person(person_id: int):
            await self.service.delete(person_id)
            return {"status": "deleted"}

        @self.router.post("/persons/{person_id}/photo")
        async def upload_face(person_id: int, file: UploadFile = File(...)):
            img_bytes = await file.read()
            embeddings = await self.service.add_embeddings_from_bytes(person_id, img_bytes)
            return {
                "createdEmbeddings": embeddings
            }
