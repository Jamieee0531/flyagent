"""Proactive travel notification poller.

Runs every 12 hours. For each user with Google Calendar connected:

  Three-condition trigger (ALL must be satisfied):
    1. Calendar  — ≥3 consecutive free days in the next 60 days
    2. Price     — current flight price ≤ 30-day historical low (±5%)
    3. Season    — destination is in shoulder or off-peak season

  When all three fire: generate personalized copy via Claude Haiku → push via WebSocket.

  Price history is always recorded regardless of whether the other conditions are met,
  so the 30-day baseline builds up over time.
"""

import asyncio
import logging
import os
from datetime import date

from motor.motor_asyncio import AsyncIOMotorClient

from src.calendar.client import find_consecutive_free_days
from src.gateway.routers.websocket import connection_manager
from src.scheduler.flight_tracker import (
    city_to_iata,
    fetch_current_price,
    get_30day_low,
    is_at_historical_low,
    record_price,
)
from src.scheduler.notification_writer import generate_notification_copy
from src.scheduler.season_data import get_season_score, is_season_match

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 12 * 3600
_mongo_client: AsyncIOMotorClient | None = None


def _get_db():
    global _mongo_client
    if _mongo_client is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/nomie")
        _mongo_client = AsyncIOMotorClient(uri)
    return _mongo_client["nomie"]


def _extract_destinations(travel_plans: list[dict]) -> list[str]:
    """Pull destination city names out of saved travel plans."""
    destinations: list[str] = []
    for plan in travel_plans:
        # Try selectedFlight.destination first
        flight = plan.get("selectedFlight") or {}
        dest = flight.get("destination") or flight.get("arrival_id") or ""
        if dest and len(dest) >= 2:
            destinations.append(dest)
            continue
        # Try itinerary theme
        itinerary = plan.get("itinerary") or []
        if isinstance(itinerary, list) and itinerary:
            theme = (itinerary[0] or {}).get("theme", "")
            if theme:
                destinations.append(theme)
    # Deduplicate preserving order
    seen: set[str] = set()
    unique = []
    for d in destinations:
        if d.lower() not in seen:
            seen.add(d.lower())
            unique.append(d)
    return unique[:5]  # max 5 destinations per user


async def _check_user(db, user: dict) -> None:
    user_id      = str(user["_id"])
    cal_doc      = user.get("googleCalendar", {})
    profile      = user.get("profile", {})
    mbti_type    = profile.get("mbtiType", "")
    mbti_title   = profile.get("mbtiTitle", "Traveler")
    departure_city = (profile.get("quickPick") or {}).get("departure", "")
    currency     = (profile.get("preferences") or {}).get("currency", "USD")

    # ── Condition 1: Calendar free block ─────────────────────────────────────
    try:
        free_blocks = await find_consecutive_free_days(cal_doc, min_days=3)
    except Exception:
        logger.exception("[Poller] Calendar check failed for user=%s", user_id)
        return

    if not free_blocks:
        logger.debug("[Poller] No 3-day free block for user=%s", user_id)
        return

    best_block = free_blocks[0]  # earliest block
    trip_start = date.fromisoformat(best_block[0])
    trip_end   = date.fromisoformat(best_block[-1])
    logger.info("[Poller] user=%s has free block %s→%s (%d days)",
                user_id, trip_start, trip_end, len(best_block))

    # ── Fetch saved destinations ──────────────────────────────────────────────
    plans = await db.travelplans.find(
        {"userId": user["_id"]},
        {"selectedFlight": 1, "itinerary": 1},
    ).to_list(length=20)

    destinations = _extract_destinations(plans)
    if not destinations:
        logger.debug("[Poller] No saved destinations for user=%s", user_id)
        return

    origin_iata = city_to_iata(departure_city)
    if not origin_iata:
        logger.warning("[Poller] Cannot resolve IATA for departure '%s' user=%s",
                       departure_city, user_id)
        return

    # ── Check each destination ────────────────────────────────────────────────
    for destination in destinations:
        dest_iata = city_to_iata(destination)
        if not dest_iata:
            logger.debug("[Poller] Cannot resolve IATA for '%s'", destination)
            continue

        # ── Condition 2: Price at historical low ─────────────────────────────
        current_price = await fetch_current_price(
            origin=origin_iata,
            destination=dest_iata,
            outbound_date=trip_start.isoformat(),
            return_date=trip_end.isoformat(),
            currency=currency,
        )

        if current_price is None:
            logger.debug("[Poller] No price data for %s→%s", origin_iata, dest_iata)
            continue

        # Always record for history building
        await record_price(db, user_id, origin_iata, dest_iata, current_price, currency)

        low_30d = await get_30day_low(db, user_id, origin_iata, dest_iata)
        if low_30d is None:
            # First data point — baseline established, skip trigger this cycle
            logger.info("[Poller] Price baseline set for %s→%s: %s %s",
                        origin_iata, dest_iata, currency, current_price)
            continue

        price_triggered = is_at_historical_low(current_price, low_30d)
        if not price_triggered:
            logger.debug("[Poller] Price not at low for %s→%s (cur=%.0f low=%.0f)",
                         origin_iata, dest_iata, current_price, low_30d)
            continue

        # ── Condition 3: Season match ─────────────────────────────────────────
        season_ok    = is_season_match(destination, trip_start)
        season_score = get_season_score(destination, trip_start)
        season_label = {0: "peak season", 1: "shoulder season", 2: "off-peak season"}.get(season_score, "shoulder season")

        if not season_ok:
            logger.debug("[Poller] Peak season — skipping push for %s user=%s", destination, user_id)
            continue

        # ── All three conditions met → generate copy + push ───────────────────
        logger.info("[Poller] 🎯 All conditions met: user=%s dest=%s price=%.0f low=%.0f season=%s",
                    user_id, destination, current_price, low_30d, season_label)

        copy = await generate_notification_copy(
            mbti_type=mbti_type,
            mbti_title=mbti_title,
            destination=destination,
            current_price=current_price,
            low_30d=low_30d,
            free_dates=best_block,
            currency=currency,
            season_label=season_label,
        )

        sent = await connection_manager.send_to_user(user_id, {
            "type":        "proactive_trip",
            "destination": destination,
            "message":     copy,
            "price":       current_price,
            "low_30d":     low_30d,
            "currency":    currency,
            "free_dates":  best_block,
            "season":      season_label,
        })

        logger.info("[Poller] Notification sent=%s user=%s dest=%s", sent, user_id, destination)


async def poll_once() -> None:
    """Single poll pass across all users with Google Calendar connected."""
    logger.info("[Poller] Starting poll pass")
    db = _get_db()

    try:
        users = await db.users.find(
            {"googleCalendar.refreshToken": {"$exists": True, "$ne": None}},
            {"_id": 1, "googleCalendar": 1, "profile": 1},
        ).to_list(length=500)
    except Exception:
        logger.exception("[Poller] Failed to fetch users from MongoDB")
        return

    logger.info("[Poller] Found %d users with Google Calendar", len(users))

    for user in users:
        try:
            await _check_user(db, user)
        except Exception:
            logger.exception("[Poller] Unexpected error for user=%s", str(user["_id"]))


async def polling_loop() -> None:
    """Long-running background coroutine. Kicked off in FastAPI lifespan."""
    await asyncio.sleep(30)  # brief startup delay
    while True:
        try:
            await poll_once()
        except Exception:
            logger.exception("[Poller] Unexpected error in poll_once")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
