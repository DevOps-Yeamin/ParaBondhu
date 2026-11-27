from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import SkillCourse, WorkHubJob, WorkHubApplication, User
from backend.app.schemas.schemas import (
    SkillCourseCreate, SkillCourseOut,
    WorkHubJobCreate, WorkHubJobOut,
    WorkHubApplicationCreate, WorkHubApplicationOut
)
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/workhub", tags=["Skill & Work Hub"])

# ----------------- Courses & Upskilling -----------------
@router.get("/courses", response_model=List[SkillCourseOut])
def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    is_free: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SkillCourse)
    if category:
        query = query.filter(SkillCourse.category == category)
    if level:
        query = query.filter(SkillCourse.level == level)
    if is_free is not None:
        query = query.filter(SkillCourse.is_free == is_free)
    if search:
        query = query.filter(
            (SkillCourse.title.ilike(f"%{search}%")) |
            (SkillCourse.description.ilike(f"%{search}%")) |
            (SkillCourse.provider_name.ilike(f"%{search}%"))
        )
    return query.order_by(desc(SkillCourse.created_at)).all()

@router.post("/courses", response_model=SkillCourseOut)
def create_course(
    course_in: SkillCourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = SkillCourse(
        title=course_in.title,
        provider_name=course_in.provider_name,
        category=course_in.category,
        level=course_in.level,
        duration_weeks=course_in.duration_weeks,
        is_free=course_in.is_free,
        price_bdt=course_in.price_bdt,
        certificate_provided=course_in.certificate_provided,
        language=course_in.language,
        enrollment_url=course_in.enrollment_url,
        description=course_in.description
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

# ----------------- Jobs & Gigs -----------------
@router.get("/jobs", response_model=List[WorkHubJobOut])
def get_jobs(
    job_type: Optional[str] = None,
    workplace_type: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(WorkHubJob)
    if job_type:
        query = query.filter(WorkHubJob.job_type == job_type)
    if workplace_type:
        query = query.filter(WorkHubJob.workplace_type == workplace_type)
    if location:
        query = query.filter(WorkHubJob.location.ilike(f"%{location}%"))
    if search:
        query = query.filter(
            (WorkHubJob.title.ilike(f"%{search}%")) |
            (WorkHubJob.company_name.ilike(f"%{search}%")) |
            (WorkHubJob.skills_required.ilike(f"%{search}%"))
        )
    return query.order_by(desc(WorkHubJob.created_at)).all()

@router.post("/jobs", response_model=WorkHubJobOut)
def create_job(
    job_in: WorkHubJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = WorkHubJob(
        employer_id=current_user.id,
        title=job_in.title,
        company_name=job_in.company_name,
        job_type=job_in.job_type,
        workplace_type=job_in.workplace_type,
        location=job_in.location,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        skills_required=job_in.skills_required,
        experience_level=job_in.experience_level,
        description=job_in.description,
        is_verified=True
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.post("/applications", response_model=WorkHubApplicationOut)
def apply_to_job(
    app_in: WorkHubApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(WorkHubJob).filter(WorkHubJob.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(WorkHubApplication).filter(
        WorkHubApplication.job_id == job.id,
        WorkHubApplication.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this role")

    application = WorkHubApplication(
        job_id=job.id,
        applicant_id=current_user.id,
        cover_letter=app_in.cover_letter,
        resume_url=app_in.resume_url,
        portfolio_url=app_in.portfolio_url,
        status="submitted"
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    out = WorkHubApplicationOut.model_validate(application)
    out.job_title = job.title
    out.company_name = job.company_name
    return out

@router.get("/my-applications", response_model=List[WorkHubApplicationOut])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(WorkHubApplication).filter(
        WorkHubApplication.applicant_id == current_user.id
    ).order_by(desc(WorkHubApplication.created_at)).all()

    result = []
    for a in apps:
        out = WorkHubApplicationOut.model_validate(a)
        out.job_title = a.job.title if a.job else "Position"
        out.company_name = a.job.company_name if a.job else "Company"
        result.append(out)
    return result
