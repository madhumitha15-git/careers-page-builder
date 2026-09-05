from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="company")
    career_page = relationship(
        "CareerPage",
        back_populates="company",
        uselist=False
    )
    jobs = relationship("Job", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="recruiter")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="users")


class CareerPage(Base):
    __tablename__ = "career_pages"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        unique=True,
        nullable=False
    )

    headline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)
    culture_video_url = Column(String(500), nullable=True)

    primary_color = Column(
        String(20),
        nullable=False,
        default="#172033"
    )

    secondary_color = Column(
        String(20),
        nullable=False,
        default="#5267e8"
    )

    is_published = Column(Boolean, default=False, nullable=False)

    company = relationship("Company", back_populates="career_page")

    sections = relationship(
        "Section",
        back_populates="career_page",
        order_by="Section.display_order",
        cascade="all, delete-orphan"
    )


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    career_page_id = Column(
        Integer,
        ForeignKey("career_pages.id"),
        nullable=False
    )

    section_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    is_visible = Column(Boolean, default=True, nullable=False)

    career_page = relationship("CareerPage", back_populates="sections")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=False)
    job_type = Column(String(50), nullable=False)
    department = Column(String(100), nullable=True)
    is_open = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="jobs")