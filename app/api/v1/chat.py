from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.chat import MessageCreate, MessageResponse, MessageMarkRead, MessageReaction
from app.models.chat import Message, MessageSender
from app.models.event import Event
from app.models.volunteer import Volunteer
from app.models.user import User
from app.dependencies.auth import get_current_user, get_current_organizer
from typing import List
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/{event_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    event_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send a message (organizer or volunteer)"""

    # Verify event exists
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Determine sender type
    sender_type = MessageSender.ORGANIZER if event.organization_id == current_user.organization_id else MessageSender.VOLUNTEER

    # If volunteer, verify they're assigned to this event
    if sender_type == MessageSender.VOLUNTEER:
        volunteer = await Volunteer.find_one({
            "event_id": event_id,
            "email": current_user.email
        })
        if not volunteer:
            raise HTTPException(status_code=403, detail="You are not a volunteer for this event")

    # Create message
    message = Message(
        event_id=event_id,
        organization_id=event.organization_id,
        sender_type=sender_type,
        sender_id=str(current_user.id),
        sender_name=current_user.full_name,
        recipient_id=message_data.recipient_id,
        message=message_data.message,
        attachments=message_data.attachments,
        is_announcement=message_data.is_announcement,
        is_task_related=message_data.is_task_related,
        related_task_id=message_data.related_task_id,
    )

    await message.insert()

    return MessageResponse(
        id=str(message.id),
        event_id=message.event_id,
        sender_type=message.sender_type,
        sender_id=message.sender_id,
        sender_name=message.sender_name,
        recipient_id=message.recipient_id,
        message=message.message,
        attachments=message.attachments,
        is_announcement=message.is_announcement,
        is_task_related=message.is_task_related,
        related_task_id=message.related_task_id,
        read_by=message.read_by,
        reactions=message.reactions,
        created_at=message.created_at,
        edited_at=message.edited_at
    )


@router.get("/{event_id}", response_model=List[MessageResponse])
async def get_messages(
    event_id: str,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get messages for an event"""

    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify access (organizer or volunteer)
    is_organizer = event.organization_id == current_user.organization_id
    is_volunteer = False

    if not is_organizer:
        volunteer = await Volunteer.find_one({
            "event_id": event_id,
            "email": current_user.email
        })
        is_volunteer = volunteer is not None

    if not is_organizer and not is_volunteer:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get messages
    query = {"event_id": event_id}

    # If volunteer, only show announcements or messages to them
    if is_volunteer:
        query["$or"] = [
            {"is_announcement": True},
            {"recipient_id": str(current_user.id)},
            {"sender_id": str(current_user.id)}
        ]

    messages = await Message.find(query).sort("-created_at").limit(limit).to_list()

    return [
        MessageResponse(
            id=str(msg.id),
            event_id=msg.event_id,
            sender_type=msg.sender_type,
            sender_id=msg.sender_id,
            sender_name=msg.sender_name,
            recipient_id=msg.recipient_id,
            message=msg.message,
            attachments=msg.attachments,
            is_announcement=msg.is_announcement,
            is_task_related=msg.is_task_related,
            related_task_id=msg.related_task_id,
            read_by=msg.read_by,
            reactions=msg.reactions,
            created_at=msg.created_at,
            edited_at=msg.edited_at
        )
        for msg in messages
    ]


@router.post("/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark message as read"""

    message = await Message.get(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    user_id = str(current_user.id)

    if user_id not in message.read_by:
        message.read_by.append(user_id)
        await message.save()

    return {"success": True, "message_id": str(message.id)}


@router.post("/{message_id}/react")
async def add_reaction(
    message_id: str,
    reaction_data: MessageReaction,
    current_user: User = Depends(get_current_user)
):
    """Add reaction to message"""

    message = await Message.get(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    emoji = reaction_data.emoji
    user_id = str(current_user.id)

    if emoji not in message.reactions:
        message.reactions[emoji] = []

    if user_id not in message.reactions[emoji]:
        message.reactions[emoji].append(user_id)

    await message.save()

    return {"success": True, "reactions": message.reactions}


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Delete message (organizers only)"""

    message = await Message.get(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    event = await Event.get(message.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await message.delete()
