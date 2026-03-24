from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user"""

    # Check if user already exists
    existing_user = await User.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    existing_username = await User.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        phone=user_data.phone,
        city=user_data.city,
        country=user_data.country,
        role=user_data.role,
    )

    await new_user.insert()

    # If user signed up as organizer, auto-create organization
    if user_data.role == UserRole.ORGANIZER:
        # Generate organization name
        org_name = user_data.organization_name or f"{user_data.full_name}'s Organization"

        # Check if organization name already exists
        org_name_exists = await Organization.find_one({"name": org_name})
        if org_name_exists:
            org_name = f"{org_name} ({user_data.username})"

        # Create organization
        organization = Organization(
            name=org_name,
            email=user_data.email,
            phone=user_data.phone,
            city=user_data.city or "Not specified",
            country=user_data.country or "Not specified",
            address="",
            postal_code="",
            description=f"Organization managed by {user_data.full_name}",
            owner_id=str(new_user.id),
            admin_ids=[str(new_user.id)]
        )

        await organization.insert()

        # Link user to organization
        new_user.organization_id = str(organization.id)
        new_user.role = UserRole.ORGANIZER
        await new_user.save()

    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})

    # Update last login
    new_user.last_login = datetime.utcnow()
    await new_user.save()

    user_response = UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        username=new_user.username,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        avatar_url=new_user.avatar_url,
        city=new_user.city,
        country=new_user.country,
        organization_id=new_user.organization_id,
        loyalty_points=new_user.loyalty_points,
        total_bookings=new_user.total_bookings,
        is_active=new_user.is_active,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at
    )

    # Include organization details in response if organizer
    org_response = None
    if user_data.role == UserRole.ORGANIZER and new_user.organization_id:
        org = await Organization.get(new_user.organization_id)
        if org:
            org_response = {
                "id": str(org.id),
                "name": org.name,
                "email": org.email,
                "phone": org.phone,
                "city": org.city,
                "country": org.country,
                "is_verified": org.is_verified
            }

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response,
        organization=org_response
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return JWT tokens"""

    # Find user by email
    user = await User.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Update last login
    user.last_login = datetime.utcnow()
    await user.save()

    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        avatar_url=user.avatar_url,
        city=user.city,
        country=user.country,
        organization_id=user.organization_id,
        loyalty_points=user.loyalty_points,
        total_bookings=user.total_bookings,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at
    )

    # Include organization details in response if organizer
    org_response = None
    if user.role == UserRole.ORGANIZER and user.organization_id:
        org = await Organization.get(user.organization_id)
        if org:
            org_response = {
                "id": str(org.id),
                "name": org.name,
                "email": org.email,
                "phone": org.phone,
                "city": org.city,
                "country": org.country,
                "is_verified": org.is_verified
            }

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response,
        organization=org_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        avatar_url=current_user.avatar_url,
        city=current_user.city,
        country=current_user.country,
        organization_id=current_user.organization_id,
        loyalty_points=current_user.loyalty_points,
        total_bookings=current_user.total_bookings,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )
