from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import KhunjeDaoItem, KhunjeDaoClaim, User, Notification
from backend.app.schemas.schemas import (
    KhunjeDaoItemCreate, KhunjeDaoItemOut,
    KhunjeDaoClaimCreate, KhunjeDaoClaimOut
)
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/khunje", tags=["KhunjeDao"])

@router.get("/items", response_model=List[KhunjeDaoItemOut])
def get_items(
    report_type: Optional[str] = None, # lost, found
    item_type: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(KhunjeDaoItem)
    if report_type:
        query = query.filter(KhunjeDaoItem.report_type == report_type)
    if item_type:
        query = query.filter(KhunjeDaoItem.item_type == item_type)
    if district:
        query = query.filter(KhunjeDaoItem.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(KhunjeDaoItem.status == status)
    if search:
        query = query.filter(
            (KhunjeDaoItem.title.ilike(f"%{search}%")) |
            (KhunjeDaoItem.description.ilike(f"%{search}%")) |
            (KhunjeDaoItem.location_name.ilike(f"%{search}%"))
        )

    items = query.order_by(desc(KhunjeDaoItem.created_at)).limit(limit).all()
    result = []
    for item in items:
        out = KhunjeDaoItemOut.model_validate(item)
        out.reporter_name = item.reporter.full_name if item.reporter else "Citizen"
        result.append(out)
    return result

@router.get("/items/{item_id}", response_model=KhunjeDaoItemOut)
def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.query(KhunjeDaoItem).filter(KhunjeDaoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    out = KhunjeDaoItemOut.model_validate(item)
    out.reporter_name = item.reporter.full_name if item.reporter else "Citizen"
    return out

@router.post("/items", response_model=KhunjeDaoItemOut)
def create_item_report(
    item_in: KhunjeDaoItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = KhunjeDaoItem(
        reporter_id=current_user.id,
        report_type=item_in.report_type,
        item_type=item_in.item_type,
        title=item_in.title,
        description=item_in.description,
        primary_image_url=item_in.primary_image_url,
        division=item_in.division or current_user.division,
        district=item_in.district or current_user.district,
        location_name=item_in.location_name,
        event_date=item_in.event_date or datetime.utcnow(),
        latitude=item_in.latitude,
        longitude=item_in.longitude,
        brand_or_identifier=item_in.brand_or_identifier,
        safe_handover_location=item_in.safe_handover_location or "Nearest Police Thana or University Proctor Office",
        contact_consent=item_in.contact_consent if item_in.contact_consent is not None else True,
        status="reported"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    out = KhunjeDaoItemOut.model_validate(item)
    out.reporter_name = current_user.full_name
    return out

@router.get("/match-suggestions/{item_id}")
def get_match_suggestions(item_id: int, db: Session = Depends(get_db)):
    """
    Intelligent heuristic matching algorithm:
    If item is 'lost', search for opposite 'found' items in the same item_type & district,
    scoring by keyword overlap, date proximity, and location proximity.
    """
    target = db.query(KhunjeDaoItem).filter(KhunjeDaoItem.id == item_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target item not found")

    opposite_type = "found" if target.report_type == "lost" else "lost"
    candidates = db.query(KhunjeDaoItem).filter(
        KhunjeDaoItem.report_type == opposite_type,
        KhunjeDaoItem.item_type == target.item_type,
        KhunjeDaoItem.status.in_(["reported", "under_review", "matched"])
    ).all()

    target_words = set((target.title + " " + target.description + " " + (target.brand_or_identifier or "")).lower().split())

    matches = []
    for cand in candidates:
        score = 20 # Base match on matching item type
        
        # Check district match
        if cand.district and target.district and cand.district.lower() == target.district.lower():
            score += 30
        
        # Check keyword overlap
        cand_words = set((cand.title + " " + cand.description + " " + (cand.brand_or_identifier or "")).lower().split())
        overlap = target_words.intersection(cand_words)
        # ignore trivial words
        meaningful_overlap = [w for w in overlap if len(w) > 3]
        score += min(len(meaningful_overlap) * 15, 40)

        # Check date proximity
        if cand.event_date and target.event_date:
            days_diff = abs((cand.event_date - target.event_date).days)
            if days_diff <= 2:
                score += 15
            elif days_diff <= 7:
                score += 8

        matches.append({
            "matched_item": KhunjeDaoItemOut.model_validate(cand),
            "confidence_score": min(score, 98),
            "matching_keywords": meaningful_overlap[:5]
        })

    # Sort descending by confidence score
    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches[:5]

@router.post("/claims", response_model=KhunjeDaoClaimOut)
def submit_claim(
    claim_in: KhunjeDaoClaimCreate,
    item_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(KhunjeDaoItem).filter(KhunjeDaoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.reporter_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot claim your own reported item")

    claim = KhunjeDaoClaim(
        item_id=item.id,
        claimant_id=current_user.id,
        proof_description=claim_in.proof_description,
        proof_image_url=claim_in.proof_image_url,
        status="pending"
    )
    db.add(claim)

    # Notify reporter
    notif = Notification(
        user_id=item.reporter_id,
        title="New Ownership Claim Received!",
        message=f"{current_user.full_name} submitted proof of ownership for '{item.title}'. Please verify safely.",
        category="khunje",
        link_url=f"/khunje"
    )
    db.add(notif)
    db.commit()
    db.refresh(claim)

    out = KhunjeDaoClaimOut.model_validate(claim)
    out.claimant_name = current_user.full_name
    return out

@router.get("/claims/{item_id}", response_model=List[KhunjeDaoClaimOut])
def get_claims_for_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(KhunjeDaoItem).filter(KhunjeDaoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.reporter_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Only reporter or moderator can view claims")

    claims = db.query(KhunjeDaoClaim).filter(KhunjeDaoClaim.item_id == item_id).all()
    result = []
    for c in claims:
        out = KhunjeDaoClaimOut.model_validate(c)
        out.claimant_name = c.claimant.full_name if c.claimant else "Claimant"
        result.append(out)
    return result

@router.put("/claims/{claim_id}/verify")
def verify_claim(
    claim_id: int,
    action: str = Query(..., description="approve, reject, hand_over"),
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(KhunjeDaoClaim).filter(KhunjeDaoClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    item = claim.item
    if item.reporter_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    if action == "approve":
        claim.status = "approved"
        item.status = "claimed"
        claim.verification_notes = notes or "Ownership proof verified by reporter."
    elif action == "reject":
        claim.status = "rejected"
        claim.verification_notes = notes or "Proof was insufficient."
    elif action == "hand_over":
        claim.status = "handed_over"
        item.status = "verified_handed_over"
        # Award reputation to honest finder
        item.reporter.reputation_score += 15
        claim.claimant.reputation_score += 5

    db.commit()
    return {"message": f"Claim status updated to {claim.status}", "item_status": item.status}
