from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageSender(str, Enum):
    ORGANIZER = "organizer"
    VOLUNTEER = "volunteer"
    SYSTEM = "system"  # Automated messages


class Message(Document):
    # References
    event_id: str
    organization_id: str

    # Sender Info
    sender_type: MessageSender
    sender_id: str  # User ID or Volunteer ID
    sender_name: str

    # Recipient (optional - for direct messages)
    recipient_id: Optional[str] = None  # If None, it's a broadcast to all volunteers

    # Message Content
    message: str

    # Attachments
    attachments: list[str] = []  # URLs to images/files

    # Message Type
    is_announcement: bool = False  # Broadcast to all volunteers
    is_task_related: bool = False
    related_task_id: Optional[str] = None

    # Read Status
    read_by: list[str] = []  # List of user/volunteer IDs who read this

    # Reactions (optional)
    reactions: dict = {}  # {"👍": ["user_id1"], "❤️": ["user_id2"]}

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None

    class Settings:
        name = "messages"
        indexes = [
            "event_id",
            "organization_id",
            "sender_id",
            "recipient_id",
            "created_at",
        ]

    class Config:
        json_schema_extra = {
            "example": {32
                "event_id": "event_id",
                "organization_id": "org_id",
                "sender_type": "organizer",
                "sender_id": "user_id",
                "sender_name": "John Organizer",
                "message": "Meeting at 9 AM tomorrow at venue entrance",
                "is_announcement": True
            }
        }
