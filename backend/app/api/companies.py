
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company, User
from ..schemas import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
)
from ..security.permissions import require_recruiter


router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


@router.post(
    "/",
    response_model=CompanyResponse
)
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    existing_company = (
        db.query(Company)
        .filter(
            Company.slug == company_data.slug
        )
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company slug already exists"
        )

    company = Company(
        name=company_data.name,
        slug=company_data.slug,
        logo_url=company_data.logo_url
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


@router.get(
    "/my-company",
    response_model=CompanyResponse
)
def get_my_company(
    current_user: User = Depends(
        require_recruiter
    ),
    db: Session = Depends(get_db)
):
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

    return company


@router.put(
    "/my-company",
    response_model=CompanyResponse
)
def update_my_company(
    company_data: CompanyUpdate,
    current_user: User = Depends(
        require_recruiter
    ),
    db: Session = Depends(get_db)
):
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

    company.name = company_data.name.strip()
    company.logo_url = (
        company_data.logo_url.strip()
        if company_data.logo_url
        else None
    )

    db.commit()
    db.refresh(company)

    return company

