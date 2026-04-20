"""Calendar write endpoint — add a planned trip to Google Calendar."""

import logging
import os

import jwt
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

from src.calendar.client import create_trip_events

logger = logging.getLogger(__name__)
router = APIRouter()

_mongo_client: AsyncIOMotorClient | None = None


def _get_db():
    global _mongo_client
    if _mongo_client is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/nomie")
        _mongo_client = AsyncIOMotorClient(uri)
    return _mongo_client["nomie"]


class AddTripRequest(BaseModel):
    token:       str
    itinerary:   list[dict]
    start_date:  str         # "YYYY-MM-DD"
    destination: str = "Trip"


@router.post("/api/calendar/add-trip")
async def add_trip_to_calendar(body: AddTripRequest):
    # Verify JWT
    secret = os.getenv("JWT_SECRET")
    try:
        payload = jwt.decode(body.token, secret, algorithms=["HS256"])
        user_id = payload.get("userId") or payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch user's calendar tokens from MongoDB
    db = _get_db()
    user = await db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"googleCalendar": 1},
    )

    if not user or not user.get("googleCalendar", {}).get("refreshToken"):
        raise HTTPException(status_code=400, detail="Google Calendar not connected")

    try:
        links = await create_trip_events(
            calendar_doc=user["googleCalendar"],
            itinerary=body.itinerary,
            start_date=body.start_date,
            destination=body.destination,
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.exception("Failed to create calendar events")
        raise HTTPException(status_code=500, detail=str(e))

    return {"created": len(links), "links": links}
