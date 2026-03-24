from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.events import router as events_router
from app.api.v1.volunteers import router as volunteers_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.chat import router as chat_router
from app.api.v1.ai_assistant import router as ai_assistant_router
from app.api.v1.payments import router as payments_router
<<<<<<< Updated upstream
from app.api.v1.bookings import router as bookings_router
from app.api.v1.seats import router as seats_router
from app.api.v1.automation import router as automation_router
=======
from app.api.v1.live_feed import router as live_feed_router
>>>>>>> Stashed changes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print("Starting Event Booking System API...")
    await connect_to_mongo()
    print("All systems ready!")
    yield
    # Shutdown
    print("Shutting down...")
    await close_mongo_connection()


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Revolutionary Event Booking System with IoT Integration

    ## Features
    - 🔐 User Authentication & Authorization
    - 🏢 Organization Management
    - 📅 Event Creation with AI Assistant
    - 🎟️ Add-ons (Food, Parking, AV, Security, etc.)
    - 👥 Volunteer Management (Excel Upload)
    - ✅ Task Assignment & Tracking
    - 💬 Real-time Chat System
    - 🤖 AI Chatbot for Event Creation (Groq - FASTEST!)
    - 💳 Payment Integration (Razorpay Test Mode)
    - 🪑 Seat Layout & Selection (Stadium, Theater, Dinner, etc.)
    - 📱 Real-time MQTT Updates (Mock Implementation)
    - 🎫 User Booking System with QR Codes
    - 💰 Transaction History & Booking Management
    - 🔄 Seat Changes & Cancellations
    - 📧 Email Confirmations for Bookings
    - 🤖 AI-Powered Email Automation (Groq)
    """,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,  # Parse comma-separated string to list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Event Booking System API",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "features": [
            "Authentication",
            "Organizations",
            "Events with Add-ons",
            "Volunteers",
            "Tasks",
            "Chat",
            "AI Assistant (Groq)",
            "Payments (Razorpay Test Mode)",
            "Seat Selection & Layouts",
            "User Bookings",
            "Transaction History",
            "MQTT Real-time Updates (Mock)",
            "AI Email Automation (Groq)"
        ]
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "features": "Full Event Booking with Seat Selection",
        "ai": "Groq (FASTEST)",
        "payment": "Razorpay (Test Mode)",
        "mqtt": "Mock Implementation"
    }


# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(organizations_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(volunteers_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(ai_assistant_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
<<<<<<< Updated upstream
app.include_router(bookings_router, prefix="/api/v1")
app.include_router(seats_router, prefix="/api/v1")
app.include_router(automation_router, prefix="/api/v1")
=======
app.include_router(live_feed_router, prefix="/api/v1")
>>>>>>> Stashed changes


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
