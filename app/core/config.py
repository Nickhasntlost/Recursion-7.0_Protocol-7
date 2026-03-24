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

    # CORS - parse comma-separated string into list
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # SMTP (Email) - Gmail FREE
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""  # Your Gmail address
    SMTP_PASSWORD: str = ""  # Use App Password from Google Account (https://myaccount.google.com/apppasswords)
    SMTP_FROM_NAME: str = "Event Booking System"

    # Frontend URL for email links
    FRONTEND_URL: str = "http://localhost:3000"

    # Groq API (FREE & FASTEST!)
    GROQ_API_KEY: str = ""  # Get from https://console.groq.com/keys
    GROQ_TEXT_MODEL: str = "llama-3.3-70b-versatile"  # Fastest text model (500-1000+ tokens/sec)

    # Razorpay Payment Gateway (TEST MODE)
    RAZORPAY_KEY_ID: str = ""  # Test API Key ID
    RAZORPAY_KEY_SECRET: str = ""  # Test API Key Secret
    RAZORPAY_WEBHOOK_SECRET: str = ""  # Webhook secret for signature verification

    # File Upload
    UPLOAD_DIR: str = "temp_uploads"  # Temporary directory
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Optional services (all FREE)
    MQTT_BROKER_URL: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()
