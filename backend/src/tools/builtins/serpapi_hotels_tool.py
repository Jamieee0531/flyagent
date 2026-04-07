"""SerpApi Google Hotels search tool — returns real-time hotel data."""

import json
import os

import httpx
from langchain.tools import tool

SERPAPI_BASE_URL = "https://serpapi.com/search.json"


def _get_api_key() -> str:
    key = os.environ.get("SERPAPI_API_KEY")
    if not key:
        raise RuntimeError("SERPAPI_API_KEY not set in environment.")
    return key


@tool("serpapi_hotels", parse_docstring=True)
def serpapi_hotels_tool(
    query: str,
    check_in_date: str,
    check_out_date: str,
    adults: int = 2,
    currency: str = "SGD",
) -> str:
    """Search for real-time hotel prices via Google Hotels (SerpApi). Returns actual prices, ratings, and hotel details.

    Args:
        query: Search query (e.g., 'hotels in Tokyo', '4 star hotels in Shinjuku Tokyo').
        check_in_date: Check-in date in YYYY-MM-DD format.
        check_out_date: Check-out date in YYYY-MM-DD format.
        adults: Number of adult guests (default 2).
        currency: Currency code for prices (default 'SGD').
    """
    params = {
        "engine": "google_hotels",
        "q": query,
        "check_in_date": check_in_date,
        "check_out_date": check_out_date,
        "adults": adults,
        "currency": currency,
        "hl": "en",
        "gl": "sg",
        "api_key": _get_api_key(),
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(SERPAPI_BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, Exception) as e:
        return json.dumps({"error": f"SerpApi request failed: {e}", "hotels": []})

    if "error" in data:
        return json.dumps({"error": data["error"], "hotels": []})

    properties = data.get("properties", [])
    if not properties:
        return json.dumps({"error": "No hotels found", "hotels": []})

    normalized = []
    for h in properties[:5]:
        # Get price — try total_rate first, then rate_per_night
        total_rate = h.get("total_rate", {}).get("lowest", "")
        rate_per_night = h.get("rate_per_night", {}).get("lowest", "")
        price = rate_per_night if rate_per_night else total_rate

        # Get booking link from serpapi property details
        booking_link = h.get("link", "")

        normalized.append({
            "name": h.get("name", "Unknown"),
            "hotel_class": h.get("hotel_class", "N/A"),
            "overall_rating": h.get("overall_rating", "N/A"),
            "reviews": h.get("reviews", 0),
            "price": str(price),
            "currency": currency,
            "amenities": h.get("amenities", []),
            "thumbnail": h.get("thumbnail", ""),
            "gps_coordinates": h.get("gps_coordinates", {}),
            "booking_link": booking_link,
        })

    return json.dumps({"hotels": normalized}, indent=2)
