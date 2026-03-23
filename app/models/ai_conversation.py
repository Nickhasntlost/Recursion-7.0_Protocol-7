from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ConversationStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ConversationMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    images: List[str] = []  # URLs to uploaded venue images


class ExtractedEventData(BaseModel):
    """Data extracted from AI conversation"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    ticket_tiers: List[dict] = []
    addons: dict = {}
    venue_description: Optional[str] = None
    tags: List[str] = []


class AIConversation(Document):
    # References
    organization_id: str
    user_id: str

    # Conversation
    messages: List[ConversationMessage] = []
    status: ConversationStatus = ConversationStatus.IN_PROGRESS

    # Extracted Data
    extracted_data: Optional[ExtractedEventData] = None

    # Venue Images
    uploaded_images: List[str] = []  # URLs to venue images

    # Created Event
    created_event_id: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Settings:
        name = "ai_conversations"
        indexes = [
            "organization_id",
            "user_id",
            "created_event_id",
        ]


from pydantic import BaseModel
