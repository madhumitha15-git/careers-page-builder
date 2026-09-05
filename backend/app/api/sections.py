
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CareerPage, Section, User
from ..schemas import SectionCreate, SectionResponse
from ..security.permissions import require_recruiter


router = APIRouter(
    prefix="/careers/my-page/sections",
    tags=["Career Sections"]
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
    response_model=SectionResponse
)
def create_section(
    section_data: SectionCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    section = Section(
        career_page_id=career_page.id,
        section_type=section_data.section_type,
        title=section_data.title,
        content=section_data.content,
        display_order=section_data.display_order,
        is_visible=section_data.is_visible
    )

    db.add(section)
    db.commit()
    db.refresh(section)

    return section


@router.get(
    "/",
    response_model=list[SectionResponse]
)
def get_sections(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    sections = (
        db.query(Section)
        .filter(
            Section.career_page_id == career_page.id
        )
        .order_by(Section.display_order)
        .all()
    )

    return sections


@router.put(
    "/reorder"
)
def reorder_sections(
    section_ids: list[int],
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    sections = (
        db.query(Section)
        .filter(
            Section.career_page_id == career_page.id
        )
        .all()
    )

    existing_ids = {
        section.id
        for section in sections
    }

    requested_ids = set(section_ids)

    if requested_ids != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="Section list does not match this career page"
        )

    if len(section_ids) != len(existing_ids):
        raise HTTPException(
            status_code=400,
            detail="Duplicate section IDs are not allowed"
        )

    sections_by_id = {
        section.id: section
        for section in sections
    }

    for position, section_id in enumerate(
        section_ids,
        start=1
    ):
        sections_by_id[
            section_id
        ].display_order = position

    db.commit()

    return {
        "message": "Sections reordered successfully"
    }


@router.put(
    "/{section_id}",
    response_model=SectionResponse
)
def update_section(
    section_id: int,
    section_data: SectionCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    section = (
        db.query(Section)
        .filter(
            Section.id == section_id,
            Section.career_page_id == career_page.id
        )
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )

    section.section_type = section_data.section_type
    section.title = section_data.title
    section.content = section_data.content
    section.display_order = section_data.display_order
    section.is_visible = section_data.is_visible

    db.commit()
    db.refresh(section)

    return section


@router.delete(
    "/{section_id}"
)
def delete_section(
    section_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    career_page = get_my_career_page(
        current_user,
        db
    )

    section = (
        db.query(Section)
        .filter(
            Section.id == section_id,
            Section.career_page_id == career_page.id
        )
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )

    db.delete(section)
    db.commit()

    return {
        "message": "Section deleted successfully"
    }
