from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class VolunteerStatus(str, Enum):
    INVITED = "invited"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Volunteer(Document):
    # Event and Organization
    event_id: str
    organization_id: str

    # Personal Info
    name: str
    email: Indexed(EmailStr)
    phone: Optional[str] = None

    # Additional Info
    role: Optional[str] = None  # e.g., "Registration Desk", "Security", "Catering"
    skills: list[str] = []  # e.g., ["First Aid", "Event Setup", "Photography"]
    availability: Optional[str] = None  # e.g., "Full Day", "Morning Only"

    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    # Status
    status: VolunteerStatus = VolunteerStatus.INVITED

    # Statistics
    total_tasks_assigned: int = 0
    total_tasks_completed: int = 0
    total_hours_logged: float = 0.0

    # Check-in/out
    checked_in: bool = False
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None

    # Notes
    notes: Optional[str] = None
    special_requirements: Optional[str] = None  # e.g., "Wheelchair accessible area needed"

    # Source
    imported_via_excel: bool = False
    excel_row_number: Optional[int] = None

    # Timestamps
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "volunteers"
        indexes = [
            "event_id",
            "organization_id",
            "email",
            "status",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "event_id_here",
                "organization_id": "org_id_here",
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "role": "Registration Desk",
                "skills": ["Customer Service", "Organization"],
                "status": "active"
            }
        }
