from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import NeighborItem, NeighborLoan, NeighborAssistance, User, Notification
from backend.app.schemas.schemas import (
    NeighborItemCreate, NeighborItemOut,
    NeighborLoanCreate, NeighborLoanOut,
    NeighborAssistanceCreate, NeighborAssistanceOut
)
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/neighbor", tags=["NeighborShare"])

# ----------------- Items -----------------
@router.get("/items", response_model=List[NeighborItemOut])
def get_items(
    category: Optional[str] = None,
    status: Optional[str] = None,
    district: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(NeighborItem)
    if category:
        query = query.filter(NeighborItem.category == category)
    if status:
        query = query.filter(NeighborItem.status == status)
    if district:
        query = query.filter(NeighborItem.district.ilike(f"%{district}%"))
    if search:
        query = query.filter(
            (NeighborItem.title.ilike(f"%{search}%")) | (NeighborItem.description.ilike(f"%{search}%"))
        )

    items = query.order_by(desc(NeighborItem.created_at)).limit(limit).all()
    result = []
    for item in items:
        out = NeighborItemOut.model_validate(item)
        out.owner_name = item.owner.full_name if item.owner else "Neighbor"
        out.owner_reputation = item.owner.reputation_score if item.owner else 10
        result.append(out)
    return result

@router.post("/items", response_model=NeighborItemOut)
def create_item(
    item_in: NeighborItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = NeighborItem(
        owner_id=current_user.id,
        title=item_in.title,
        description=item_in.description,
        category=item_in.category,
        condition=item_in.condition,
        deposit_amount=item_in.deposit_amount or 0.0,
        rental_rate_type=item_in.rental_rate_type or "free",
        max_days=item_in.max_days or 7,
        location_name=item_in.location_name,
        division=item_in.division or current_user.division,
        district=item_in.district or current_user.district,
        latitude=item_in.latitude,
        longitude=item_in.longitude,
        image_url=item_in.image_url,
        status="available"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    out = NeighborItemOut.model_validate(item)
    out.owner_name = current_user.full_name
    out.owner_reputation = current_user.reputation_score
    return out

# ----------------- Loans & Borrowing -----------------
@router.post("/loans", response_model=NeighborLoanOut)
def request_loan(
    loan_in: NeighborLoanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(NeighborItem).filter(NeighborItem.id == loan_in.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot borrow your own item")
    if item.status != "available":
        raise HTTPException(status_code=400, detail="Item is currently not available for borrowing")

    now = datetime.utcnow()
    expected_return = now + timedelta(days=loan_in.requested_days)

    loan = NeighborLoan(
        item_id=item.id,
        borrower_id=current_user.id,
        status="pending",
        requested_days=loan_in.requested_days,
        start_date=now,
        expected_return_date=expected_return,
        notes=loan_in.notes
    )
    item.status = "requested"
    db.add(loan)

    # Notify owner
    notif = Notification(
        user_id=item.owner_id,
        title="New Item Borrow Request!",
        message=f"{current_user.full_name} has requested to borrow '{item.title}' for {loan_in.requested_days} days.",
        category="neighbor",
        link_url="/neighbor"
    )
    db.add(notif)
    db.commit()
    db.refresh(loan)

    out = NeighborLoanOut.model_validate(loan)
    out.item_title = item.title
    out.borrower_name = current_user.full_name
    return out

@router.put("/loans/{loan_id}/status")
def update_loan_status(
    loan_id: int,
    action: str = Query(..., description="approve, reject, return, complete"),
    rating: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(NeighborLoan).filter(NeighborLoan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    item = loan.item
    if action == "approve":
        if item.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the owner can approve")
        loan.status = "active"
        item.status = "lent"
    elif action == "reject":
        if item.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the owner can reject")
        loan.status = "rejected"
        item.status = "available"
    elif action == "return":
        loan.status = "returned_pending"
        loan.actual_return_date = datetime.utcnow()
    elif action == "complete":
        if item.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only owner can confirm return")
        loan.status = "returned_confirmed"
        item.status = "available"
        if rating:
            loan.rating = rating
            loan.borrower.reputation_score += rating

    db.commit()
    return {"message": f"Loan updated to {loan.status}", "item_status": item.status}

# ----------------- Assistance / Mutual Aid -----------------
@router.get("/assistance", response_model=List[NeighborAssistanceOut])
def get_assistance_requests(
    district: Optional[str] = None,
    status: Optional[str] = "open",
    db: Session = Depends(get_db)
):
    query = db.query(NeighborAssistance)
    if status:
        query = query.filter(NeighborAssistance.status == status)
    if district:
        query = query.filter(NeighborAssistance.district.ilike(f"%{district}%"))
    
    requests = query.order_by(desc(NeighborAssistance.created_at)).all()
    result = []
    for r in requests:
        out = NeighborAssistanceOut.model_validate(r)
        out.author_name = r.author.full_name if r.author else "Citizen"
        out.helper_name = r.helper.full_name if r.helper else None
        result.append(out)
    return result

@router.post("/assistance", response_model=NeighborAssistanceOut)
def create_assistance_request(
    req_in: NeighborAssistanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = NeighborAssistance(
        author_id=current_user.id,
        title=req_in.title,
        description=req_in.description,
        category=req_in.category,
        urgency=req_in.urgency,
        division=req_in.division or current_user.division,
        district=req_in.district or current_user.district,
        location_name=req_in.location_name,
        status="open"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    out = NeighborAssistanceOut.model_validate(req)
    out.author_name = current_user.full_name
    return out

@router.post("/assistance/{req_id}/volunteer")
def volunteer_for_assistance(
    req_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(NeighborAssistance).filter(NeighborAssistance.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Assistance request not found")
    if req.author_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot volunteer for your own request")
    
    req.helper_id = current_user.id
    req.status = "in_progress"
    
    notif = Notification(
        user_id=req.author_id,
        title="Neighbor Assistance Offer!",
        message=f"{current_user.full_name} stepped up to help with '{req.title}'!",
        category="neighbor",
        link_url="/neighbor"
    )
    db.add(notif)
    db.commit()
    return {"message": "You have volunteered to help! Contact the neighbor to coordinate."}
