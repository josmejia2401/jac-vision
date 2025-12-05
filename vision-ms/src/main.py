from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pathlib
import yaml
from functools import lru_cache
import uvicorn
import logging
from pymongo.server_api import ServerApi

from .routers.ingest_router import CamerasRouter
from .routers.face_registry_router import FaceRegistryRouter
from .routers.recordings_router import RecordingRouter
from .routers.face_identification import FaceIdentificationRouter

from .utils.logger import configure_logging
logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def load_settings() -> dict:
    base_dir = pathlib.Path(__file__).resolve().parent
    config_path = base_dir / "config" / "settings.yml"
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

async def init_mongo(settings: dict) -> AsyncIOMotorDatabase:
    uri = settings["mongodb"]["uri"]
    db_name = settings["mongodb"]["db_name"]
    
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
    settings = load_settings()

    app = FastAPI(
        title="Camera Ingest Service (RabbitMQ)",
        version="0.1.0"
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # STARTUP EVENT
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting service...")
        
        #client = MongoClient("mongodb+srv://db_user:KMnpu5CSGuZ12gFb@jacdb.gin66tb.mongodb.net/?appName=jacdb&retryWrites=true&w=majority", server_api=ServerApi('1'), tls=True, tlsAllowInvalidCertificates=True)
        #print(client.list_database_names())

        db: AsyncIOMotorDatabase = await init_mongo(settings)
        app.state.db = db
        logger.info("Mongo initialized.")
        
        app.state.camera_router = CamerasRouter(settings)
        app.state.face_router = FaceRegistryRouter(settings, db=db)
        app.state.recording_router = RecordingRouter(settings, db=db)
        app.state.faces_identification_router =FaceIdentificationRouter(settings, db=db)

        app.include_router(app.state.camera_router.router)
        app.include_router(app.state.face_router.router)
        app.include_router(app.state.recording_router.router)
        app.include_router(app.state.faces_identification_router.router)

        logger.info("Routers initialized.")
        
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down service...")

        # detener todas las cámaras
        if hasattr(app.state, "camera_router"):
            app.state.camera_router.manager.stop_all()
            logger.info("Stopped all camera workers.")
            
        if hasattr(app.state, "recording_router"):
            app.state.recording_router.manager.stop_all()
            logger.info("Stopped all recordings workers.")
            
        if hasattr(app.state, "faces_identification_router"):
            app.state.faces_identification_router.manager.stop_all()
            logger.info("Stopped all faces identification workers.")

        # cerrar mongo
        if hasattr(app.state, "mongo_client"):
            app.state.db.close()
            logger.info("MongoDB connection closed.")

        logger.info("Shutdown complete.")

    return app

def run():
    try:
        app = create_app()
        settings = load_settings()
        host = settings.get("app", {}).get("host", "0.0.0.0")
        port = int(settings.get("app", {}).get("port", 9090))
        uvicorn.run(app, host=host, port=port)
    except KeyboardInterrupt as e:
        logger.error(e)
    except:
        pass

if __name__ == "__main__":
    run()
