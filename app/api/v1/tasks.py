from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskStatusUpdate
from app.models.task import Task, TaskStatus
from app.models.event import Event
from app.models.volunteer import Volunteer
from app.models.user import User
from app.dependencies.auth import get_current_organizer, get_current_user
from app.services.email_service import email_service
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

    # Send email notification to volunteer
    if task.assigned_to_volunteer_id and assigned_volunteer_name:
        try:
            email_sent = email_service.send_task_assignment_email(
                volunteer_name=assigned_volunteer_name,
                volunteer_email=volunteer.email,
                event_title=event.title,
                task_title=task.title,
                task_description=task.description or "No description provided",
                priority=task.priority.value,
                due_date=task.due_date,
                location=task.location,
                estimated_hours=task.estimated_hours
            )

            if email_sent:
                task.email_sent = True
                task.email_sent_at = datetime.utcnow()
                await task.save()
        except Exception as e:
            print(f"Failed to send task assignment email: {e}")

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

            # Send email to new volunteer
            try:
                email_sent = email_service.send_task_assignment_email(
                    volunteer_name=new_volunteer.name,
                    volunteer_email=new_volunteer.email,
                    event_title=event.title,
                    task_title=task.title,
                    task_description=task.description or "No description provided",
                    priority=task.priority.value,
                    due_date=task.due_date,
                    location=task.location,
                    estimated_hours=task.estimated_hours
                )

                if email_sent:
                    task.email_sent = True
                    task.email_sent_at = datetime.utcnow()
            except Exception as e:
                print(f"Failed to send task reassignment email: {e}")

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


@router.get("/my-tasks", response_model=List[TaskResponse])
async def get_my_tasks(
    status: Optional[TaskStatus] = None,
    current_user: User = Depends(get_current_user)
):
    """Get tasks assigned to current user (volunteer view)"""

    # Find volunteer record for current user
    volunteer = await Volunteer.find_one({"email": current_user.email})

    if not volunteer:
        # User is not a volunteer in any event
        return []

    # Build query
    query = {"assigned_to_volunteer_id": str(volunteer.id)}
    if status:
        query["status"] = status

    tasks = await Task.find(query).sort("-created_at").to_list()

    # Populate event names
    task_responses = []
    for task in tasks:
        event = await Event.get(task.event_id)
        event_title = event.title if event else "Unknown Event"

        task_responses.append(TaskResponse(
            id=str(task.id),
            event_id=task.event_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            assigned_to_volunteer_id=task.assigned_to_volunteer_id,
            assigned_to_volunteer_name=volunteer.name,
            due_date=task.due_date,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            location=task.location,
            checklist=task.checklist,
            started_at=task.started_at,
            completed_at=task.completed_at,
            email_sent=task.email_sent,
            created_at=task.created_at,
            event_title=event_title  # Add event title for context
        ))

    return task_responses


@router.patch("/my-tasks/{task_id}/status", response_model=TaskResponse)
async def update_my_task_status(
    task_id: str,
    status_update: TaskStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update task status (volunteer can update their own tasks)"""

    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Find volunteer record
    volunteer = await Volunteer.find_one({"email": current_user.email})
    if not volunteer or str(volunteer.id) != task.assigned_to_volunteer_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update status
    task.status = status_update.status

    if status_update.notes:
        if status_update.status == TaskStatus.COMPLETED:
            task.completion_notes = status_update.notes
        else:
            task.notes = status_update.notes

    # Auto-set timestamps
    if status_update.status == TaskStatus.IN_PROGRESS and not task.started_at:
        task.started_at = datetime.utcnow()
    elif status_update.status == TaskStatus.COMPLETED and not task.completed_at:
        task.completed_at = datetime.utcnow()

        # Update volunteer stats
        volunteer.total_tasks_completed += 1
        await volunteer.save()

    task.updated_at = datetime.utcnow()
    await task.save()

    # Get event title
    event = await Event.get(task.event_id)
    event_title = event.title if event else "Unknown Event"

    return TaskResponse(
        id=str(task.id),
        event_id=task.event_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        assigned_to_volunteer_id=task.assigned_to_volunteer_id,
        assigned_to_volunteer_name=volunteer.name,
        due_date=task.due_date,
        estimated_hours=task.estimated_hours,
        actual_hours=task.actual_hours,
        location=task.location,
        checklist=task.checklist,
        started_at=task.started_at,
        completed_at=task.completed_at,
        email_sent=task.email_sent,
        created_at=task.created_at,
        event_title=event_title
    )


@router.get("/{event_id}/history", response_model=List[dict])
async def get_task_history(
    event_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Get task completion history for an event"""

    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all tasks (including completed ones)
    tasks = await Task.find({"event_id": event_id}).to_list()

    history = []
    for task in tasks:
        volunteer_name = "Unassigned"
        if task.assigned_to_volunteer_id:
            volunteer = await Volunteer.get(task.assigned_to_volunteer_id)
            if volunteer:
                volunteer_name = volunteer.name

        history.append({
            "task_id": str(task.id),
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "assigned_to": volunteer_name,
            "assigned_to_id": task.assigned_to_volunteer_id,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "estimated_hours": task.estimated_hours,
            "actual_hours": task.actual_hours,
            "due_date": task.due_date,
            "completion_notes": task.completion_notes if task.status == TaskStatus.COMPLETED else None
        })

    # Sort by completion date (most recent first)
    history.sort(key=lambda x: x['completed_at'] or x['created_at'], reverse=True)

    return history


@router.get("/{event_id}/statistics")
async def get_task_statistics(
    event_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Get task statistics for an event"""

    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    tasks = await Task.find({"event_id": event_id}).to_list()

    stats = {
        "total_tasks": len(tasks),
        "todo": sum(1 for t in tasks if t.status == TaskStatus.TODO),
        "in_progress": sum(1 for t in tasks if t.status == TaskStatus.IN_PROGRESS),
        "completed": sum(1 for t in tasks if t.status == TaskStatus.COMPLETED),
        "cancelled": sum(1 for t in tasks if t.status == TaskStatus.CANCELLED),
        "high_priority": sum(1 for t in tasks if t.priority.value == "high"),
        "assigned": sum(1 for t in tasks if t.assigned_to_volunteer_id),
        "unassigned": sum(1 for t in tasks if not t.assigned_to_volunteer_id),
        "overdue": sum(1 for t in tasks if t.due_date and t.due_date < datetime.utcnow() and t.status != TaskStatus.COMPLETED),
        "total_estimated_hours": sum(t.estimated_hours or 0 for t in tasks),
        "total_actual_hours": sum(t.actual_hours or 0 for t in tasks),
    }

    # Calculate completion rate
    if stats["total_tasks"] > 0:
        stats["completion_rate"] = round((stats["completed"] / stats["total_tasks"]) * 100, 1)
    else:
        stats["completion_rate"] = 0.0

    return stats


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
