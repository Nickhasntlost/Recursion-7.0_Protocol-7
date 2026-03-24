from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CampaignTarget(str, Enum):
    USERS = "users"
    VOLUNTEERS = "volunteers"
    BOTH = "both"
    CUSTOM = "custom"  # Custom email list


class CampaignStatus(str, Enum):
    DRAFT = "draft"
    GENERATING = "generating"  # AI is generating email
    READY = "ready"  # Email generated, ready to send
    SENDING = "sending"  # Currently sending
    SENT = "sent"  # All emails sent
    FAILED = "failed"


class EmailRecipient(BaseModel):
    email: str
    name: str
    user_type: str  # "user", "volunteer"
    sent: bool = False
    sent_at: Optional[datetime] = None
    error: Optional[str] = None


class EmailCampaign(Document):
    """Email automation campaign"""

    # Campaign details
    campaign_name: str
    organization_id: str
    created_by_user_id: str

    # Target audience
    target_audience: CampaignTarget
    event_id: Optional[str] = None  # If targeting specific event volunteers

    # Email content
    email_subject: Optional[str] = None
    email_context: Optional[str] = None  # User's brief/context for AI
    generated_email_html: Optional[str] = None  # AI-generated HTML email
    generated_email_plain: Optional[str] = None  # Plain text version

    # Recipients
    total_recipients: int = 0
    recipients: List[EmailRecipient] = []

    # Sending progress
    emails_sent: int = 0
    emails_failed: int = 0

    # Status
    status: CampaignStatus = CampaignStatus.DRAFT

    # Logs (for real-time progress)
    logs: List[str] = []

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None

    class Settings:
        name = "email_campaigns"
        indexes = [
            "organization_id",
            "created_by_user_id",
            "status",
            "target_audience",
            "created_at",
        ]

    def add_log(self, message: str):
        """Add a log entry with timestamp"""
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        self.logs.append(f"[{timestamp}] {message}")

    class Config:
        json_schema_extra = {
            "example": {
                "campaign_name": "Monthly Newsletter",
                "target_audience": "users",
                "email_context": "Send update about new events this month",
                "status": "draft"
            }
        }
