"""Flight price tracker — fetches prices via SerpApi and stores history in MongoDB.

Provides:
  - fetch_current_price()   : call SerpApi for a route on given dates
  - record_price()          : persist a price snapshot to MongoDB
  - get_30day_low()         : query MongoDB for the lowest price in the past 30 days
  - is_at_historical_low()  : True when current price is ≤ 30-day low + tolerance
"""

import logging
import os
from datetime import datetime, timedelta, timezone

import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

SERPAPI_BASE = "https://serpapi.com/search.json"
PRICE_HISTORY_COLLECTION = "flight_price_history"

# City name → IATA code lookup (lowercase → IATA)
CITY_TO_IATA: dict[str, str] = {
    "singapore": "SIN",
    "tokyo":     "NRT",
    "osaka":     "KIX",
    "kyoto":     "KIX",
    "seoul":     "ICN",
    "bangkok":   "BKK",
    "bali":      "DPS",
    "denpasar":  "DPS",
    "london":    "LHR",
    "paris":     "CDG",
    "dubai":     "DXB",
    "new york":  "JFK",
    "sydney":    "SYD",
    "hong kong": "HKG",
    "taipei":    "TPE",
    "kuala lumpur": "KUL",
    "jakarta":   "CGK",
    "hanoi":     "HAN",
    "ho chi minh": "SGN",
    "ho chi minh city": "SGN",
    "beijing":   "PEK",
    "shanghai":  "PVG",
    "chengdu":   "CTU",
    "amsterdam": "AMS",
    "rome":      "FCO",
    "barcelona": "BCN",
    "madrid":    "MAD",
    "istanbul":  "IST",
    "cairo":     "CAI",
    "nairobi":   "NBO",
    "mumbai":    "BOM",
    "delhi":     "DEL",
}


def city_to_iata(city_name: str) -> str | None:
    """Convert a city name to IATA code. Returns None if unknown."""
    if not city_name:
        return None
    lower = city_name.strip().lower()
    # Direct match
    if lower in CITY_TO_IATA:
        return CITY_TO_IATA[lower]
    # Partial match
    for key, code in CITY_TO_IATA.items():
        if key in lower or lower in key:
            return code
    # Already an IATA code (3 uppercase letters)
    if len(city_name) == 3 and city_name.isupper():
        return city_name
    return None


async def fetch_current_price(
    origin: str,
    destination: str,
    outbound_date: str,
    return_date: str = "",
    currency: str = "USD",
) -> float | None:
    """Fetch the cheapest available price for a route via SerpApi.

    Args:
        origin: IATA code
        destination: IATA code
        outbound_date: YYYY-MM-DD
        return_date: YYYY-MM-DD or ""
        currency: ISO currency code

    Returns:
        Lowest price as float, or None on failure.
    """
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        logger.warning("SERPAPI_API_KEY not set — skipping price fetch")
        return None

    params = {
        "engine":       "google_flights",
        "departure_id": origin,
        "arrival_id":   destination,
        "outbound_date": outbound_date,
        "currency":     currency,
        "hl":           "en",
        "adults":       1,
        "api_key":      api_key,
    }
    if return_date:
        params["return_date"] = return_date
        params["type"] = 1
    else:
        params["type"] = 2

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(SERPAPI_BASE, params=params)
        if resp.status_code != 200:
            logger.warning("SerpApi returned %s", resp.status_code)
            return None
        data = resp.json()
        all_flights = data.get("best_flights", []) + data.get("other_flights", [])
        prices = [f["price"] for f in all_flights if isinstance(f.get("price"), (int, float))]
        return float(min(prices)) if prices else None
    except Exception:
        logger.exception("SerpApi request failed for %s→%s", origin, destination)
        return None


async def record_price(
    db: AsyncIOMotorDatabase,
    user_id: str,
    origin: str,
    destination: str,
    price: float,
    currency: str = "USD",
) -> None:
    """Persist a price snapshot to MongoDB."""
    await db[PRICE_HISTORY_COLLECTION].insert_one({
        "userId":      user_id,
        "origin":      origin,
        "destination": destination,
        "price":       price,
        "currency":    currency,
        "recordedAt":  datetime.now(tz=timezone.utc),
    })


async def get_30day_low(
    db: AsyncIOMotorDatabase,
    user_id: str,
    origin: str,
    destination: str,
) -> float | None:
    """Return the minimum recorded price over the past 30 days."""
    since = datetime.now(tz=timezone.utc) - timedelta(days=30)
    cursor = db[PRICE_HISTORY_COLLECTION].find(
        {
            "userId":      user_id,
            "origin":      origin,
            "destination": destination,
            "recordedAt":  {"$gte": since},
        },
        {"price": 1},
    )
    docs = await cursor.to_list(length=1000)
    prices = [d["price"] for d in docs if isinstance(d.get("price"), (int, float))]
    return float(min(prices)) if prices else None


def is_at_historical_low(
    current_price: float,
    low_30d: float,
    tolerance: float = 0.05,
) -> bool:
    """Return True when current price is within tolerance of the 30-day low.

    Default 5% tolerance: current ≤ low * 1.05
    """
    return current_price <= low_30d * (1 + tolerance)
