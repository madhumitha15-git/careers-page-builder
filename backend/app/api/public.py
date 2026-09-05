from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CareerPage, Company, Job, Section
from ..schemas import PublicCareerPageResponse


router = APIRouter(
    prefix="/public",
    tags=["Public Careers"]
)


@router.get(
    "/{company_slug}",
    response_model=PublicCareerPageResponse
)
def get_public_career_page(
    company_slug: str,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # Find company
    # --------------------------------------------------------

    company = (
        db.query(Company)
        .filter(
            Company.slug == company_slug
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    # --------------------------------------------------------
    # Only published career pages are public
    # --------------------------------------------------------

    career_page = (
        db.query(CareerPage)
        .filter(
            CareerPage.company_id == company.id,
            CareerPage.is_published.is_(True)
        )
        .first()
    )

    if not career_page:
        raise HTTPException(
            status_code=404,
            detail="Published career page not found"
        )

    # --------------------------------------------------------
    # Only visible sections belonging to this career page
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Only open jobs belonging to this company
    # --------------------------------------------------------

    jobs = (
        db.query(Job)
        .filter(
            Job.company_id == company.id,
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

