from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(Document):
    # References
    event_id: str
    organization_id: str
    assigned_to_volunteer_id: Optional[str] = None  # Volunteer ID
    created_by_user_id: str  # Organizer who created the task

    # Task Details
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO

    # Timing
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

    # Location
    location: Optional[str] = None  # e.g., "Main Entrance", "Stage Area"

    # Checklist items (sub-tasks)
    checklist: list[dict] = []  # [{"item": "Setup chairs", "done": false}]

    # Attachments
    attachments: list[str] = []  # URLs to files

    # Status tracking
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Email notification
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None

    # Comments/Notes
    notes: Optional[str] = None
    completion_notes: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
        indexes = [
            "event_id",
            "organization_id",
            "assigned_to_volunteer_id",
            "status",
            "priority",
            "due_date",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "event_id",
                "title": "Setup Registration Desk",
                "description": "Arrange tables and chairs at main entrance",
                "priority": "high",
                "due_date": "2026-06-15T08:00:00",
                "location": "Main Entrance"
            }
        }
