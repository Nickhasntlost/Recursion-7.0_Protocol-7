from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.automation import CampaignTarget, CampaignStatus, EmailRecipient


class EmailCampaignCreate(BaseModel):
    campaign_name: str = Field(..., min_length=3, max_length=200)
    target_audience: CampaignTarget
    event_id: Optional[str] = None  # Required if targeting event volunteers
    email_context: str = Field(..., min_length=10, max_length=2000)


class EmailCampaignResponse(BaseModel):
    id: str
    campaign_name: str
    organization_id: str
    created_by_user_id: str
    target_audience: CampaignTarget
    event_id: Optional[str] = None
    email_subject: Optional[str] = None
    email_context: Optional[str] = None
    generated_email_html: Optional[str] = None
    total_recipients: int
    emails_sent: int
    emails_failed: int
    status: CampaignStatus
    logs: List[str]
    created_at: datetime
    sent_at: Optional[datetime] = None


class GenerateEmailRequest(BaseModel):
    email_subject: str = Field(..., min_length=5, max_length=200)


class GenerateEmailResponse(BaseModel):
    success: bool
    campaign_id: str
    email_subject: str
    generated_email_html: str
    generated_email_plain: str
    total_recipients: int
    recipient_preview: List[str]  # First 5 emails
    message: str


class EmailPreviewResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    email_subject: str
    email_html: str
    total_recipients: int
    recipient_preview: List[str]


class SendCampaignResponse(BaseModel):
    success: bool
    campaign_id: str
    total_recipients: int
    emails_sent: int
    emails_failed: int
    logs: List[str]
    message: str
