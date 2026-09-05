from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CareerPage, Company, User
from ..schemas import (
    TokenResponse,
    UserCreate,
    UserResponse,
)
from ..security.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Prevent duplicate recruiter accounts.
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Company slugs must be unique because they are used
    # in the public careers URL.
    existing_company = (
        db.query(Company)
        .filter(Company.slug == user_data.company_slug)
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company slug already exists"
        )

    # Create the company for this recruiter.
    company = Company(
        name=user_data.company_name,
        slug=user_data.company_slug
    )

    db.add(company)
    db.flush()

    # Every company gets a career page automatically.
    career_page = CareerPage(
        company_id=company.id,
        headline=f"Careers at {company.name}",
        description=f"Join {company.name} and build the future with us.",
        primary_color="#172033",
        secondary_color="#5267e8",
        is_published=False
    )

    db.add(career_page)

    # Create the recruiter and associate them
    # with the company created above.
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="recruiter",
        company_id=company.id
    )

    db.add(user)

    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "company_id": str(user.company_id),
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")

        if not user_id:
            raise ValueError("Missing user ID")

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user