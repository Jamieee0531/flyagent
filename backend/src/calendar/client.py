"""Google Calendar freebusy client.

Uses httpx (already a project dependency) to call the Calendar v3 API directly,
so we don't need the full google-api-python-client package.
"""

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

logger = logging.getLogger(__name__)

FREEBUSY_URL  = "https://www.googleapis.com/calendar/v3/freeBusy"
EVENTS_URL    = "https://www.googleapis.com/calendar/v3/calendars/{cal_id}/events"
TOKEN_URL     = "https://oauth2.googleapis.com/token"
MIN_FREE_HOURS = 2  # only surface gaps longer than this


async def find_consecutive_free_days(
    calendar_doc: dict,
    min_days: int = 3,
    look_ahead_days: int = 60,
) -> list[list[str]]:
    """Return blocks of consecutive free days (no events) in the next look_ahead_days.

    Returns list of date-string lists, e.g. [["2026-05-10","2026-05-11","2026-05-12"], ...]
    Only blocks with ≥ min_days are returned.
    """
    access_token = await _ensure_valid_token(calendar_doc)
    if not access_token:
        return []

    now      = datetime.now(tz=timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = now + timedelta(days=look_ahead_days)

    payload = {
        "timeMin": now.isoformat(),
        "timeMax": end_date.isoformat(),
        "items":   [{"id": calendar_doc.get("calendarId", "primary")}],
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            FREEBUSY_URL,
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )

    if resp.status_code != 200:
        logger.warning("Freebusy API returned %s", resp.status_code)
        return []

    busy_periods = (
        resp.json().get("calendars", {})
            .get(calendar_doc.get("calendarId", "primary"), {})
            .get("busy", [])
    )

    # Build set of dates that have at least one event
    busy_dates: set[str] = set()
    for period in busy_periods:
        p_start = datetime.fromisoformat(period["start"].replace("Z", "+00:00"))
        p_end   = datetime.fromisoformat(period["end"].replace("Z", "+00:00"))
        cursor  = p_start.replace(hour=0, minute=0, second=0, microsecond=0)
        while cursor <= p_end:
            busy_dates.add(cursor.strftime("%Y-%m-%d"))
            cursor += timedelta(days=1)

    # Find consecutive free day blocks
    blocks: list[list[str]] = []
    current_block: list[str] = []

    for i in range(look_ahead_days):
        date = (now + timedelta(days=i)).strftime("%Y-%m-%d")
        if date not in busy_dates:
            current_block.append(date)
        else:
            if len(current_block) >= min_days:
                blocks.append(current_block)
            current_block = []

    if len(current_block) >= min_days:
        blocks.append(current_block)

    return blocks


async def get_free_slots(calendar_doc: dict) -> list[dict]:
    """Return free time slots for a user over the next 7 days.

    Args:
        calendar_doc: the user's googleCalendar sub-document from MongoDB.

    Returns:
        List of dicts with keys start, end, duration_hours.
    """
    access_token = await _ensure_valid_token(calendar_doc)
    if not access_token:
        return []

    now      = datetime.now(tz=timezone.utc)
    week_end = now + timedelta(days=7)

    payload = {
        "timeMin": now.isoformat(),
        "timeMax": week_end.isoformat(),
        "items":   [{"id": calendar_doc.get("calendarId", "primary")}],
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            FREEBUSY_URL,
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )

    if resp.status_code != 200:
        logger.warning("Freebusy API returned %s: %s", resp.status_code, resp.text)
        return []

    busy_periods: list[dict] = (
        resp.json().get("calendars", {})
            .get(calendar_doc.get("calendarId", "primary"), {})
            .get("busy", [])
    )

    return _find_free_slots(busy_periods, now, week_end)


def _find_free_slots(
    busy: list[dict],
    window_start: datetime,
    window_end: datetime,
) -> list[dict]:
    """Invert busy periods within window and filter by minimum duration."""
    # Sort busy periods, then walk gaps
    sorted_busy = sorted(busy, key=lambda b: b["start"])

    free_slots = []
    cursor = window_start

    for period in sorted_busy:
        period_start = datetime.fromisoformat(period["start"].replace("Z", "+00:00"))
        period_end   = datetime.fromisoformat(period["end"].replace("Z", "+00:00"))

        if period_start > cursor:
            gap_hours = (period_start - cursor).total_seconds() / 3600
            if gap_hours >= MIN_FREE_HOURS:
                free_slots.append({
                    "start":          cursor.isoformat(),
                    "end":            period_start.isoformat(),
                    "duration_hours": round(gap_hours, 1),
                })
        cursor = max(cursor, period_end)

    # Trailing gap after last busy event
    if cursor < window_end:
        gap_hours = (window_end - cursor).total_seconds() / 3600
        if gap_hours >= MIN_FREE_HOURS:
            free_slots.append({
                "start":          cursor.isoformat(),
                "end":            window_end.isoformat(),
                "duration_hours": round(gap_hours, 1),
            })

    return free_slots[:5]  # cap to 5 slots per notification


async def _ensure_valid_token(calendar_doc: dict) -> str | None:
    """Return a valid access token, refreshing if expired."""
    expiry_raw = calendar_doc.get("tokenExpiry")
    access_token = calendar_doc.get("accessToken")
    refresh_token = calendar_doc.get("refreshToken")

    if not refresh_token:
        return None

    expiry = None
    if expiry_raw:
        if isinstance(expiry_raw, datetime):
            expiry = expiry_raw.replace(tzinfo=timezone.utc) if expiry_raw.tzinfo is None else expiry_raw
        else:
            try:
                expiry = datetime.fromisoformat(str(expiry_raw))
            except ValueError:
                expiry = None

    # Refresh 60 seconds before expiry
    needs_refresh = (
        not access_token
        or expiry is None
        or expiry <= datetime.now(tz=timezone.utc) + timedelta(seconds=60)
    )

    if not needs_refresh:
        return access_token

    return await _refresh_access_token(refresh_token)


async def _refresh_access_token(refresh_token: str) -> str | None:
    """Call Google token endpoint to get a new access token."""
    client_id     = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    if not client_id or not client_secret:
        logger.error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set; cannot refresh token")
        return None

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "client_id":     client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type":    "refresh_token",
            },
            timeout=10,
        )

    if resp.status_code != 200:
        logger.warning("Token refresh failed %s: %s", resp.status_code, resp.text)
        return None

    return resp.json().get("access_token")


async def create_trip_events(
    calendar_doc: dict,
    itinerary: list[dict],
    start_date: str,  # "YYYY-MM-DD"
    destination: str = "Trip",
) -> list[str]:
    """Create one all-day Google Calendar event per itinerary day.

    Returns list of created event HTML links.
    """
    from datetime import date, timedelta

    access_token = await _ensure_valid_token(calendar_doc)
    if not access_token:
        raise PermissionError("No valid Google Calendar access token")

    cal_id = calendar_doc.get("calendarId", "primary")
    base_date = date.fromisoformat(start_date)
    url = EVENTS_URL.format(cal_id=cal_id)
    created_links: list[str] = []

    async with httpx.AsyncClient() as client:
        for day_data in itinerary:
            day_num = day_data.get("day", 1)
            event_date = base_date + timedelta(days=day_num - 1)
            next_date  = event_date + timedelta(days=1)
            theme      = day_data.get("theme", "")
            stops      = day_data.get("stops", [])

            description_lines = [f"Day {day_num}: {theme}\n"]
            for stop in stops:
                time  = stop.get("time", "")
                name  = stop.get("name", "")
                desc  = stop.get("description", "")
                line  = f"  • {time}  {name}"
                if desc:
                    line += f" — {desc}"
                description_lines.append(line)

            event_body = {
                "summary": f"Day {day_num}: {theme or destination}",
                "description": "\n".join(description_lines),
                "start": {"date": event_date.isoformat()},
                "end":   {"date": next_date.isoformat()},
            }

            resp = await client.post(
                url,
                json=event_body,
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )

            if resp.status_code in (200, 201):
                link = resp.json().get("htmlLink", "")
                created_links.append(link)
                logger.info("Created calendar event: Day %d (%s)", day_num, event_date)
            else:
                logger.warning("Failed to create event Day %d: %s %s", day_num, resp.status_code, resp.text)

    return created_links
