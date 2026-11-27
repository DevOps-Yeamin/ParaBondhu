from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import LineLessProvider, LineLessQueue, LineLessToken, User, Notification
from backend.app.schemas.schemas import (
    LineLessProviderCreate, LineLessProviderOut,
    LineLessQueueCreate, LineLessQueueOut,
    LineLessTokenCreate, LineLessTokenOut
)
from backend.app.api.deps import get_current_user, get_optional_current_user
from backend.app.core.websockets import ws_manager

router = APIRouter(prefix="/lineless", tags=["LineLess"])

@router.get("/providers", response_model=List[LineLessProviderOut])
def get_providers(
    category: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LineLessProvider).filter(LineLessProvider.is_active == True)
    if category:
        query = query.filter(LineLessProvider.category == category)
    if district:
        query = query.filter(LineLessProvider.district.ilike(f"%{district}%"))
    
    return query.all()

@router.post("/providers", response_model=LineLessProviderOut)
def create_provider(
    provider_in: LineLessProviderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = LineLessProvider(
        owner_id=current_user.id,
        name=provider_in.name,
        category=provider_in.category,
        address=provider_in.address,
        division=provider_in.division or current_user.division,
        district=provider_in.district or current_user.district,
        latitude=provider_in.latitude or 23.8103,
        longitude=provider_in.longitude or 90.4125,
        phone=provider_in.phone,
        opening_time=provider_in.opening_time or "09:00 AM",
        closing_time=provider_in.closing_time or "05:00 PM",
        avg_service_time_mins=provider_in.avg_service_time_mins or 10,
        is_active=True
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)

    # Automatically create a default queue
    default_queue = LineLessQueue(
        provider_id=provider.id,
        name="General Counter / Desk 1",
        is_accepting_tokens=True,
        current_token_number=0,
        next_token_number=1,
        estimated_wait_per_token_mins=provider.avg_service_time_mins
    )
    db.add(default_queue)
    db.commit()
    db.refresh(provider)
    return provider

@router.post("/queues", response_model=LineLessQueueOut)
def create_queue(
    queue_in: LineLessQueueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = db.query(LineLessProvider).filter(LineLessProvider.id == queue_in.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    queue = LineLessQueue(
        provider_id=provider.id,
        name=queue_in.name,
        is_accepting_tokens=True,
        current_token_number=0,
        next_token_number=1,
        estimated_wait_per_token_mins=queue_in.estimated_wait_per_token_mins or provider.avg_service_time_mins
    )
    db.add(queue)
    db.commit()
    db.refresh(queue)
    return queue

@router.post("/tokens", response_model=LineLessTokenOut)
async def take_token(
    token_in: LineLessTokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue = db.query(LineLessQueue).filter(LineLessQueue.id == token_in.queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    if not queue.is_accepting_tokens:
        raise HTTPException(status_code=400, detail="This queue is currently not accepting new tokens")

    # Check if user already has an active waiting token in this queue
    existing = db.query(LineLessToken).filter(
        LineLessToken.queue_id == queue.id,
        LineLessToken.user_id == current_user.id,
        LineLessToken.status.in_(["waiting", "called", "in_service"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active token in this queue")

    token_num = queue.next_token_number
    queue.next_token_number += 1

    prefix = "".join([c[0].upper() for c in queue.provider.name.split()[:3]]) or "TK"
    token_code = f"{prefix}-{token_num:03d}"

    waiting_before = max(0, token_num - queue.current_token_number - 1)
    estimated_mins = waiting_before * queue.estimated_wait_per_token_mins
    estimated_call_time = datetime.utcnow() + timedelta(minutes=estimated_mins)

    token = LineLessToken(
        queue_id=queue.id,
        user_id=current_user.id,
        token_number=token_num,
        token_code=token_code,
        status="waiting",
        estimated_call_time=estimated_call_time,
        notes=token_in.notes
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    # Notify via WebSocket
    await ws_manager.broadcast({
        "type": "QUEUE_UPDATE",
        "data": {
            "queue_id": queue.id,
            "next_token_number": queue.next_token_number,
            "current_token_number": queue.current_token_number
        }
    })

    out = LineLessTokenOut.model_validate(token)
    out.queue_name = queue.name
    out.provider_name = queue.provider.name
    out.current_queue_token = queue.current_token_number
    return out

@router.get("/my-tokens", response_model=List[LineLessTokenOut])
def get_my_tokens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tokens = db.query(LineLessToken).filter(
        LineLessToken.user_id == current_user.id
    ).order_by(desc(LineLessToken.created_at)).all()

    result = []
    for t in tokens:
        out = LineLessTokenOut.model_validate(t)
        out.queue_name = t.queue.name if t.queue else "Queue"
        out.provider_name = t.queue.provider.name if t.queue and t.queue.provider else "Service Provider"
        out.current_queue_token = t.queue.current_token_number if t.queue else 0
        result.append(out)
    return result

@router.put("/queues/{queue_id}/call-next")
async def call_next_token(
    queue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue = db.query(LineLessQueue).filter(LineLessQueue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    # Find the next waiting token
    next_token = db.query(LineLessToken).filter(
        LineLessToken.queue_id == queue_id,
        LineLessToken.status == "waiting"
    ).order_by(LineLessToken.token_number.asc()).first()

    if not next_token:
        return {"message": "No more waiting tokens in this queue.", "current_token": queue.current_token_number}

    # Complete or transition previous token
    prev_active = db.query(LineLessToken).filter(
        LineLessToken.queue_id == queue_id,
        LineLessToken.status == "called"
    ).all()
    for p in prev_active:
        p.status = "completed"
        p.completed_at = datetime.utcnow()

    next_token.status = "called"
    next_token.called_at = datetime.utcnow()
    queue.current_token_number = next_token.token_number
    queue.provider.total_served_today += 1

    # Notify the user directly
    notif = Notification(
        user_id=next_token.user_id,
        title="Your Token is Called!",
        message=f"Token {next_token.token_code} is now being called at {queue.name} ({queue.provider.name})!",
        category="lineless",
        link_url="/lineless"
    )
    db.add(notif)
    db.commit()

    # Broadcast
    await ws_manager.broadcast({
        "type": "TOKEN_CALLED",
        "data": {
            "queue_id": queue.id,
            "provider_name": queue.provider.name,
            "token_code": next_token.token_code,
            "token_number": next_token.token_number
        }
    })

    return {
        "message": f"Called token {next_token.token_code}",
        "token_number": next_token.token_number,
        "token_code": next_token.token_code
    }
