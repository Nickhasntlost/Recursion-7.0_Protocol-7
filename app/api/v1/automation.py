from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.automation import (
    EmailCampaignCreate, EmailCampaignResponse, GenerateEmailRequest,
    GenerateEmailResponse, EmailPreviewResponse, SendCampaignResponse
)
from app.models.automation import EmailCampaign, CampaignTarget, CampaignStatus, EmailRecipient
from app.models.user import User
from app.models.volunteer import Volunteer
from app.models.event import Event
from app.dependencies.auth import get_current_organizer
from app.services.email_service import email_service
from app.core.config import settings
from typing import List
from datetime import datetime
import asyncio
from groq import Groq


router = APIRouter(prefix="/automation", tags=["Email Automation"])

# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


@router.post("/campaigns", response_model=EmailCampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_email_campaign(
    campaign_data: EmailCampaignCreate,
    current_user: User = Depends(get_current_organizer)
):
    """
    Step 1: Create email campaign and extract recipient list.

    Extracts emails based on target audience:
    - USERS: All registered users
    - VOLUNTEERS: All volunteers (or specific event volunteers)
    - BOTH: Users + Volunteers
    """

    # Create campaign
    campaign = EmailCampaign(
        campaign_name=campaign_data.campaign_name,
        organization_id=current_user.organization_id,
        created_by_user_id=str(current_user.id),
        target_audience=campaign_data.target_audience,
        event_id=campaign_data.event_id,
        email_context=campaign_data.email_context,
        status=CampaignStatus.DRAFT
    )

    campaign.add_log("Campaign created")
    campaign.add_log(f"Target audience: {campaign_data.target_audience}")

    # Extract recipient emails
    recipients = []

    if campaign_data.target_audience in [CampaignTarget.USERS, CampaignTarget.BOTH]:
        campaign.add_log("Extracting user emails...")
        users = await User.find({"is_active": True}).to_list()
        for user in users:
            recipients.append(EmailRecipient(
                email=user.email,
                name=user.full_name,
                user_type="user"
            ))
        campaign.add_log(f"Found {len(users)} active users")

    if campaign_data.target_audience in [CampaignTarget.VOLUNTEERS, CampaignTarget.BOTH]:
        campaign.add_log("Extracting volunteer emails...")

        query = {"organization_id": current_user.organization_id}
        if campaign_data.event_id:
            # Specific event volunteers
            campaign.add_log(f"Filtering by event: {campaign_data.event_id}")
            query["event_id"] = campaign_data.event_id

        volunteers = await Volunteer.find(query).to_list()

        # Deduplicate emails
        existing_emails = {r.email for r in recipients}
        for volunteer in volunteers:
            if volunteer.email not in existing_emails:
                recipients.append(EmailRecipient(
                    email=volunteer.email,
                    name=volunteer.name,
                    user_type="volunteer"
                ))
                existing_emails.add(volunteer.email)

        campaign.add_log(f"Found {len(volunteers)} volunteers")

    if not recipients:
        raise HTTPException(
            status_code=400,
            detail="No recipients found for the selected audience"
        )

    campaign.recipients = recipients
    campaign.total_recipients = len(recipients)
    campaign.add_log(f"Total recipients: {len(recipients)}")

    await campaign.insert()

    return EmailCampaignResponse(
        id=str(campaign.id),
        campaign_name=campaign.campaign_name,
        organization_id=campaign.organization_id,
        created_by_user_id=campaign.created_by_user_id,
        target_audience=campaign.target_audience,
        event_id=campaign.event_id,
        email_subject=campaign.email_subject,
        email_context=campaign.email_context,
        generated_email_html=campaign.generated_email_html,
        total_recipients=campaign.total_recipients,
        emails_sent=campaign.emails_sent,
        emails_failed=campaign.emails_failed,
        status=campaign.status,
        logs=campaign.logs,
        created_at=campaign.created_at,
        sent_at=campaign.sent_at
    )


@router.post("/campaigns/{campaign_id}/generate-email", response_model=GenerateEmailResponse)
async def generate_email_content(
    campaign_id: str,
    request: GenerateEmailRequest,
    current_user: User = Depends(get_current_organizer)
):
    """
    Step 2: Generate email content using Groq AI.

    Takes the email context from campaign and subject from request,
    uses Groq to generate professional HTML email content.
    """

    # Get campaign
    campaign = await EmailCampaign.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify ownership
    if campaign.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not groq_client:
        raise HTTPException(
            status_code=500,
            detail="Groq API not configured. Please set GROQ_API_KEY in environment."
        )

    campaign.add_log("Starting email generation with Groq AI...")
    campaign.status = CampaignStatus.GENERATING
    await campaign.save()

    try:
        # Prepare AI prompt
        prompt = f"""You are an expert email copywriter. Generate a professional, engaging HTML email based on the following:

Subject: {request.email_subject}
Context: {campaign.email_context}
Target Audience: {campaign.target_audience}

Requirements:
1. Create an HTML email with proper styling (inline CSS)
2. Professional and engaging tone
3. Clear call-to-action if applicable
4. Mobile-responsive design
5. Include proper email structure (header, body, footer)
6. Brand colors: #667eea (primary), #764ba2 (secondary)

Generate ONLY the complete HTML email code, no explanations."""

        campaign.add_log("Sending prompt to Groq AI...")

        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert email designer and copywriter. Generate professional HTML emails with inline CSS styling."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=settings.GROQ_TEXT_MODEL,
            temperature=0.7,
            max_tokens=2048
        )

        generated_html = chat_completion.choices[0].message.content.strip()

        # Clean HTML (remove markdown code blocks if present)
        if generated_html.startswith("```html"):
            generated_html = generated_html.replace("```html", "").replace("```", "").strip()
        elif generated_html.startswith("```"):
            generated_html = generated_html.replace("```", "").strip()

        campaign.add_log("Email content generated successfully")

        # Generate plain text version (simple strip of HTML tags)
        import re
        plain_text = re.sub('<[^<]+?>', '', generated_html)
        plain_text = plain_text.strip()

        # Update campaign
        campaign.email_subject = request.email_subject
        campaign.generated_email_html = generated_html
        campaign.generated_email_plain = plain_text
        campaign.status = CampaignStatus.READY
        campaign.add_log("Campaign ready to send")

        await campaign.save()

        # Get recipient preview
        recipient_preview = [r.email for r in campaign.recipients[:5]]

        return GenerateEmailResponse(
            success=True,
            campaign_id=str(campaign.id),
            email_subject=campaign.email_subject,
            generated_email_html=generated_html,
            generated_email_plain=plain_text,
            total_recipients=campaign.total_recipients,
            recipient_preview=recipient_preview,
            message=f"Email generated successfully for {campaign.total_recipients} recipients"
        )

    except Exception as e:
        campaign.add_log(f"Error generating email: {str(e)}")
        campaign.status = CampaignStatus.FAILED
        await campaign.save()
        raise HTTPException(status_code=500, detail=f"Failed to generate email: {str(e)}")


@router.get("/campaigns/{campaign_id}/preview", response_model=EmailPreviewResponse)
async def preview_email_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """
    Step 3: Preview the generated email before sending.

    Returns the HTML email and recipient list for frontend preview.
    """

    campaign = await EmailCampaign.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify ownership
    if campaign.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not campaign.generated_email_html:
        raise HTTPException(
            status_code=400,
            detail="Email not generated yet. Please generate email first."
        )

    recipient_preview = [r.email for r in campaign.recipients[:10]]

    return EmailPreviewResponse(
        campaign_id=str(campaign.id),
        campaign_name=campaign.campaign_name,
        email_subject=campaign.email_subject,
        email_html=campaign.generated_email_html,
        total_recipients=campaign.total_recipients,
        recipient_preview=recipient_preview
    )


@router.post("/campaigns/{campaign_id}/send", response_model=SendCampaignResponse)
async def send_email_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """
    Step 4: Send emails to all recipients.

    Sends the generated email to all recipients in the campaign.
    Shows real-time progress logs in the response.
    """

    campaign = await EmailCampaign.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify ownership
    if campaign.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if campaign.status == CampaignStatus.SENT:
        raise HTTPException(status_code=400, detail="Campaign already sent")

    if not campaign.generated_email_html:
        raise HTTPException(
            status_code=400,
            detail="Email not generated. Please generate email first."
        )

    # Update status
    campaign.status = CampaignStatus.SENDING
    campaign.add_log(f"Starting email send to {campaign.total_recipients} recipients...")
    await campaign.save()

    sent_count = 0
    failed_count = 0

    # Send emails
    for idx, recipient in enumerate(campaign.recipients, 1):
        try:
            campaign.add_log(f"Sending to {recipient.email} ({idx}/{campaign.total_recipients})...")

            # Send email using email service
            success = email_service.send_email(
                to_email=recipient.email,
                subject=campaign.email_subject,
                html_content=campaign.generated_email_html
            )

            if success:
                recipient.sent = True
                recipient.sent_at = datetime.utcnow()
                sent_count += 1
                campaign.add_log(f"[OK] Sent to {recipient.email}")
            else:
                recipient.error = "Failed to send"
                failed_count += 1
                campaign.add_log(f"[ERROR] Failed to send to {recipient.email}")

            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)

        except Exception as e:
            recipient.error = str(e)
            failed_count += 1
            campaign.add_log(f"[ERROR] Error sending to {recipient.email}: {str(e)}")

    # Update campaign
    campaign.emails_sent = sent_count
    campaign.emails_failed = failed_count
    campaign.status = CampaignStatus.SENT
    campaign.sent_at = datetime.utcnow()
    campaign.add_log(f"Campaign completed: {sent_count} sent, {failed_count} failed")

    await campaign.save()

    return SendCampaignResponse(
        success=True,
        campaign_id=str(campaign.id),
        total_recipients=campaign.total_recipients,
        emails_sent=sent_count,
        emails_failed=failed_count,
        logs=campaign.logs,
        message=f"Campaign sent successfully. {sent_count} emails sent, {failed_count} failed."
    )


@router.get("/campaigns", response_model=List[EmailCampaignResponse])
async def list_campaigns(
    current_user: User = Depends(get_current_organizer)
):
    """List all email campaigns for the organization"""

    campaigns = await EmailCampaign.find(
        {"organization_id": current_user.organization_id}
    ).sort("-created_at").to_list()

    return [
        EmailCampaignResponse(
            id=str(c.id),
            campaign_name=c.campaign_name,
            organization_id=c.organization_id,
            created_by_user_id=c.created_by_user_id,
            target_audience=c.target_audience,
            event_id=c.event_id,
            email_subject=c.email_subject,
            email_context=c.email_context,
            generated_email_html=c.generated_email_html,
            total_recipients=c.total_recipients,
            emails_sent=c.emails_sent,
            emails_failed=c.emails_failed,
            status=c.status,
            logs=c.logs,
            created_at=c.created_at,
            sent_at=c.sent_at
        )
        for c in campaigns
    ]


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def get_campaign_details(
    campaign_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Get detailed campaign information"""

    campaign = await EmailCampaign.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify ownership
    if campaign.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return EmailCampaignResponse(
        id=str(campaign.id),
        campaign_name=campaign.campaign_name,
        organization_id=campaign.organization_id,
        created_by_user_id=campaign.created_by_user_id,
        target_audience=campaign.target_audience,
        event_id=campaign.event_id,
        email_subject=campaign.email_subject,
        email_context=campaign.email_context,
        generated_email_html=campaign.generated_email_html,
        total_recipients=campaign.total_recipients,
        emails_sent=campaign.emails_sent,
        emails_failed=campaign.emails_failed,
        status=campaign.status,
        logs=campaign.logs,
        created_at=campaign.created_at,
        sent_at=campaign.sent_at
    )


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Delete a campaign (only if not sent)"""

    campaign = await EmailCampaign.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify ownership
    if campaign.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if campaign.status == CampaignStatus.SENT:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete sent campaigns. They are kept for audit purposes."
        )

    await campaign.delete()
