from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="citizen")  # citizen, provider, moderator, admin
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    thana = Column(String(100), default="Dhanmondi")
    avatar_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    reputation_score = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    traffic_reports = relationship("TrafficReport", back_populates="user", cascade="all, delete-orphan")
    items_owned = relationship("NeighborItem", back_populates="owner", cascade="all, delete-orphan")
    assistance_requests = relationship("NeighborAssistance", foreign_keys="NeighborAssistance.author_id", back_populates="author")
    khunje_items = relationship("KhunjeDaoItem", back_populates="reporter")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class TrafficReport(Base):
    __tablename__ = "traffic_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="congestion")  # congestion, accident, waterlogging, road_closure, construction, checkpoint
    severity = Column(String(50), default="medium")  # low, medium, high, severe
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=False)
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    
    is_official = Column(Boolean, default=False)
    official_source = Column(String(255), nullable=True)  # e.g., "Dhaka Metropolitan Police Traffic Div", "BIWTA"
    
    upvotes_count = Column(Integer, default=1)
    downvotes_count = Column(Integer, default=0)
    verified_count = Column(Integer, default=0)
    status = Column(String(50), default="active")  # active, resolved, debunked
    suggested_alternative_route = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="traffic_reports")
    verifications = relationship("TrafficVerification", back_populates="report", cascade="all, delete-orphan")


class TrafficVerification(Base):
    __tablename__ = "traffic_verifications"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("traffic_reports.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vote_type = Column(String(20), nullable=False)  # upvote, downvote, verify, flag
    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("TrafficReport", back_populates="verifications")


class NeighborItem(Base):
    __tablename__ = "neighbor_items"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="tools")  # tools, kitchen, medical, books, electronics, baby_gear, sports, other
    condition = Column(String(50), default="good")  # new, like_new, good, fair
    status = Column(String(50), default="available")  # available, requested, lent, returned, maintenance
    deposit_amount = Column(Float, default=0.0)
    rental_rate_type = Column(String(50), default="free")  # free, small_deposit, voluntary_treat
    max_days = Column(Integer, default=7)
    location_name = Column(String(255), nullable=False)
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="items_owned")
    loans = relationship("NeighborLoan", back_populates="item", cascade="all, delete-orphan")


class NeighborLoan(Base):
    __tablename__ = "neighbor_loans"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("neighbor_items.id", ondelete="CASCADE"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # pending, approved, rejected, active, returned_pending, returned_confirmed, disputed
    requested_days = Column(Integer, default=3)
    start_date = Column(DateTime, default=datetime.utcnow)
    expected_return_date = Column(DateTime, nullable=True)
    actual_return_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("NeighborItem", back_populates="loans")
    borrower = relationship("User", foreign_keys=[borrower_id])


class NeighborAssistance(Base):
    __tablename__ = "neighbor_assistances"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    helper_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="general")  # elderly_support, emergency_ride, grocery_run, pet_care, tutor, general
    urgency = Column(String(50), default="normal")  # normal, high, urgent
    status = Column(String(50), default="open")  # open, in_progress, completed, cancelled
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    location_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id], back_populates="assistance_requests")
    helper = relationship("User", foreign_keys=[helper_id])


class KhunjeDaoItem(Base):
    __tablename__ = "khunje_dao_items"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String(20), nullable=False)  # lost, found
    item_type = Column(String(50), nullable=False)  # phone, wallet_bag, nid_passport, keys, electronics, pet, document, other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    primary_image_url = Column(String(500), nullable=True)
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    location_name = Column(String(255), nullable=False)
    event_date = Column(DateTime, default=datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="reported")  # reported, under_review, matched, claimed, verified_handed_over, closed
    brand_or_identifier = Column(String(255), nullable=True)  # Color, model, partial ID
    safe_handover_location = Column(String(255), nullable=True)  # e.g., "Dhanmondi Police Station", "Dhaka University Proctor Office"
    contact_consent = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", back_populates="khunje_items")
    claims = relationship("KhunjeDaoClaim", back_populates="item", cascade="all, delete-orphan")


class KhunjeDaoClaim(Base):
    __tablename__ = "khunje_dao_claims"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("khunje_dao_items.id", ondelete="CASCADE"), nullable=False)
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    proof_description = Column(Text, nullable=False)  # Unique marks, purchase receipt, serial, wallpaper description
    proof_image_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")  # pending, approved, rejected, handed_over
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("KhunjeDaoItem", back_populates="claims")
    claimant = relationship("User", foreign_keys=[claimant_id])


class LineLessProvider(Base):
    __tablename__ = "lineless_providers"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), default="hospital")  # hospital, clinic, bank, utility_center, government_service, customer_care
    address = Column(String(255), nullable=False)
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    latitude = Column(Float, default=23.8103)
    longitude = Column(Float, default=90.4125)
    phone = Column(String(50), nullable=True)
    opening_time = Column(String(50), default="09:00 AM")
    closing_time = Column(String(50), default="05:00 PM")
    is_active = Column(Boolean, default=True)
    avg_service_time_mins = Column(Integer, default=10)
    total_served_today = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    queues = relationship("LineLessQueue", back_populates="provider", cascade="all, delete-orphan")


class LineLessQueue(Base):
    __tablename__ = "lineless_queues"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("lineless_providers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)  # e.g., "Doctor Consultation - OPD 1", "Cash Deposit Counter 2", "New Passport Biometric"
    is_accepting_tokens = Column(Boolean, default=True)
    current_token_number = Column(Integer, default=0)
    next_token_number = Column(Integer, default=1)
    estimated_wait_per_token_mins = Column(Integer, default=8)
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("LineLessProvider", back_populates="queues")
    tokens = relationship("LineLessToken", back_populates="queue", cascade="all, delete-orphan")


class LineLessToken(Base):
    __tablename__ = "lineless_tokens"

    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey("lineless_queues.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_number = Column(Integer, nullable=False)
    token_code = Column(String(50), nullable=False)  # e.g., "DMCH-012"
    status = Column(String(50), default="waiting")  # waiting, called, in_service, completed, no_show, cancelled
    estimated_call_time = Column(DateTime, nullable=True)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    queue = relationship("LineLessQueue", back_populates="tokens")
    user = relationship("User", foreign_keys=[user_id])


class EasyAccessSpot(Base):
    __tablename__ = "easy_access_spots"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="hospital")  # hospital, public_transport, shopping_mall, government_office, park, educational, restaurant
    address = Column(String(255), nullable=False)
    division = Column(String(100), default="Dhaka")
    district = Column(String(100), default="Dhaka")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Accessibility features
    has_wheelchair_ramp = Column(Boolean, default=False)
    has_lift_elevator = Column(Boolean, default=False)
    has_accessible_toilet = Column(Boolean, default=False)
    has_wide_doors = Column(Boolean, default=False)
    has_tactile_paving = Column(Boolean, default=False)
    has_accessible_parking = Column(Boolean, default=False)
    
    overall_rating = Column(Float, default=4.0)
    verified_by_community = Column(Boolean, default=False)
    verification_count = Column(Integer, default=1)
    images_json = Column(Text, nullable=True)  # JSON array of URLs
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("EasyAccessReview", back_populates="spot", cascade="all, delete-orphan")


class EasyAccessReview(Base):
    __tablename__ = "easy_access_reviews"

    id = Column(Integer, primary_key=True, index=True)
    spot_id = Column(Integer, ForeignKey("easy_access_spots.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    ramp_ok = Column(Boolean, default=True)
    elevator_ok = Column(Boolean, default=True)
    toilet_ok = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    spot = relationship("EasyAccessSpot", back_populates="reviews")
    user = relationship("User", foreign_keys=[user_id])


class ProbashiJob(Base):
    __tablename__ = "probashi_jobs"

    id = Column(Integer, primary_key=True, index=True)
    publisher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    destination_country = Column(String(100), nullable=False)
    visa_type = Column(String(100), nullable=False)  # work_permit, technical_intern, skilled_worker, employment_pass
    sector = Column(String(100), nullable=False)  # construction, healthcare, hospitality, it_engineering, manufacturing, driving, agriculture
    required_skills = Column(Text, nullable=False)
    salary_range = Column(String(100), nullable=False)  # e.g., "120,000 - 160,000 BDT / month equivalent"
    recruiter_agency = Column(String(255), nullable=False)
    bmet_approval_no = Column(String(100), nullable=True)
    rl_license_no = Column(String(100), nullable=True)
    is_verified_agency = Column(Boolean, default=True)
    source_type = Column(String(50), default="bmet_approved")  # bmet_approved, registered_recruiting_agency, embassy_bulletin, international_partner
    publication_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    cost_guidelines = Column(Text, nullable=True)  # Official government ceiling migration cost
    warnings_against_brokers = Column(Text, nullable=True)  # Standard warning
    created_at = Column(DateTime, default=datetime.utcnow)


class ProbashiGuide(Base):
    __tablename__ = "probashi_guides"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # visa_rules, airport_arrival, rights_and_laws, emergency_contacts, language_basics, remittances
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    helpline_phone = Column(String(100), nullable=True)
    official_links = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SkillCourse(Base):
    __tablename__ = "skill_courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider_name = Column(String(255), nullable=False)
    category = Column(String(50), default="it_coding")  # language_prep, it_coding, vocational_trades, nursing_caregiving, driving_logistics, freelancing
    level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    duration_weeks = Column(Integer, default=6)
    is_free = Column(Boolean, default=True)
    price_bdt = Column(Float, default=0.0)
    certificate_provided = Column(Boolean, default=True)
    language = Column(String(50), default="Bangla")
    enrollment_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkHubJob(Base):
    __tablename__ = "workhub_jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    job_type = Column(String(50), default="full_time")  # full_time, part_time, freelance, remote, internship
    workplace_type = Column(String(50), default="on_site")  # on_site, remote, hybrid
    location = Column(String(255), default="Dhaka, Bangladesh")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    skills_required = Column(String(500), nullable=False)
    experience_level = Column(String(50), default="entry_level")  # entry_level, mid_level, senior
    application_deadline = Column(DateTime, nullable=True)
    description = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("WorkHubApplication", back_populates="job", cascade="all, delete-orphan")


class WorkHubApplication(Base):
    __tablename__ = "workhub_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("workhub_jobs.id", ondelete="CASCADE"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    status = Column(String(50), default="submitted")  # submitted, reviewing, shortlisted, rejected, hired
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("WorkHubJob", back_populates="applications")
    applicant = relationship("User", foreign_keys=[applicant_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="system")  # traffic, neighbor, khunje, lineless, job, probashi, system
    link_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
