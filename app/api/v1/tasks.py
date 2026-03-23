from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskStatusUpdate
from app.models.task import Task, TaskStatus
from app.models.event import Event
from app.models.volunteer import Volunteer
from app.models.user import User
from app.dependencies.auth import get_current_organizer
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/{event_id}", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    event_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_organizer)
):
    """Create a task for an event"""

    # Verify event
    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify volunteer if assigned
    assigned_volunteer_name = None
    if task_data.assigned_to_volunteer_id:
        volunteer = await Volunteer.get(task_data.assigned_to_volunteer_id)
        if not volunteer or volunteer.event_id != event_id:
            raise HTTPException(status_code=404, detail="Volunteer not found for this event")

        assigned_volunteer_name = volunteer.name

        # Update volunteer task count
        volunteer.total_tasks_assigned += 1
        await volunteer.save()

    # Create task
    task = Task(
        event_id=event_id,
        organization_id=event.organization_id,
        created_by_user_id=str(current_user.id),
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        assigned_to_volunteer_id=task_data.assigned_to_volunteer_id,
        due_date=task_data.due_date,
        estimated_hours=task_data.estimated_hours,
        location=task_data.location,
        checklist=task_data.checklist,
    )

    await task.insert()

    # TODO: Send email notification to volunteer
    if task.assigned_to_volunteer_id:
        # Email will be sent here
        task.email_sent = True
        task.email_sent_at = datetime.utcnow()
        await task.save()

    return TaskResponse(
        id=str(task.id),
        event_id=task.event_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        assigned_to_volunteer_id=task.assigned_to_volunteer_id,
        assigned_to_volunteer_name=assigned_volunteer_name,
        due_date=task.due_date,
        estimated_hours=task.estimated_hours,
        actual_hours=task.actual_hours,
        location=task.location,
        checklist=task.checklist,
        started_at=task.started_at,
        completed_at=task.completed_at,
        email_sent=task.email_sent,
        created_at=task.created_at
    )


@router.get("/{event_id}", response_model=List[TaskResponse])
async def get_event_tasks(
    event_id: str,
    status: Optional[TaskStatus] = None,
    assigned_to: Optional[str] = None,
    current_user: User = Depends(get_current_organizer)
):
    """Get all tasks for an event"""

    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = {"event_id": event_id}
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to_volunteer_id"] = assigned_to

    tasks = await Task.find(query).sort("-created_at").to_list()

    # Populate volunteer names
    task_responses = []
    for task in tasks:
        volunteer_name = None
        if task.assigned_to_volunteer_id:
            volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
            if volunteer:
                volunteer_name = volunteer.name

        task_responses.append(TaskResponse(
            id=str(task.id),
            event_id=task.event_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            assigned_to_volunteer_id=task.assigned_to_volunteer_id,
            assigned_to_volunteer_name=volunteer_name,
            due_date=task.due_date,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            location=task.location,
            checklist=task.checklist,
            started_at=task.started_at,
            completed_at=task.completed_at,
            email_sent=task.email_sent,
            created_at=task.created_at
        ))

    return task_responses


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_organizer)
):
    """Update task"""

    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    event = await Event.get(task.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # If reassigning volunteer
    if task_update.assigned_to_volunteer_id and task_update.assigned_to_volunteer_id != task.assigned_to_volunteer_id:
        # Decrement old volunteer count
        if task.assigned_to_volunteer_id:
            old_volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
            if old_volunteer:
                old_volunteer.total_tasks_assigned -= 1
                await old_volunteer.save()

        # Increment new volunteer count
        new_volunteer = await Volunteer.get(task_update.assigned_to_volunteer_id)
        if new_volunteer:
            new_volunteer.total_tasks_assigned += 1
            await new_volunteer.save()

            # TODO: Send email to new volunteer
            task.email_sent = True
            task.email_sent_at = datetime.utcnow()

    # Update fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # Auto-set timestamps based on status
    if task_update.status == TaskStatus.IN_PROGRESS and not task.started_at:
        task.started_at = datetime.utcnow()
    elif task_update.status == TaskStatus.COMPLETED and not task.completed_at:
        task.completed_at = datetime.utcnow()

        # Update volunteer completed count
        if task.assigned_to_volunteer_id:
            volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
            if volunteer:
                volunteer.total_tasks_completed += 1
                await volunteer.save()

    task.updated_at = datetime.utcnow()
    await task.save()

    # Get volunteer name
    volunteer_name = None
    if task.assigned_to_volunteer_id:
        volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
        if volunteer:
            volunteer_name = volunteer.name

    return TaskResponse(
        id=str(task.id),
        event_id=task.event_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        assigned_to_volunteer_id=task.assigned_to_volunteer_id,
        assigned_to_volunteer_name=volunteer_name,
        due_date=task.due_date,
        estimated_hours=task.estimated_hours,
        actual_hours=task.actual_hours,
        location=task.location,
        checklist=task.checklist,
        started_at=task.started_at,
        completed_at=task.completed_at,
        email_sent=task.email_sent,
        created_at=task.created_at
    )


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    status_update: TaskStatusUpdate,
    current_user: User = Depends(get_current_organizer)
):
    """Quick status update for a task"""

    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    event = await Event.get(task.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    task.status = status_update.status

    if status_update.notes:
        if task.status == TaskStatus.COMPLETED:
            task.completion_notes = status_update.notes
        else:
            task.notes = status_update.notes

    # Auto-set timestamps
    if status_update.status == TaskStatus.IN_PROGRESS and not task.started_at:
        task.started_at = datetime.utcnow()
    elif status_update.status == TaskStatus.COMPLETED and not task.completed_at:
        task.completed_at = datetime.utcnow()

        # Update volunteer stats
        if task.assigned_to_volunteer_id:
            volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
            if volunteer:
                volunteer.total_tasks_completed += 1
                await volunteer.save()

    task.updated_at = datetime.utcnow()
    await task.save()

    # Get volunteer name
    volunteer_name = None
    if task.assigned_to_volunteer_id:
        volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
        if volunteer:
            volunteer_name = volunteer.name

    return TaskResponse(
        id=str(task.id),
        event_id=task.event_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        assigned_to_volunteer_id=task.assigned_to_volunteer_id,
        assigned_to_volunteer_name=volunteer_name,
        due_date=task.due_date,
        estimated_hours=task.estimated_hours,
        actual_hours=task.actual_hours,
        location=task.location,
        checklist=task.checklist,
        started_at=task.started_at,
        completed_at=task.completed_at,
        email_sent=task.email_sent,
        created_at=task.created_at
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Delete a task"""

    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    event = await Event.get(task.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Decrement volunteer task count
    if task.assigned_to_volunteer_id:
        volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
        if volunteer:
            volunteer.total_tasks_assigned -= 1
            if task.status == TaskStatus.COMPLETED:
                volunteer.total_tasks_completed -= 1
            await volunteer.save()

    await task.delete()
