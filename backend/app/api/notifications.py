from typing import List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.models import Notification, User
from backend.app.schemas.schemas import NotificationOut
from backend.app.api.deps import get_current_user
from backend.app.core.websockets import ws_manager

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(50).all()
    return notifs

@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: int = None):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, listen for ping/pong or client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
