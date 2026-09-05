from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CareerPage, Company, Job, User
from ..schemas import JobCreate, JobResponse
from ..security.permissions import require_recruiter


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# ============================================================
# PUBLIC JOB SEARCH
# ============================================================

@router.get(
    "/public/{company_slug}",
    response_model=list[JobResponse]
)
def get_public_jobs(
    company_slug: str,
    search: str | None = Query(
        default=None,
        description="Search jobs by title"
    ),
    location: str | None = Query(
        default=None,
        description="Filter jobs by location"
    ),
    job_type: str | None = Query(
        default=None,
        description="Filter jobs by type"
    ),
    db: Session = Depends(get_db)
):
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

    query = (
        db.query(Job)
        .filter(
            Job.company_id == company.id,
            Job.is_open.is_(True)
        )
    )

    if search:
        query = query.filter(
            Job.title.ilike(f"%{search}%")
        )

    if location:
        query = query.filter(
            Job.location.ilike(f"%{location}%")
        )

    if job_type:
        query = query.filter(
            Job.job_type.ilike(f"%{job_type}%")
        )

    return (
        query
        .order_by(Job.created_at.desc())
        .all()
    )


# ============================================================
# RECRUITER JOB MANAGEMENT
# ============================================================

@router.post(
    "/",
    response_model=JobResponse
)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = Job(
        company_id=current_user.company_id,
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        job_type=job_data.job_type,
        department=job_data.department,
        is_open=job_data.is_open
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get(
    "/",
    response_model=list[JobResponse]
)
def get_my_jobs(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(Job)
        .filter(
            Job.company_id == current_user.company_id
        )
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs


@router.get(
    "/{job_id}",
    response_model=JobResponse
)
def get_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.company_id == current_user.company_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


@router.put(
    "/{job_id}",
    response_model=JobResponse
)
def update_job(
    job_id: int,
    job_data: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.company_id == current_user.company_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.title = job_data.title
    job.description = job_data.description
    job.location = job_data.location
    job.job_type = job_data.job_type
    job.department = job_data.department
    job.is_open = job_data.is_open

    db.commit()
    db.refresh(job)

    return job


@router.delete(
    "/{job_id}"
)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.company_id == current_user.company_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    db.delete(job)
    db.commit()

    return {
        "message": "Job deleted successfully"
    }