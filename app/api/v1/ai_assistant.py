from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import tempfile
from app.models.ai_conversation import AIConversation, ConversationMessage, MessageRole, ExtractedEventData, ConversationStatus
from app.models.user import User
from app.models.event import Event, TicketTier, EventCategory
from app.models.event_addons import EventAddOns
from app.dependencies.auth import get_current_organizer
from app.services.gemini_service import gemini_service
from app.core.config import settings
import json

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    assistant_message: str
    extracted_data: Optional[dict] = None
    is_complete: bool = False
    next_questions: List[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_organizer)
):
    """Chat with Google Gemini AI assistant for event creation (FREE!)"""

    # Get or create conversation
    if chat_request.conversation_id:
        conversation = await AIConversation.get(chat_request.conversation_id)
        if not conversation or conversation.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # New conversation
        conversation = AIConversation(
            organization_id=current_user.organization_id,
            user_id=str(current_user.id),
            messages=[],
            extracted_data=ExtractedEventData()
        )
        await conversation.insert()

    # Add user message
    user_msg = ConversationMessage(
        role=MessageRole.USER,
        content=chat_request.message
    )
    conversation.messages.append(user_msg)

    # Build context for Gemini
    context = [
        {"role": msg.role.value, "content": msg.content}
        for msg in conversation.messages[-10:]  # Last 10 messages for context
    ]

    # Generate AI response using Google Gemini (FREE!)
    system_prompt = f"""You are an expert event planning assistant. Help the user create an amazing event.

Current conversation goal: Collect complete event details including:
- Event type/category
- Title/name
- Expected attendance/capacity
- Date and time
- Ticket pricing structure
- Add-ons needed (food, parking, AV equipment, security, etc.)

Current extracted data: {json.dumps(conversation.extracted_data.dict() if conversation.extracted_data else {}, indent=2)}

Be conversational, friendly, and ask one question at a time. After each response, suggest what information you still need.

User's message: {chat_request.message}

Respond with helpful guidance and ask the next logical question."""

    try:
        ai_response_text = await gemini_service.generate_text(system_prompt, context[:-1])
    except Exception as e:
        ai_response_text = "I'm here to help you create an event! Let's start - what type of event are you planning? (e.g., concert, conference, workshop)"

    # Add assistant message
    assistant_msg = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content=ai_response_text
    )
    conversation.messages.append(assistant_msg)

    # Extract data from conversation using Gemini
    conversation_text = "\n".join([
        f"{msg.role.value}: {msg.content}"
        for msg in conversation.messages
    ])

    try:
        extracted = await gemini_service.extract_event_data(conversation_text)

        # Update extracted_data
        if extracted:
            if extracted.get("title"):
                conversation.extracted_data.title = extracted["title"]
            if extracted.get("category"):
                conversation.extracted_data.category = extracted["category"]
            if extracted.get("capacity"):
                conversation.extracted_data.capacity = extracted["capacity"]
            if extracted.get("start_datetime"):
                conversation.extracted_data.start_datetime = extracted["start_datetime"]
            if extracted.get("description"):
                conversation.extracted_data.description = extracted["description"]
            if extracted.get("ticket_tiers"):
                conversation.extracted_data.ticket_tiers = extracted["ticket_tiers"]
            if extracted.get("tags"):
                conversation.extracted_data.tags = extracted["tags"]
    except Exception as e:
        print(f"Extraction error: {e}")

    # Check if conversation is complete
    is_complete = check_if_complete(conversation.extracted_data)
    if is_complete:
        conversation.status = ConversationStatus.COMPLETED
        conversation.completed_at = datetime.utcnow()

    conversation.updated_at = datetime.utcnow()
    await conversation.save()

    # Generate next questions
    next_questions = generate_next_questions(conversation.extracted_data)

    return ChatResponse(
        conversation_id=str(conversation.id),
        assistant_message=ai_response_text,
        extracted_data=conversation.extracted_data.dict() if conversation.extracted_data else None,
        is_complete=is_complete,
        next_questions=next_questions
    )


@router.post("/{conversation_id}/upload-image")
async def upload_venue_image(
    conversation_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_organizer)
):
    """
    Upload venue image for AI analysis using Google Gemini Vision (FREE!)
    Image is stored temporarily and deleted after analysis
    """

    conversation = await AIConversation.get(conversation_id)
    if not conversation or conversation.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save to temporary file
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"venue_{conversation_id}_{file.filename}")

    try:
        # Save uploaded file temporarily
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)

        # Analyze with Gemini Vision (FREE!)
        analysis_prompt = """
        Analyze this venue image and provide:
        1. Estimated capacity (how many people it can hold)
        2. Venue type (indoor/outdoor, theater-style, conference hall, etc.)
        3. Notable features (stage, seating arrangement, lighting, acoustics)
        4. Suitability for event types

        Be specific with capacity estimate.
        """

        analysis = await gemini_service.analyze_image(temp_path, analysis_prompt)

        # Store analysis URL (in production, would upload to cloud storage)
        # For now, just note that image was analyzed
        image_url = f"temp_analyzed_{file.filename}"
        conversation.uploaded_images.append(image_url)

        # Add system message about image
        image_msg = ConversationMessage(
            role=MessageRole.SYSTEM,
            content=f"Image uploaded: {file.filename}",
            images=[image_url]
        )
        conversation.messages.append(image_msg)

        # Add AI analysis
        assistant_msg = ConversationMessage(
            role=MessageRole.ASSISTANT,
            content=analysis["message"]
        )
        conversation.messages.append(assistant_msg)

        # Update extracted data from image analysis
        if analysis.get("capacity_estimate"):
            conversation.extracted_data.capacity = analysis["capacity_estimate"]
        if analysis.get("venue_description"):
            conversation.extracted_data.venue_description = analysis["venue_description"]

        await conversation.save()

        return {
            "success": True,
            "image_filename": file.filename,
            "analysis": analysis["message"],
            "capacity_estimate": analysis.get("capacity_estimate"),
            "note": "Image analyzed and deleted from temp storage for privacy"
        }

    finally:
        # DELETE temporary file after analysis (FREE storage!)
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"✅ Deleted temporary file: {temp_path}")


@router.post("/{conversation_id}/create-event")
async def create_event_from_ai(
    conversation_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Create event from AI conversation data"""

    conversation = await AIConversation.get(conversation_id)
    if not conversation or conversation.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not conversation.extracted_data:
        raise HTTPException(status_code=400, detail="No event data extracted")

    data = conversation.extracted_data

    # Validate required fields
    if not data.title or not data.capacity:
        raise HTTPException(
            status_code=400,
            detail="Missing required event data. Please complete the conversation."
        )

    # Return extracted data for manual event creation
    # (In full implementation, would auto-create event)
    return {
        "success": True,
        "extracted_data": data.dict(),
        "message": "Event data ready. Please select a venue to create the event.",
        "conversation_id": str(conversation.id),
        "note": "AI-extracted data using Google Gemini (FREE!)"
    }


@router.get("/conversations", response_model=List[dict])
async def get_my_conversations(current_user: User = Depends(get_current_organizer)):
    """Get user's AI conversations"""

    conversations = await AIConversation.find({
        "user_id": str(current_user.id)
    }).sort("-created_at").to_list()

    return [
        {
            "id": str(conv.id),
            "status": conv.status,
            "message_count": len(conv.messages),
            "created_event_id": conv.created_event_id,
            "created_at": conv.created_at,
            "completed_at": conv.completed_at,
        }
        for conv in conversations
    ]


def check_if_complete(data: ExtractedEventData) -> bool:
    """Check if all required event data is collected"""
    return all([
        data.title,
        data.category,
        data.capacity,
    ])


def generate_next_questions(data: ExtractedEventData) -> List[str]:
    """Generate suggested next questions based on what's missing"""
    questions = []

    if not data.title:
        questions.append("What's the name of your event?")
    if not data.category:
        questions.append("What type of event is this?")
    if not data.capacity:
        questions.append("How many people are expected?")
    if not data.start_datetime:
        questions.append("When is the event?")
    if not data.ticket_tiers:
        questions.append("What's the ticket pricing?")
    if not data.description:
        questions.append("Can you describe the event?")

    return questions[:3]  # Return top 3 questions
