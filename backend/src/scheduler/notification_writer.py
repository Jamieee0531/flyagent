"""Personalized notification copy generator using Claude API (Haiku)."""

import logging
import os

import anthropic

logger = logging.getLogger(__name__)


async def generate_notification_copy(
    mbti_type: str,
    mbti_title: str,
    destination: str,
    current_price: float,
    low_30d: float,
    free_dates: list[str],   # ["2026-05-10", "2026-05-11", "2026-05-12"]
    currency: str = "USD",
    season_label: str = "shoulder season",
) -> str:
    """Generate a personalized push notification using Claude Haiku.

    Returns a 2-3 sentence notification string.
    Falls back to a template string if the API call fails.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set — using fallback copy")
        return _fallback_copy(destination, current_price, low_30d, free_dates, currency)

    savings_pct = round((1 - current_price / low_30d) * 100) if low_30d else 0
    date_range  = f"{free_dates[0]} to {free_dates[-1]}" if free_dates else "upcoming dates"
    n_days      = len(free_dates)

    prompt = f"""You are a travel notification copywriter for Nomie, a personality-driven travel app.

Write a push notification (2-3 sentences, max 180 characters total) for a user with this profile:
- Travel personality: {mbti_title} ({mbti_type})
- Destination they've saved: {destination}
- Current flight price: {currency} {current_price:.0f} (hitting the 30-day low, {savings_pct}% below recent average)
- Their calendar is free: {n_days} days from {date_range}
- Season: {season_label}

Rules:
- Match the tone to their travel personality (e.g. introverts → peaceful/off-beaten, adventure types → exciting/bold)
- Mention the price opportunity and their free window
- End with a gentle call to action
- No emojis, no hashtags, plain text only
- Return ONLY the notification text, nothing else"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception:
        logger.exception("Claude API call failed — using fallback copy")
        return _fallback_copy(destination, current_price, low_30d, free_dates, currency)


def _fallback_copy(
    destination: str,
    current_price: float,
    low_30d: float,
    free_dates: list[str],
    currency: str,
) -> str:
    savings_pct = round((1 - current_price / low_30d) * 100) if low_30d else 0
    date_range  = f"{free_dates[0]} – {free_dates[-1]}" if free_dates else "your free window"
    return (
        f"Flights to {destination} just hit their 30-day low at {currency} {current_price:.0f} "
        f"({savings_pct}% off recent prices). "
        f"You have {len(free_dates)} free days from {date_range} — perfect timing to plan a trip."
    )
