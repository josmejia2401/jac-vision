from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.server_api import ServerApi
import asyncio
import uvicorn
import logging
from .routers.default_router import DefaultRouter
from .routers.people_router import PersonRouter
from .helpers.utils.logger import configure_logging
from .face_registry.recognition.face_engine import FaceEngine
from .helpers.constants.constants import constants

logger = logging.getLogger(__name__)

async def init_mongo() -> AsyncIOMotorDatabase:
    uri = constants["DATABASE_URL"]
    db_name = constants["DATABASE_NAME"]
    
    logger.info(f"Connecting to {uri}")
        
    client = AsyncIOMotorClient(
        uri,
        server_api=ServerApi("1"),
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db = client[db_name]

    await db.command("ping")
    logger.info("[Mongo] Connected.")

    return db

def create_app() -> FastAPI:
    
    configure_logging()
    app = FastAPI(title="Camera Ingest Service", version="0.1.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting service...")
        db: AsyncIOMotorDatabase = await init_mongo()
        app.state.db = db
        logger.info("Mongo initialized.")
        engine = FaceEngine()
        app.state.loop = asyncio.get_running_loop()
        
        app.state.default_router = DefaultRouter(db=db, engine=engine, main_loop=app.state.loop)
        app.state.person_router = PersonRouter(db=db, engine=engine)
        app.include_router(app.state.default_router.router)
        app.include_router(app.state.person_router.router)
        logger.info("Routers initialized.")
        
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down service...")

        if hasattr(app.state, "default_router"):
            app.state.default_router.stop_all()
            logger.info("Stopped all workers.")

        if hasattr(app.state, "mongo_client"):
            app.state.db.close()
            logger.info("MongoDB connection closed.")

        logger.info("Shutdown complete.")

    return app

def run():
    try:
        app = create_app()
        host = constants["SERVER_HOST"]
        port = constants["SERVER_PORT"]
        uvicorn.run(app, host=host, port=port)
    except KeyboardInterrupt as e:
        logger.error(e)

if __name__ == "__main__":
    run()
