from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import ProbashiJob, ProbashiGuide, User
from backend.app.schemas.schemas import ProbashiJobCreate, ProbashiJobOut, ProbashiGuideOut
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/probashi", tags=["ProbashiConnect"])

@router.get("/jobs", response_model=List[ProbashiJobOut])
def get_overseas_jobs(
    country: Optional[str] = None,
    sector: Optional[str] = None,
    verified_only: bool = True,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProbashiJob)
    if country:
        query = query.filter(ProbashiJob.destination_country.ilike(f"%{country}%"))
    if sector:
        query = query.filter(ProbashiJob.sector.ilike(f"%{sector}%"))
    if verified_only:
        query = query.filter(ProbashiJob.is_verified_agency == True)
    if search:
        query = query.filter(
            (ProbashiJob.title.ilike(f"%{search}%")) |
            (ProbashiJob.recruiter_agency.ilike(f"%{search}%")) |
            (ProbashiJob.required_skills.ilike(f"%{search}%"))
        )

    jobs = query.order_by(desc(ProbashiJob.publication_date)).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=ProbashiJobOut)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ProbashiJob).filter(ProbashiJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job

@router.post("/jobs", response_model=ProbashiJobOut)
def create_probashi_job(
    job_in: ProbashiJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only verified agencies, partners, or admins can post overseas jobs
    job = ProbashiJob(
        publisher_id=current_user.id,
        title=job_in.title,
        destination_country=job_in.destination_country,
        visa_type=job_in.visa_type,
        sector=job_in.sector,
        required_skills=job_in.required_skills,
        salary_range=job_in.salary_range,
        recruiter_agency=job_in.recruiter_agency,
        bmet_approval_no=job_in.bmet_approval_no,
        rl_license_no=job_in.rl_license_no,
        is_verified_agency=job_in.is_verified_agency,
        source_type=job_in.source_type,
        cost_guidelines=job_in.cost_guidelines or "Official government expense guideline applies. Do not pay unauthorized middlemen.",
        warnings_against_brokers=job_in.warnings_against_brokers or "Never pay cash without BMET clearance and bank voucher. Verify visa online before travel."
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/guides", response_model=List[ProbashiGuideOut])
def get_probashi_guides(
    country: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProbashiGuide)
    if country:
        query = query.filter(ProbashiGuide.country.ilike(f"%{country}%"))
    if category:
        query = query.filter(ProbashiGuide.category == category)
    return query.all()
