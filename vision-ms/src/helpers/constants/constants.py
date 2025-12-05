import os
from dotenv import load_dotenv
load_dotenv()

constants = {
    "DATABASE_URL": os.getenv("DATABASE_URL"),
    "DATABASE_NAME": os.getenv("DATABASE_NAME"),

    "REDIS_URL": os.getenv("REDIS_URL"),
    "REDIS_USER": os.getenv("REDIS_USER"),
    "REDIS_PASSWORD": os.getenv("REDIS_PASSWORD"),
    "REDIS_USE_TLS": os.getenv("REDIS_USE_TLS"),

    "JWT_SECRET_VALUE": os.getenv("JWT_SECRET_VALUE"),
    "JWT_TOKEN_LIFE": os.getenv("JWT_TOKEN_LIFE"),

    "SESSION_SECRET": os.getenv("SESSION_SECRET"),

    "NODE_ENV": os.getenv("NODE_ENV", "dev"),
    "APP_NAME": os.getenv("APP_NAME"),
    "LOGGER_LEVEL": os.getenv("LOGGER_LEVEL"), 
    "ENVIRONMENT": os.getenv("ENVIRONMENT", "dev"),

    "PORT": int(os.getenv("PORT", 3030)),
    "SERVER_HOST": os.getenv("SERVER_HOST", "0.0.0.0"),
    "SERVER_PORT": int(os.getenv("SERVER_PORT", 3030)),

    "RATE_LIMIT_WINDOW_MS": int(os.getenv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000)),
    "RATE_LIMIT_MAX": int(os.getenv("RATE_LIMIT_MAX", 300)),

    "STORAGE_BASE_PATH": os.getenv("STORAGE_BASE_PATH"),
    "DIR_LOGGER": os.getenv("DIR_LOGGER"),
    
    "INGEST_JPEG_QUALITY": int(os.getenv("INGEST_JPEG_QUALITY", 80)),
    "INGEST_RECONNECT_DELAY_SECONDS": int(os.getenv("INGEST_RECONNECT_DELAY_SECONDS", 5)),
    "INGEST_THUMBNAIL_WIDTH": int(os.getenv("INGEST_THUMBNAIL_WIDTH", 150)),
    "INGEST_THUMBNAIL_HEIGHT": int(os.getenv("INGEST_THUMBNAIL_HEIGHT", 150)),
    "INGEST_IDLE_ON_MOTION_SECONDS": int(os.getenv("INGEST_IDLE_ON_MOTION_SECONDS", 30)),
    
    "AMQP_EXCHANGE": os.getenv("AMQP_EXCHANGE"),
    "AMQP_URL": os.getenv("AMQP_URL"),
}
