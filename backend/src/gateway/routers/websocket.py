"""WebSocket endpoint for real-time push notifications.

Clients connect at  ws://<host>/ws/notifications?token=<jwt>
where the JWT is the same Bearer token issued by the Express gateway.
"""

import logging
import os

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter()


class _ConnectionManager:
    """In-memory registry of active WebSocket connections keyed by user_id."""

    def __init__(self) -> None:
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[user_id] = ws
        logger.info("WS connected: user=%s (total=%d)", user_id, len(self._connections))

    def disconnect(self, user_id: str) -> None:
        self._connections.pop(user_id, None)
        logger.info("WS disconnected: user=%s (total=%d)", user_id, len(self._connections))

    async def send_to_user(self, user_id: str, payload: dict) -> bool:
        """Send JSON payload to a connected user. Returns True if sent."""
        ws = self._connections.get(user_id)
        if ws is None:
            return False
        try:
            await ws.send_json(payload)
            return True
        except Exception:
            self.disconnect(user_id)
            return False

    @property
    def connected_user_ids(self) -> list[str]:
        return list(self._connections.keys())


# Singleton used by the scheduler poller
connection_manager = _ConnectionManager()


@router.post("/api/debug/poll-now")
async def trigger_poll_now() -> JSONResponse:
    """Manually trigger one calendar poll pass (dev/debug only)."""
    from src.scheduler.poller import poll_once
    await poll_once()
    return JSONResponse({"status": "poll complete"})


@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket, token: str = "") -> None:
    """WebSocket endpoint.  Query param: ?token=<jwt>"""
    secret = os.getenv("JWT_SECRET")
    if not secret:
        await websocket.close(code=1011)
        return

    try:
        payload  = jwt.decode(token, secret, algorithms=["HS256"])
        user_id  = payload.get("userId") or payload.get("sub")
        if not user_id:
            raise ValueError("userId missing from token")
    except Exception as exc:
        logger.warning("WS auth failed: %s", exc)
        await websocket.close(code=4001)
        return

    await connection_manager.connect(str(user_id), websocket)
    try:
        while True:
            # Keep-alive: accept any incoming pings from client but ignore them
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(str(user_id))
