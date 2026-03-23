from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Event Booking System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "event_booking_system"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # SMTP (Email) - Gmail FREE
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""  # Use App Password from Google Account

    # Google Gemini API (FREE!)
    GEMINI_API_KEY: str = ""  # Get from https://makersuite.google.com/app/apikey
    GEMINI_MODEL: str = "gemini-pro"  # Free model
    GEMINI_VISION_MODEL: str = "gemini-pro-vision"  # Free vision model

    # File Upload
    UPLOAD_DIR: str = "temp_uploads"  # Temporary directory
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Optional services (all FREE)
    MQTT_BROKER_URL: str = "localhost"
    MQTT_BROKER_PORT: int = 1883

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
