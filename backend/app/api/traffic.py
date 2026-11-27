from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import TrafficReport, TrafficVerification, User
from backend.app.schemas.schemas import TrafficReportCreate, TrafficReportOut, TrafficVerificationCreate
from backend.app.api.deps import get_current_user, get_optional_current_user
from backend.app.core.websockets import ws_manager

router = APIRouter(prefix="/traffic", tags=["TrafficAlert"])

@router.get("/reports", response_model=List[TrafficReportOut])
def get_reports(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    district: Optional[str] = None,
    is_official: Optional[bool] = None,
    status: Optional[str] = "active",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(TrafficReport)
    if status:
        query = query.filter(TrafficReport.status == status)
    if category:
        query = query.filter(TrafficReport.category == category)
    if severity:
        query = query.filter(TrafficReport.severity == severity)
    if district:
        query = query.filter(TrafficReport.district.ilike(f"%{district}%"))
    if is_official is not None:
        query = query.filter(TrafficReport.is_official == is_official)

    reports = query.order_by(desc(TrafficReport.created_at)).limit(limit).all()
    
    result = []
    for r in reports:
        reporter_name = r.user.full_name if r.user else (r.official_source or "Official Authority")
        item = TrafficReportOut.model_validate(r)
        item.reporter_name = reporter_name
        result.append(item)
    return result

@router.post("/reports", response_model=TrafficReportOut)
async def create_report(
    report_in: TrafficReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = TrafficReport(
        user_id=current_user.id,
        title=report_in.title,
        description=report_in.description,
        category=report_in.category,
        severity=report_in.severity,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        location_name=report_in.location_name,
        division=report_in.division or current_user.division,
        district=report_in.district or current_user.district,
        suggested_alternative_route=report_in.suggested_alternative_route,
        is_official=False,
        upvotes_count=1,
        verified_count=0,
        status="active"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Award reputation point to the citizen for reporting
    current_user.reputation_score += 2
    db.commit()

    # Broadcast real-time alert via WebSockets
    await ws_manager.broadcast({
        "type": "TRAFFIC_ALERT",
        "data": {
            "id": report.id,
            "title": report.title,
            "category": report.category,
            "severity": report.severity,
            "location_name": report.location_name,
            "is_official": False,
            "reporter_name": current_user.full_name
        }
    })

    out = TrafficReportOut.model_validate(report)
    out.reporter_name = current_user.full_name
    return out

@router.post("/reports/{report_id}/verify")
def verify_report(
    report_id: int,
    action_in: TrafficVerificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(TrafficReport).filter(TrafficReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Traffic report not found")

    existing = db.query(TrafficVerification).filter(
        TrafficVerification.report_id == report_id,
        TrafficVerification.user_id == current_user.id
    ).first()

    if existing:
        existing.vote_type = action_in.vote_type
        existing.comment = action_in.comment
    else:
        new_verify = TrafficVerification(
            report_id=report_id,
            user_id=current_user.id,
            vote_type=action_in.vote_type,
            comment=action_in.comment
        )
        db.add(new_verify)

    # Recalculate totals
    if action_in.vote_type == "upvote":
        report.upvotes_count += 1
    elif action_in.vote_type == "downvote":
        report.downvotes_count += 1
    elif action_in.vote_type == "verify":
        report.verified_count += 1
        if report.verified_count >= 3:
            report.status = "active"
    elif action_in.vote_type == "flag":
        if report.downvotes_count >= 5:
            report.status = "debunked"

    db.commit()
    return {
        "message": f"Recorded {action_in.vote_type}",
        "upvotes": report.upvotes_count,
        "verified_count": report.verified_count,
        "status": report.status
    }
