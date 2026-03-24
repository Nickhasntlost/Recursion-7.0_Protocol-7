from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    assigned_to_volunteer_id: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    location: Optional[str] = None
    checklist: List[dict] = []  # [{"item": "Setup chairs", "done": false}]


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    assigned_to_volunteer_id: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[TaskStatus] = None
    actual_hours: Optional[float] = None
    completion_notes: Optional[str] = None
    checklist: Optional[List[dict]] = None


class TaskResponse(BaseModel):
    id: str
    event_id: str
    event_title: Optional[str] = None  # Populated for volunteer view
    title: str
    description: Optional[str]
    priority: TaskPriority
    status: TaskStatus
    assigned_to_volunteer_id: Optional[str]
    assigned_to_volunteer_name: Optional[str]  # Populated from volunteer
    due_date: Optional[datetime]
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    location: Optional[str]
    checklist: List[dict]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    email_sent: bool
    created_at: datetime


class TaskStatusUpdate(BaseModel):
    """Quick status update"""
    status: TaskStatus
    notes: Optional[str] = None
