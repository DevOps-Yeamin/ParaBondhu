from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import EasyAccessSpot, EasyAccessReview, User
from backend.app.schemas.schemas import (
    EasyAccessSpotCreate, EasyAccessSpotOut,
    EasyAccessReviewCreate, EasyAccessReviewOut
)
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/easyaccess", tags=["EasyAccess"])

@router.get("/spots", response_model=List[EasyAccessSpotOut])
def get_spots(
    category: Optional[str] = None,
    district: Optional[str] = None,
    has_ramp: Optional[bool] = None,
    has_lift: Optional[bool] = None,
    has_toilet: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(EasyAccessSpot)
    if category:
        query = query.filter(EasyAccessSpot.category == category)
    if district:
        query = query.filter(EasyAccessSpot.district.ilike(f"%{district}%"))
    if has_ramp is True:
        query = query.filter(EasyAccessSpot.has_wheelchair_ramp == True)
    if has_lift is True:
        query = query.filter(EasyAccessSpot.has_lift_elevator == True)
    if has_toilet is True:
        query = query.filter(EasyAccessSpot.has_accessible_toilet == True)
    if search:
        query = query.filter(
            (EasyAccessSpot.title.ilike(f"%{search}%")) |
            (EasyAccessSpot.address.ilike(f"%{search}%"))
        )

    spots = query.order_by(desc(EasyAccessSpot.overall_rating)).limit(limit).all()
    result = []
    for s in spots:
        out = EasyAccessSpotOut.model_validate(s)
        # load review models
        out.reviews = [
            EasyAccessReviewOut(
                id=r.id,
                spot_id=r.spot_id,
                user_id=r.user_id,
                rating=r.rating,
                comment=r.comment,
                ramp_ok=r.ramp_ok,
                elevator_ok=r.elevator_ok,
                toilet_ok=r.toilet_ok,
                created_at=r.created_at,
                reviewer_name=r.user.full_name if r.user else "Verified Citizen"
            )
            for r in s.reviews[-5:] # Latest 5 reviews
        ]
        result.append(out)
    return result

@router.post("/spots", response_model=EasyAccessSpotOut)
def create_spot(
    spot_in: EasyAccessSpotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    spot = EasyAccessSpot(
        author_id=current_user.id,
        title=spot_in.title,
        category=spot_in.category,
        address=spot_in.address,
        division=spot_in.division or current_user.division,
        district=spot_in.district or current_user.district,
        latitude=spot_in.latitude,
        longitude=spot_in.longitude,
        has_wheelchair_ramp=spot_in.has_wheelchair_ramp,
        has_lift_elevator=spot_in.has_lift_elevator,
        has_accessible_toilet=spot_in.has_accessible_toilet,
        has_wide_doors=spot_in.has_wide_doors,
        has_tactile_paving=spot_in.has_tactile_paving,
        has_accessible_parking=spot_in.has_accessible_parking,
        notes=spot_in.notes,
        images_json=spot_in.images_json,
        overall_rating=5.0,
        verified_by_community=False,
        verification_count=1
    )
    db.add(spot)
    db.commit()
    db.refresh(spot)

    out = EasyAccessSpotOut.model_validate(spot)
    out.reviews = []
    return out

@router.post("/spots/{spot_id}/reviews", response_model=EasyAccessReviewOut)
def add_review(
    spot_id: int,
    review_in: EasyAccessReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    spot = db.query(EasyAccessSpot).filter(EasyAccessSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")

    review = EasyAccessReview(
        spot_id=spot.id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
        ramp_ok=review_in.ramp_ok,
        elevator_ok=review_in.elevator_ok,
        toilet_ok=review_in.toilet_ok
    )
    db.add(review)

    # Update spot stats
    spot.verification_count += 1
    if spot.verification_count >= 3:
        spot.verified_by_community = True

    # Recalculate average rating
    all_ratings = [r.rating for r in spot.reviews] + [review_in.rating]
    spot.overall_rating = round(sum(all_ratings) / len(all_ratings), 1)

    db.commit()
    db.refresh(review)

    out = EasyAccessReviewOut.model_validate(review)
    out.reviewer_name = current_user.full_name
    return out
