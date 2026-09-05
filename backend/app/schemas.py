
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    slug: str
    logo_url: str | None = None


class CompanyUpdate(BaseModel):
    name: str
    logo_url: str | None = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    company_id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class CareerPageCreate(BaseModel):
    headline: str | None = None
    description: str | None = None
    banner_url: str | None = None
    culture_video_url: str | None = None
    primary_color: str = "#172033"
    secondary_color: str = "#5267e8"


class CareerPageResponse(BaseModel):
    id: int
    company_id: int
    headline: str | None = None
    description: str | None = None
    banner_url: str | None = None
    culture_video_url: str | None = None
    primary_color: str
    secondary_color: str
    is_published: bool

    model_config = ConfigDict(from_attributes=True)


class SectionCreate(BaseModel):
    section_type: str
    title: str | None = None
    content: str | None = None
    display_order: int = 0
    is_visible: bool = True


class SectionResponse(BaseModel):
    id: int
    career_page_id: int
    section_type: str
    title: str | None = None
    content: str | None = None
    display_order: int
    is_visible: bool

    model_config = ConfigDict(from_attributes=True)


class JobCreate(BaseModel):
    title: str
    description: str | None = None
    location: str
    job_type: str
    department: str | None = None
    is_open: bool = True


class JobResponse(BaseModel):
    id: int
    company_id: int
    title: str
    description: str | None = None
    location: str
    job_type: str
    department: str | None = None
    is_open: bool
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class PublicCareerPageResponse(BaseModel):
    company: CompanyResponse
    career_page: CareerPageResponse
    sections: list[SectionResponse]
    jobs: list[JobResponse]

