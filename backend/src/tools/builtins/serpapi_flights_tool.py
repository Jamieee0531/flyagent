"""SerpApi Google Flights search tool — returns real-time flight data."""

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


@tool("serpapi_flights", parse_docstring=True)
def serpapi_flights_tool(
    departure_id: str,
    arrival_id: str,
    outbound_date: str,
    return_date: str = "",
    adults: int = 1,
    currency: str = "SGD",
) -> str:
    """Search for real-time flight prices via Google Flights (SerpApi). Returns actual prices, airlines, times, and stops.

    Args:
        departure_id: IATA airport or city code (e.g., 'SIN' for Singapore).
        arrival_id: IATA airport or city code (e.g., 'NRT' for Tokyo Narita, 'TYO' for all Tokyo airports).
        outbound_date: Departure date in YYYY-MM-DD format.
        return_date: Return date in YYYY-MM-DD format. Empty string for one-way.
        adults: Number of adult passengers (default 1).
        currency: Currency code for prices (default 'SGD').
    """
    params = {
        "engine": "google_flights",
        "departure_id": departure_id,
        "arrival_id": arrival_id,
        "outbound_date": outbound_date,
        "currency": currency,
        "hl": "en",
        "adults": adults,
        "api_key": _get_api_key(),
    }

    # Round trip (type=1) or one-way (type=2)
    if return_date:
        params["return_date"] = return_date
        params["type"] = 1  # round trip
    else:
        params["type"] = 2  # one-way

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(SERPAPI_BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, Exception) as e:
        return json.dumps({"error": f"SerpApi request failed: {e}", "flights": []})

    if "error" in data:
        return json.dumps({"error": data["error"], "flights": []})

    # Combine best_flights and other_flights, take top 5
    all_flights = data.get("best_flights", []) + data.get("other_flights", [])
    if not all_flights:
        return json.dumps({"error": "No flights found", "flights": []})

    normalized = []
    for f in all_flights[:5]:
        legs = f.get("flights", [])
        if not legs:
            continue

        first_leg = legs[0]
        last_leg = legs[-1]
        stops = len(legs) - 1

        normalized.append({
            "airline": first_leg.get("airline", "Unknown"),
            "flight_number": first_leg.get("flight_number", ""),
            "origin": first_leg.get("departure_airport", {}).get("id", departure_id),
            "destination": last_leg.get("arrival_airport", {}).get("id", arrival_id),
            "departure_time": first_leg.get("departure_airport", {}).get("time", ""),
            "arrival_time": last_leg.get("arrival_airport", {}).get("time", ""),
            "return_date": return_date if return_date else "",
            "duration_minutes": f.get("total_duration", 0),
            "stops": "Nonstop" if stops == 0 else f"{stops} stop{'s' if stops > 1 else ''}",
            "price": f.get("price", "N/A"),
            "currency": currency,
            "airline_logo": first_leg.get("airline_logo", ""),
        })

    return json.dumps({"flights": normalized}, indent=2)
