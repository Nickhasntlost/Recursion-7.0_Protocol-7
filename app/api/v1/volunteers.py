from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.volunteer import (
    VolunteerCreate, VolunteerUpdate, VolunteerResponse, VolunteerCheckIn
)
from app.models.volunteer import Volunteer, VolunteerStatus
from app.models.event import Event
from app.models.user import User
from app.dependencies.auth import get_current_organizer
from typing import List
from datetime import datetime
import pandas as pd
import tempfile
import os

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.post("/{event_id}", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED)
async def create_volunteer(
    event_id: str,
    volunteer_data: VolunteerCreate,
    current_user: User = Depends(get_current_organizer)
):
    """Create a single volunteer for an event"""

    # Verify event exists and belongs to user's organization
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if volunteer email already exists for this event
    existing = await Volunteer.find_one({
        "event_id": event_id,
        "email": volunteer_data.email
    })
    if existing:
        raise HTTPException(status_code=400, detail="Volunteer already added to this event")

    # Create volunteer
    volunteer = Volunteer(
        event_id=event_id,
        organization_id=event.organization_id,
        name=volunteer_data.name,
        email=volunteer_data.email,
        phone=volunteer_data.phone,
        role=volunteer_data.role,
        skills=volunteer_data.skills,
        availability=volunteer_data.availability,
        emergency_contact_name=volunteer_data.emergency_contact_name,
        emergency_contact_phone=volunteer_data.emergency_contact_phone,
        notes=volunteer_data.notes,
        special_requirements=volunteer_data.special_requirements,
    )

    await volunteer.insert()

    # TODO: Send invitation email (using free Gmail SMTP)

    return VolunteerResponse(
        id=str(volunteer.id),
        event_id=volunteer.event_id,
        organization_id=volunteer.organization_id,
        name=volunteer.name,
        email=volunteer.email,
        phone=volunteer.phone,
        role=volunteer.role,
        skills=volunteer.skills,
        status=volunteer.status,
        total_tasks_assigned=volunteer.total_tasks_assigned,
        total_tasks_completed=volunteer.total_tasks_completed,
        total_hours_logged=volunteer.total_hours_logged,
        checked_in=volunteer.checked_in,
        invited_at=volunteer.invited_at,
        accepted_at=volunteer.accepted_at
    )


@router.post("/{event_id}/upload-excel", status_code=status.HTTP_201_CREATED)
async def upload_volunteers_excel(
    event_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_organizer)
):
    """
    Upload volunteers via Excel/CSV file (FREE - uses temporary storage)
    File is automatically deleted after processing
    """

    # Verify event
    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload .xlsx, .xls, or .csv file"
        )

    # Use temporary file storage (FREE!)
    temp_path = None

    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            # Save uploaded file to temp location
            contents = await file.read()
            temp_file.write(contents)
            temp_path = temp_file.name

        # Read Excel/CSV from temporary file
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(temp_path)
            else:
                df = pd.read_excel(temp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid file format: {str(e)}")

        # Expected columns: name, email, phone, role, skills, availability
        required_columns = ["name", "email"]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400,
                detail=f"Excel must contain columns: {', '.join(required_columns)}"
            )

        volunteers_created = []
        volunteers_skipped = []

        for index, row in df.iterrows():
            try:
                # Check if already exists
                existing = await Volunteer.find_one({
                    "event_id": event_id,
                    "email": row["email"]
                })

                if existing:
                    volunteers_skipped.append({
                        "row": index + 2,  # Excel row (1-indexed + header)
                        "email": row["email"],
                        "reason": "Already exists"
                    })
                    continue

                # Parse skills (comma-separated)
                skills = []
                if "skills" in df.columns and pd.notna(row.get("skills")):
                    skills = [s.strip() for s in str(row["skills"]).split(",")]

                volunteer = Volunteer(
                    event_id=event_id,
                    organization_id=event.organization_id,
                    name=row["name"],
                    email=row["email"],
                    phone=row.get("phone") if pd.notna(row.get("phone")) else None,
                    role=row.get("role") if pd.notna(row.get("role")) else None,
                    skills=skills,
                    availability=row.get("availability") if pd.notna(row.get("availability")) else None,
                    emergency_contact_name=row.get("emergency_contact_name") if pd.notna(row.get("emergency_contact_name")) else None,
                    emergency_contact_phone=row.get("emergency_contact_phone") if pd.notna(row.get("emergency_contact_phone")) else None,
                    imported_via_excel=True,
                    excel_row_number=index + 2,
                )

                await volunteer.insert()
                volunteers_created.append(str(volunteer.id))

                # TODO: Send invitation email (free Gmail SMTP)

            except Exception as e:
                volunteers_skipped.append({
                    "row": index + 2,
                    "email": row.get("email", "N/A"),
                    "reason": str(e)
                })

        return {
            "success": True,
            "total_rows": len(df),
            "volunteers_created": len(volunteers_created),
            "volunteers_skipped": len(volunteers_skipped),
            "skipped_details": volunteers_skipped,
            "note": "File processed from temporary storage and deleted (FREE!)"
        }

    finally:
        # ALWAYS delete temporary file (FREE storage!)
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"✅ Deleted temporary Excel file: {temp_path}")


@router.get("/{event_id}", response_model=List[VolunteerResponse])
async def get_event_volunteers(
    event_id: str,
    status: VolunteerStatus = None,
    current_user: User = Depends(get_current_organizer)
):
    """Get all volunteers for an event"""

    event = await Event.get(event_id)
    if not event or event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = {"event_id": event_id}
    if status:
        query["status"] = status

    volunteers = await Volunteer.find(query).to_list()

    return [
        VolunteerResponse(
            id=str(v.id),
            event_id=v.event_id,
            organization_id=v.organization_id,
            name=v.name,
            email=v.email,
            phone=v.phone,
            role=v.role,
            skills=v.skills,
            status=v.status,
            total_tasks_assigned=v.total_tasks_assigned,
            total_tasks_completed=v.total_tasks_completed,
            total_hours_logged=v.total_hours_logged,
            checked_in=v.checked_in,
            invited_at=v.invited_at,
            accepted_at=v.accepted_at
        )
        for v in volunteers
    ]


@router.patch("/{volunteer_id}", response_model=VolunteerResponse)
async def update_volunteer(
    volunteer_id: str,
    volunteer_update: VolunteerUpdate,
    current_user: User = Depends(get_current_organizer)
):
    """Update volunteer details"""

    volunteer = await Volunteer.get(volunteer_id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    # Verify authorization
    event = await Event.get(volunteer.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update fields
    update_data = volunteer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(volunteer, field, value)

    volunteer.updated_at = datetime.utcnow()
    await volunteer.save()

    return VolunteerResponse(
        id=str(volunteer.id),
        event_id=volunteer.event_id,
        organization_id=volunteer.organization_id,
        name=volunteer.name,
        email=volunteer.email,
        phone=volunteer.phone,
        role=volunteer.role,
        skills=volunteer.skills,
        status=volunteer.status,
        total_tasks_assigned=volunteer.total_tasks_assigned,
        total_tasks_completed=volunteer.total_tasks_completed,
        total_hours_logged=volunteer.total_hours_logged,
        checked_in=volunteer.checked_in,
        invited_at=volunteer.invited_at,
        accepted_at=volunteer.accepted_at
    )


@router.post("/{volunteer_id}/check-in")
async def check_in_volunteer(
    volunteer_id: str,
    check_in_data: VolunteerCheckIn,
    current_user: User = Depends(get_current_organizer)
):
    """Check in/out volunteer"""

    volunteer = await Volunteer.get(volunteer_id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    event = await Event.get(volunteer.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if check_in_data.check_in:
        volunteer.checked_in = True
        volunteer.check_in_time = datetime.utcnow()
    else:
        volunteer.checked_in = False
        volunteer.check_out_time = datetime.utcnow()

        # Calculate hours if both check-in and check-out exist
        if volunteer.check_in_time and volunteer.check_out_time:
            hours = (volunteer.check_out_time - volunteer.check_in_time).total_seconds() / 3600
            volunteer.total_hours_logged += hours

    await volunteer.save()

    return {
        "success": True,
        "volunteer_id": str(volunteer.id),
        "checked_in": volunteer.checked_in,
        "check_in_time": volunteer.check_in_time,
        "check_out_time": volunteer.check_out_time,
        "total_hours_logged": volunteer.total_hours_logged
    }


@router.delete("/{volunteer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_volunteer(
    volunteer_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Remove volunteer from event"""

    volunteer = await Volunteer.get(volunteer_id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    event = await Event.get(volunteer.event_id)
    if event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await volunteer.delete()
