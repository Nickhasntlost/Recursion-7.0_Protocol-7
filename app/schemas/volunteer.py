from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.volunteer import VolunteerStatus


class VolunteerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = None
    skills: List[str] = []
    availability: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None
    special_requirements: Optional[str] = None


class VolunteerBulkCreate(BaseModel):
    """For Excel upload"""
    volunteers: List[VolunteerCreate]


class VolunteerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None
    status: Optional[VolunteerStatus] = None
    notes: Optional[str] = None


class VolunteerResponse(BaseModel):
    id: str
    event_id: str
    organization_id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    role: Optional[str]
    skills: List[str]
    status: VolunteerStatus
    total_tasks_assigned: int
    total_tasks_completed: int
    total_hours_logged: float
    checked_in: bool
    invited_at: datetime
    accepted_at: Optional[datetime]


class VolunteerCheckIn(BaseModel):
    """Check in/out volunteer"""
    check_in: bool  # True for check-in, False for check-out
