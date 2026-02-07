"""
Authentication routes
Handles user signup, login, and profile
"""

from fastapi import APIRouter, HTTPException, status, Depends
from psycopg2.errors import UniqueViolation

from app.models.user import (
    UserSignupRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    MessageResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.services.database_service import (
    create_user,
    get_user_by_email,
    get_user_by_id
)

router = APIRouter(prefix="/api/auth", tags=["auth"])  # ✅ Added prefix here


# ========================================
# Signup Endpoint
# ========================================

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: UserSignupRequest):
    """
    Create a new user account
    
    Returns:
        JWT token + user info
    """
    
    # Check if user already exists
    existing_user = await get_user_by_email(request.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(request.password)
    
    # Create user in database
    try:
        user = await create_user(
            email=request.email,
            password_hash=password_hash,
            name=request.name
        )
        
        print(f"✅ User created: {user['email']}")
        
    except Exception as e:
        print(f"❌ Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # ✅ Generate JWT token WITH user_id
    access_token = create_access_token(data={
        "sub": user['email'],
        "user_id": user['id']  # ✅ ADDED THIS!
    })
    
    # Return token + user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            created_at=user['created_at']
        )
    )


# ========================================
# Login Endpoint
# ========================================

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest):
    """
    Login with email and password
    
    Returns:
        JWT token + user info
    """
    
    # Get user from database
    user = await get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"✅ User logged in: {user['email']}")
    
    # ✅ Generate JWT token WITH user_id
    access_token = create_access_token(data={
        "sub": user['email'],
        "user_id": user['id']  # ✅ ADDED THIS!
    })
    
    # Return token + user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            created_at=user['created_at']
        )
    )


# ========================================
# Get Current User Profile
# ========================================

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile
    
    Requires: JWT token in Authorization header
    """
    
    email = current_user.get("sub")
    
    user = await get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        created_at=user['created_at']
    )


# ========================================
# Health Check
# ========================================

@router.get("/health", response_model=MessageResponse)
async def health_check():
    """
    Check if auth service is running
    """
    return MessageResponse(message="Auth service is healthy")
