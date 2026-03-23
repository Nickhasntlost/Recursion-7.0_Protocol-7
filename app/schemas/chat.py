from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.chat import MessageSender


class MessageCreate(BaseModel):
    message: str
    recipient_id: Optional[str] = None  # If None, broadcast to all
    is_announcement: bool = False
    is_task_related: bool = False
    related_task_id: Optional[str] = None
    attachments: List[str] = []


class MessageResponse(BaseModel):
    id: str
    event_id: str
    sender_type: MessageSender
    sender_id: str
    sender_name: str
    recipient_id: Optional[str]
    message: str
    attachments: List[str]
    is_announcement: bool
    is_task_related: bool
    related_task_id: Optional[str]
    read_by: List[str]
    reactions: dict
    created_at: datetime
    edited_at: Optional[datetime]


class MessageMarkRead(BaseModel):
    """Mark message as read"""
    user_id: str  # User or volunteer ID


class MessageReaction(BaseModel):
    """Add reaction to message"""
    emoji: str  # e.g., "👍", "❤️"
    user_id: str
