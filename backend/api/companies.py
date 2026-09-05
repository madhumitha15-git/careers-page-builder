from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company
from ..schemas import CompanyCreate, CompanyResponse


router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


@router.post("/", response_model=CompanyResponse)
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    existing_company = (
        db.query(Company)
        .filter(Company.slug == company_data.slug)
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