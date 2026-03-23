from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.dependencies.auth import get_current_user, get_current_organizer
from typing import List
from datetime import datetime

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new organization"""

    # Check if organization name already exists
    existing_org = await Organization.find_one({"name": org_data.name})
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization name already exists"
        )

    # Create organization
    new_org = Organization(
        name=org_data.name,
        email=org_data.email,
        description=org_data.description,
        phone=org_data.phone,
        address=org_data.address,
        city=org_data.city,
        country=org_data.country,
        postal_code=org_data.postal_code,
        social_links=org_data.social_links,
        owner_id=str(current_user.id),
        admin_ids=[str(current_user.id)]
    )

    await new_org.insert()

    # Update user role to organizer and link to organization
    current_user.role = UserRole.ORGANIZER
    current_user.organization_id = str(new_org.id)
    await current_user.save()

    return OrganizationResponse(
        id=str(new_org.id),
        name=new_org.name,
        email=new_org.email,
        description=new_org.description,
        phone=new_org.phone,
        address=new_org.address,
        city=new_org.city,
        country=new_org.country,
        postal_code=new_org.postal_code,
        logo_url=new_org.logo_url,
        cover_image_url=new_org.cover_image_url,
        social_links=new_org.social_links,
        owner_id=new_org.owner_id,
        admin_ids=new_org.admin_ids,
        is_verified=new_org.is_verified,
        total_events=new_org.total_events,
        is_active=new_org.is_active,
        created_at=new_org.created_at
    )


@router.get("", response_model=List[OrganizationResponse])
async def get_organizations(
    skip: int = 0,
    limit: int = 20,
    city: str = None,
    is_verified: bool = None
):
    """Get list of organizations with filters"""

    query = {"is_active": True}

    if city:
        query["city"] = city

    if is_verified is not None:
        query["is_verified"] = is_verified

    organizations = await Organization.find(query).skip(skip).limit(limit).to_list()

    return [
        OrganizationResponse(
            id=str(org.id),
            name=org.name,
            email=org.email,
            description=org.description,
            phone=org.phone,
            address=org.address,
            city=org.city,
            country=org.country,
            postal_code=org.postal_code,
            logo_url=org.logo_url,
            cover_image_url=org.cover_image_url,
            social_links=org.social_links,
            owner_id=org.owner_id,
            admin_ids=org.admin_ids,
            is_verified=org.is_verified,
            total_events=org.total_events,
            is_active=org.is_active,
            created_at=org.created_at
        )
        for org in organizations
    ]


@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(organization_id: str):
    """Get organization by ID"""

    organization = await Organization.get(organization_id)

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    return OrganizationResponse(
        id=str(organization.id),
        name=organization.name,
        email=organization.email,
        description=organization.description,
        phone=organization.phone,
        address=organization.address,
        city=organization.city,
        country=organization.country,
        postal_code=organization.postal_code,
        logo_url=organization.logo_url,
        cover_image_url=organization.cover_image_url,
        social_links=organization.social_links,
        owner_id=organization.owner_id,
        admin_ids=organization.admin_ids,
        is_verified=organization.is_verified,
        total_events=organization.total_events,
        is_active=organization.is_active,
        created_at=organization.created_at
    )


@router.patch("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: str,
    org_update: OrganizationUpdate,
    current_user: User = Depends(get_current_organizer)
):
    """Update organization (only owner/admins)"""

    organization = await Organization.get(organization_id)

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    # Check if user is owner or admin
    if organization.owner_id != str(current_user.id) and str(current_user.id) not in organization.admin_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this organization"
        )

    # Update fields
    update_data = org_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organization, field, value)

    organization.updated_at = datetime.utcnow()
    await organization.save()

    return OrganizationResponse(
        id=str(organization.id),
        name=organization.name,
        email=organization.email,
        description=organization.description,
        phone=organization.phone,
        address=organization.address,
        city=organization.city,
        country=organization.country,
        postal_code=organization.postal_code,
        logo_url=organization.logo_url,
        cover_image_url=organization.cover_image_url,
        social_links=organization.social_links,
        owner_id=organization.owner_id,
        admin_ids=organization.admin_ids,
        is_verified=organization.is_verified,
        total_events=organization.total_events,
        is_active=organization.is_active,
        created_at=organization.created_at
    )


@router.get("/my/organizations", response_model=List[OrganizationResponse])
async def get_my_organizations(current_user: User = Depends(get_current_organizer)):
    """Get organizations owned/managed by current user"""

    organizations = await Organization.find({
        "$or": [
            {"owner_id": str(current_user.id)},
            {"admin_ids": str(current_user.id)}
        ]
    }).to_list()

    return [
        OrganizationResponse(
            id=str(org.id),
            name=org.name,
            email=org.email,
            description=org.description,
            phone=org.phone,
            address=org.address,
            city=org.city,
            country=org.country,
            postal_code=org.postal_code,
            logo_url=org.logo_url,
            cover_image_url=org.cover_image_url,
            social_links=org.social_links,
            owner_id=org.owner_id,
            admin_ids=org.admin_ids,
            is_verified=org.is_verified,
            total_events=org.total_events,
            is_active=org.is_active,
            created_at=org.created_at
        )
        for org in organizations
    ]
