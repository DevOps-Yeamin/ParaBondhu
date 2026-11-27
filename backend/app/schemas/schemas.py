from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ----------------- User & Auth Schemas -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "citizen"
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    thana: Optional[str] = "Dhanmondi"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    division: Optional[str] = None
    district: Optional[str] = None
    thana: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_verified: bool
    reputation_score: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ----------------- TrafficAlert Schemas -----------------
class TrafficReportCreate(BaseModel):
    title: str
    description: str
    category: str = "congestion" # congestion, accident, waterlogging, road_closure, construction, checkpoint
    severity: str = "medium" # low, medium, high, severe
    latitude: float
    longitude: float
    location_name: str
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    suggested_alternative_route: Optional[str] = None

class TrafficVerificationCreate(BaseModel):
    vote_type: str # upvote, downvote, verify, flag
    comment: Optional[str] = None

class TrafficReportOut(BaseModel):
    id: int
    user_id: Optional[int]
    title: str
    description: str
    category: str
    severity: str
    latitude: float
    longitude: float
    location_name: str
    division: str
    district: str
    is_official: bool
    official_source: Optional[str] = None
    upvotes_count: int
    downvotes_count: int
    verified_count: int
    status: str
    suggested_alternative_route: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reporter_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- NeighborShare Schemas -----------------
class NeighborItemCreate(BaseModel):
    title: str
    description: str
    category: str = "tools"
    condition: str = "good"
    deposit_amount: Optional[float] = 0.0
    rental_rate_type: Optional[str] = "free"
    max_days: Optional[int] = 7
    location_name: str
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None

class NeighborItemOut(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    category: str
    condition: str
    status: str
    deposit_amount: float
    rental_rate_type: str
    max_days: int
    location_name: str
    division: str
    district: str
    latitude: Optional[float]
    longitude: Optional[float]
    image_url: Optional[str]
    created_at: datetime
    owner_name: Optional[str] = None
    owner_reputation: Optional[int] = None

    class Config:
        from_attributes = True

class NeighborLoanCreate(BaseModel):
    item_id: int
    requested_days: int = 3
    notes: Optional[str] = None

class NeighborLoanOut(BaseModel):
    id: int
    item_id: int
    borrower_id: int
    status: str
    requested_days: int
    start_date: datetime
    expected_return_date: Optional[datetime]
    actual_return_date: Optional[datetime]
    notes: Optional[str]
    rating: Optional[int]
    created_at: datetime
    item_title: Optional[str] = None
    borrower_name: Optional[str] = None

    class Config:
        from_attributes = True

class NeighborAssistanceCreate(BaseModel):
    title: str
    description: str
    category: str = "general" # elderly_support, emergency_ride, grocery_run, pet_care, tutor, general
    urgency: str = "normal"
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    location_name: str

class NeighborAssistanceOut(BaseModel):
    id: int
    author_id: int
    helper_id: Optional[int]
    title: str
    description: str
    category: str
    urgency: str
    status: str
    division: str
    district: str
    location_name: str
    created_at: datetime
    author_name: Optional[str] = None
    helper_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- KhunjeDao Schemas -----------------
class KhunjeDaoItemCreate(BaseModel):
    report_type: str # lost, found
    item_type: str # phone, wallet_bag, nid_passport, keys, electronics, pet, document, other
    title: str
    description: str
    primary_image_url: Optional[str] = None
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    location_name: str
    event_date: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    brand_or_identifier: Optional[str] = None
    safe_handover_location: Optional[str] = None
    contact_consent: Optional[bool] = True

class KhunjeDaoClaimCreate(BaseModel):
    proof_description: str
    proof_image_url: Optional[str] = None

class KhunjeDaoClaimOut(BaseModel):
    id: int
    item_id: int
    claimant_id: int
    proof_description: str
    proof_image_url: Optional[str]
    status: str
    verification_notes: Optional[str]
    created_at: datetime
    claimant_name: Optional[str] = None

    class Config:
        from_attributes = True

class KhunjeDaoItemOut(BaseModel):
    id: int
    reporter_id: int
    report_type: str
    item_type: str
    title: str
    description: str
    primary_image_url: Optional[str]
    division: str
    district: str
    location_name: str
    event_date: datetime
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    brand_or_identifier: Optional[str]
    safe_handover_location: Optional[str]
    contact_consent: bool
    created_at: datetime
    reporter_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- LineLess Schemas -----------------
class LineLessProviderCreate(BaseModel):
    name: str
    category: str
    address: str
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    latitude: Optional[float] = 23.8103
    longitude: Optional[float] = 90.4125
    phone: Optional[str] = None
    opening_time: Optional[str] = "09:00 AM"
    closing_time: Optional[str] = "05:00 PM"
    avg_service_time_mins: Optional[int] = 10

class LineLessQueueCreate(BaseModel):
    provider_id: int
    name: str
    estimated_wait_per_token_mins: Optional[int] = 8

class LineLessQueueOut(BaseModel):
    id: int
    provider_id: int
    name: str
    is_accepting_tokens: bool
    current_token_number: int
    next_token_number: int
    estimated_wait_per_token_mins: int
    created_at: datetime

    class Config:
        from_attributes = True

class LineLessProviderOut(BaseModel):
    id: int
    name: str
    category: str
    address: str
    division: str
    district: str
    latitude: float
    longitude: float
    phone: Optional[str]
    opening_time: str
    closing_time: str
    is_active: bool
    avg_service_time_mins: int
    total_served_today: int
    queues: List[LineLessQueueOut] = []

    class Config:
        from_attributes = True

class LineLessTokenCreate(BaseModel):
    queue_id: int
    notes: Optional[str] = None

class LineLessTokenOut(BaseModel):
    id: int
    queue_id: int
    user_id: int
    token_number: int
    token_code: str
    status: str
    estimated_call_time: Optional[datetime]
    called_at: Optional[datetime]
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    queue_name: Optional[str] = None
    provider_name: Optional[str] = None
    current_queue_token: Optional[int] = None

    class Config:
        from_attributes = True

# ----------------- EasyAccess Schemas -----------------
class EasyAccessSpotCreate(BaseModel):
    title: str
    category: str
    address: str
    division: Optional[str] = "Dhaka"
    district: Optional[str] = "Dhaka"
    latitude: float
    longitude: float
    has_wheelchair_ramp: bool = False
    has_lift_elevator: bool = False
    has_accessible_toilet: bool = False
    has_wide_doors: bool = False
    has_tactile_paving: bool = False
    has_accessible_parking: bool = False
    notes: Optional[str] = None
    images_json: Optional[str] = None

class EasyAccessReviewCreate(BaseModel):
    rating: int = 5
    comment: Optional[str] = None
    ramp_ok: bool = True
    elevator_ok: bool = True
    toilet_ok: bool = True

class EasyAccessReviewOut(BaseModel):
    id: int
    spot_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    ramp_ok: bool
    elevator_ok: bool
    toilet_ok: bool
    created_at: datetime
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True

class EasyAccessSpotOut(BaseModel):
    id: int
    title: str
    category: str
    address: str
    division: str
    district: str
    latitude: float
    longitude: float
    has_wheelchair_ramp: bool
    has_lift_elevator: bool
    has_accessible_toilet: bool
    has_wide_doors: bool
    has_tactile_paving: bool
    has_accessible_parking: bool
    overall_rating: float
    verified_by_community: bool
    verification_count: int
    images_json: Optional[str]
    notes: Optional[str]
    created_at: datetime
    reviews: List[EasyAccessReviewOut] = []

    class Config:
        from_attributes = True

# ----------------- ProbashiConnect Schemas -----------------
class ProbashiJobCreate(BaseModel):
    title: str
    destination_country: str
    visa_type: str
    sector: str
    required_skills: str
    salary_range: str
    recruiter_agency: str
    bmet_approval_no: Optional[str] = None
    rl_license_no: Optional[str] = None
    is_verified_agency: bool = True
    source_type: str = "bmet_approved"
    cost_guidelines: Optional[str] = None
    warnings_against_brokers: Optional[str] = None

class ProbashiJobOut(BaseModel):
    id: int
    title: str
    destination_country: str
    visa_type: str
    sector: str
    required_skills: str
    salary_range: str
    recruiter_agency: str
    bmet_approval_no: Optional[str]
    rl_license_no: Optional[str]
    is_verified_agency: bool
    source_type: str
    publication_date: datetime
    expiry_date: Optional[datetime]
    cost_guidelines: Optional[str]
    warnings_against_brokers: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ProbashiGuideOut(BaseModel):
    id: int
    country: str
    category: str
    title: str
    content: str
    helpline_phone: Optional[str]
    official_links: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Skill & WorkHub Schemas -----------------
class SkillCourseCreate(BaseModel):
    title: str
    provider_name: str
    category: str
    level: str
    duration_weeks: int
    is_free: bool
    price_bdt: float = 0.0
    certificate_provided: bool = True
    language: str = "Bangla"
    enrollment_url: Optional[str] = None
    description: str

class SkillCourseOut(BaseModel):
    id: int
    title: str
    provider_name: str
    category: str
    level: str
    duration_weeks: int
    is_free: bool
    price_bdt: float
    certificate_provided: bool
    language: str
    enrollment_url: Optional[str]
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

class WorkHubJobCreate(BaseModel):
    title: str
    company_name: str
    job_type: str = "full_time"
    workplace_type: str = "on_site"
    location: str = "Dhaka, Bangladesh"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    skills_required: str
    experience_level: str = "entry_level"
    description: str

class WorkHubJobOut(BaseModel):
    id: int
    employer_id: Optional[int]
    title: str
    company_name: str
    job_type: str
    workplace_type: str
    location: str
    salary_min: Optional[float]
    salary_max: Optional[float]
    skills_required: str
    experience_level: str
    description: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class WorkHubApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class WorkHubApplicationOut(BaseModel):
    id: int
    job_id: int
    applicant_id: int
    cover_letter: Optional[str]
    resume_url: Optional[str]
    portfolio_url: Optional[str]
    status: str
    created_at: datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Notifications & Stats -----------------
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    category: str
    link_url: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PlatformStats(BaseModel):
    active_citizens: int
    traffic_reports_today: int
    active_community_loans: int
    reunited_items_count: int
    virtual_tokens_served: int
    accessible_spots_mapped: int
    verified_probashi_jobs: int
    active_job_seekers: int
