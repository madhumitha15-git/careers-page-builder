from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CareerPage, Company, Job, Section, User
from ..schemas import (
    CareerPageCreate,
    CareerPageResponse,
    PublicCareerPageResponse,
)
from ..security.permissions import require_recruiter


router = APIRouter(
    prefix="/careers",
    tags=["Career Pages"]
)


def get_my_career_page(
    current_user: User,
    db: Session
):
    career_page = (
        db.query(CareerPage)
        .filter(
            CareerPage.company_id == current_user.company_id
        )
        .first()
    )

    if not career_page:
        raise HTTPException(
            status_code=404,
            detail="Career page not found"
        )

    return career_page


@router.post(
    "/",
    response_model=CareerPageResponse
)
def create_career_page(
    page_data: CareerPageCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    existing_page = (
        db.query(CareerPage)
        .filter(
            CareerPage.company_id == current_user.company_id
        )
        .first()
    )

    if existing_page:
        raise HTTPException(
            status_code=400,
            detail="Career page already exists"
        )

    career_page = CareerPage(
        company_id=current_user.company_id,
        headline=page_data.headline,
        description=page_data.description,
        banner_url=page_data.banner_url,
        culture_video_url=page_data.culture_video_url,
        primary_color=page_data.primary_color,
        secondary_color=page_data.secondary_color,
        is_published=False
    )

    db.add(career_page)
    db.commit()
    db.refresh(career_page)

    return career_page


@router.get(
    "/my-page",
    response_model=CareerPageResponse
)
def get_my_career_page_endpoint(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    return get_my_career_page(
        current_user,
        db
    )


@router.get(
    "/my-page/preview",
    response_model=PublicCareerPageResponse
)
def preview_my_career_page(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Return the current company's draft for authenticated recruiter preview.

    This endpoint intentionally does not require the page to be published.
    It is separate from the public careers endpoint so unpublished content
    is never exposed to unauthenticated visitors.
    """

    career_page = get_my_career_page(
        current_user,
        db
    )

    company = (
        db.query(Company)
        .filter(
            Company.id == current_user.company_id
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    sections = (
        db.query(Section)
        .filter(
            Section.career_page_id == career_page.id,
            Section.is_visible.is_(True)
        )
        .order_by(
            Section.display_order
        )
        .all()
    )

    jobs = (
        db.query(Job)
        .filter(
            Job.company_id == current_user.company_id,
            Job.is_open.is_(True)
        )
        .order_by(
            Job.created_at.desc()
        )
        .all()
    )

    return {
        "company": company,
        "career_page": career_page,
        "sections": sections,
        "jobs": jobs
    }


@router.put(
    "/my-page",
    response_model=CareerPageResponse
)
def update_my_career_page(
    page_data: CareerPageCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    career_page.headline = page_data.headline
    career_page.description = page_data.description
    career_page.banner_url = page_data.banner_url
    career_page.culture_video_url = page_data.culture_video_url
    career_page.primary_color = page_data.primary_color
    career_page.secondary_color = page_data.secondary_color

    db.commit()
    db.refresh(career_page)

    return career_page


@router.post(
    "/my-page/publish",
    response_model=CareerPageResponse
)
def publish_my_career_page(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    career_page.is_published = True

    db.commit()
    db.refresh(career_page)

    return career_page

