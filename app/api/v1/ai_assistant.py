from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.ai_conversation import AIConversation, ConversationMessage, MessageRole, ExtractedEventData, ConversationStatus
from app.models.user import User
from app.models.event import Event, TicketTier, EventCategory, EventStatus
from app.models.event_addons import EventAddOns
from app.models.venue import Venue, VenueType
from app.dependencies.auth import get_current_organizer
from app.services.groq_service import groq_service
from app.core.config import settings
import json
import re

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class VenueSuggestion(BaseModel):
    id: str
    name: str
    city: str
    capacity: int
    venue_type: str
    description: Optional[str] = None
    images: List[str] = []
    has_parking: bool
    has_wifi: bool
    has_accessibility: bool
    amenities: List[dict] = []


class ChatResponse(BaseModel):
    conversation_id: str
    assistant_message: str
    extracted_data: Optional[dict] = None
    is_complete: bool = False
    next_questions: List[str] = []
    venue_suggestions: List[VenueSuggestion] = []  # AI-suggested venues with images


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_organizer)
):
    """Chat with Groq AI assistant for event creation (FREE & FASTEST! ⚡)"""

    # Get or create conversation
    if chat_request.conversation_id:
        # Validate ObjectId format
        try:
            ObjectId(chat_request.conversation_id)
        except:
            raise HTTPException(
                status_code=400,
                detail="Invalid conversation_id format. Please start a new conversation without providing conversation_id."
            )

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

    # Generate AI response using Groq (FASTEST INFERENCE! ⚡)
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
        ai_response_text = await groq_service.generate_text(system_prompt, context[:-1])
    except Exception as e:
        print(f"Groq API Error: {e}")
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
        extracted = await groq_service.extract_event_data(conversation_text)

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

    # AI suggests venues from database with images (if capacity is known)
    venue_suggestions = []
    if conversation.extracted_data and conversation.extracted_data.capacity:
        venue_suggestions = await suggest_venues(conversation.extracted_data)

        # Add venue info to AI response if venues found
        if venue_suggestions:
            venue_info = "\n\n📍 **Suggested Venues:**\n"
            for v in venue_suggestions:
                venue_info += f"\n✨ **{v.name}** ({v.city})\n"
                venue_info += f"   • Capacity: {v.capacity} people\n"
                venue_info += f"   • Type: {v.venue_type}\n"
                if v.has_parking:
                    venue_info += "   • ✅ Parking Available\n"
                if v.has_wifi:
                    venue_info += "   • ✅ WiFi Available\n"
            ai_response_text += venue_info

    return ChatResponse(
        conversation_id=str(conversation.id),
        assistant_message=ai_response_text,
        extracted_data=conversation.extracted_data.dict() if conversation.extracted_data else None,
        is_complete=is_complete,
        next_questions=next_questions,
        venue_suggestions=venue_suggestions  # Venues with images from database
    )


class CreateEventFromAI(BaseModel):
    venue_id: str  # User must select a venue from AI suggestions


@router.get("/{conversation_id}/preview-event")
async def preview_event_from_ai(
    conversation_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Preview event data extracted from AI conversation (without creating)"""

    # Validate ObjectId
    try:
        ObjectId(conversation_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format")

    conversation = await AIConversation.get(conversation_id)
    if not conversation or conversation.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not conversation.extracted_data:
        raise HTTPException(status_code=400, detail="No event data extracted yet. Continue chatting with AI.")

    data = conversation.extracted_data

    # Get venue suggestions
    venue_suggestions = []
    if data.capacity:
        venue_suggestions = await suggest_venues(data)

    return {
        "success": True,
        "extracted_data": data.dict(),
        "venue_suggestions": [
            {
                "id": str(v.id),
                "name": v.name,
                "city": v.city,
                "capacity": v.capacity,
                "images": v.images[:2]  # First 2 images
            }
            for v in venue_suggestions
        ],
        "message": "Review the extracted data and select a venue to create the event.",
        "conversation_id": str(conversation.id),
    }


@router.post("/{conversation_id}/create-event")
async def create_event_from_ai(
    conversation_id: str,
    request_data: CreateEventFromAI,
    current_user: User = Depends(get_current_organizer)
):
    """Create actual event from AI conversation data"""

    # Validate ObjectId
    try:
        ObjectId(conversation_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format")

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

    # Verify venue exists
    venue = await Venue.get(request_data.venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    # Verify user has organization
    if not current_user.organization_id:
        raise HTTPException(status_code=400, detail="You must create an organization first")

    # Create slug from title
    slug = data.title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)

    # Parse start/end datetime
    start_dt = datetime.utcnow()
    end_dt = None

    if data.start_datetime:
        try:
            start_dt = datetime.strptime(data.start_datetime, "%Y-%m-%d %H:%M:%S")
        except:
            start_dt = datetime.utcnow()

    if data.end_datetime:
        try:
            end_dt = datetime.strptime(data.end_datetime, "%Y-%m-%d %H:%M:%S")
        except:
            pass

    # If end_dt not provided, default to 3 hours after start
    if not end_dt:
        from datetime import timedelta
        end_dt = start_dt + timedelta(hours=3)

    # Map category to EventCategory enum
    category_mapping = {
        "concert": EventCategory.CONCERT,
        "conference": EventCategory.CONFERENCE,
        "workshop": EventCategory.WORKSHOP,
        "sports": EventCategory.SPORTS,
        "theater": EventCategory.THEATER,
        "festival": EventCategory.FESTIVAL,
        "exhibition": EventCategory.EXHIBITION,
        "networking": EventCategory.NETWORKING,
    }

    category = EventCategory.OTHER
    if data.category:
        category = category_mapping.get(data.category.lower(), EventCategory.OTHER)

    # Create ticket tiers
    ticket_tiers = []
    if data.ticket_tiers:
        for idx, tier_data in enumerate(data.ticket_tiers):
            tier_price = float(tier_data.get("price", 299))
            ticket_tiers.append(TicketTier(
                tier_id=f"tier_{idx + 1}",
                tier_name=tier_data.get("name", "Standard"),
                price=tier_price,
                current_price=tier_price,
                total_quantity=data.capacity,
                available_quantity=data.capacity,
                description=tier_data.get("description")
            ))
    else:
        # Default ticket tier
        ticket_tiers.append(TicketTier(
            tier_id="tier_1",
            tier_name="Standard",
            price=299.0,
            current_price=299.0,
            total_quantity=data.capacity,
            available_quantity=data.capacity
        ))

    # Calculate min/max price
    min_price = min([t.price for t in ticket_tiers])
    max_price = max([t.price for t in ticket_tiers])

    # Get currency from ticket tiers or default to INR
    currency = "INR"
    if data.ticket_tiers and len(data.ticket_tiers) > 0:
        currency = data.ticket_tiers[0].get("currency", "INR")

    # Create event
    event = Event(
        title=data.title,
        slug=slug,
        description=data.description or f"Join us for {data.title}!",
        organization_id=current_user.organization_id,
        venue_id=str(venue.id),
        category=category,
        start_datetime=start_dt,
        end_datetime=end_dt,
        total_capacity=data.capacity,
        total_sold=0,
        total_reserved=0,
        ticket_tiers=ticket_tiers,
        min_price=min_price,
        max_price=max_price,
        currency=currency,
        tags=data.tags or [],
        status=EventStatus.DRAFT,
        created_via_ai=True,
        ai_conversation_id=str(conversation.id)
    )

    await event.insert()

    # Update conversation with created event
    conversation.created_event_id = str(event.id)
    conversation.status = ConversationStatus.COMPLETED
    conversation.completed_at = datetime.utcnow()
    await conversation.save()

    return {
        "success": True,
        "event_id": str(event.id),
        "event_title": event.title,
        "event_slug": event.slug,
        "venue_name": venue.name,
        "status": event.status,
        "ticket_tiers": [
            {
                "tier_id": t.tier_id,
                "name": t.tier_name,
                "price": t.price,
                "current_price": t.current_price,
                "currency": event.currency,
                "total_quantity": t.total_quantity,
                "available": t.available_quantity
            }
            for t in event.ticket_tiers
        ],
        "message": "Event created successfully! Proceed to payment to book tickets.",
        "next_action": "payment",  # Frontend should navigate to payment page
        "payment_endpoint": "/api/v1/payments/create-order",
        "conversation_id": str(conversation.id),
        "note": "AI-powered event creation using Groq ⚡"
    }


@router.get("/conversations", response_model=List[dict])
async def get_my_conversations(current_user: User = Depends(get_current_organizer)):
    """Get user's AI conversations (metadata only)"""

    conversations = await AIConversation.find({
        "user_id": str(current_user.id)
    }).sort("-created_at").to_list()

    return [
        {
            "id": str(conv.id),
            "status": conv.status,
            "message_count": len(conv.messages),
            "created_event_id": conv.created_event_id,
            "extracted_data": conv.extracted_data.dict() if conv.extracted_data else None,
            "created_at": conv.created_at,
            "completed_at": conv.completed_at,
        }
        for conv in conversations
    ]


@router.get("/conversations/{conversation_id}/history", response_model=dict)
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Get full chat history for a specific AI conversation"""

    # Validate ObjectId
    try:
        ObjectId(conversation_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format")

    conversation = await AIConversation.get(conversation_id)
    if not conversation or conversation.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "conversation_id": str(conversation.id),
        "status": conversation.status,
        "messages": [
            {
                "role": msg.role.value,
                "content": msg.content,
                "timestamp": msg.timestamp
            }
            for msg in conversation.messages
        ],
        "extracted_data": conversation.extracted_data.dict() if conversation.extracted_data else None,
        "created_event_id": conversation.created_event_id,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "completed_at": conversation.completed_at
    }


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


async def suggest_venues(extracted_data: ExtractedEventData) -> List[VenueSuggestion]:
    """
    Query venues from database based on AI-extracted event requirements
    Returns venues with images for AI to suggest in chat
    """
    if not extracted_data.capacity:
        return []  # Need capacity to suggest venues

    # Build MongoDB query with proper indexing
    query = {
        "is_active": True,
        "capacity": {"$gte": extracted_data.capacity}  # Capacity >= required
    }

    # Add location filter if mentioned in conversation
    # For now, we'll search globally - can be enhanced with city extraction

    # Add venue type filter if category matches
    venue_type_mapping = {
        "concert": VenueType.CONCERT_HALL,
        "conference": VenueType.CONFERENCE_HALL,
        "theater": VenueType.THEATER,
        "sports": VenueType.STADIUM,
        "outdoor": VenueType.OUTDOOR,
    }

    if extracted_data.category and extracted_data.category.lower() in venue_type_mapping:
        query["venue_type"] = venue_type_mapping[extracted_data.category.lower()]

    # Query venues with images (limit to top 3 suggestions)
    venues = await Venue.find(query).limit(3).to_list()

    # Convert to VenueSuggestion format
    suggestions = []
    for venue in venues:
        suggestions.append(VenueSuggestion(
            id=str(venue.id),
            name=venue.name,
            city=venue.city,
            capacity=venue.capacity,
            venue_type=venue.venue_type.value,
            description=venue.description,
            images=venue.images[:3],  # Return max 3 images per venue
            has_parking=venue.has_parking,
            has_wifi=venue.has_wifi,
            has_accessibility=venue.has_accessibility,
            amenities=[{"name": a.name, "icon": a.icon} for a in venue.amenities]
        ))

    return suggestions
