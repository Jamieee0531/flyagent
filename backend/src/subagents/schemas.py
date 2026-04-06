"""Pydantic output schemas for sub-agent structured output."""

from pydantic import BaseModel


# --- Flight Search ---

class FlightOption(BaseModel):
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    price: str
    currency: str
    booking_link: str
    source: str


class FlightSearchResult(BaseModel):
    flights: list[FlightOption]
    search_summary: str


# --- Hotel Search ---

class HotelOption(BaseModel):
    name: str
    location: str
    price_per_night: str
    currency: str
    rating: str
    image_url: str
    booking_link: str
    source: str


class HotelSearchResult(BaseModel):
    hotels: list[HotelOption]
    search_summary: str


# --- Itinerary Planner ---

class DayPlan(BaseModel):
    day: int
    theme: str
    morning: str
    afternoon: str
    evening: str
    transport_notes: str


class ItineraryResult(BaseModel):
    days: list[DayPlan]
    search_summary: str


# --- Travel Tips ---

class TipCategory(BaseModel):
    category: str
    tips: list[str]


class TravelTipsResult(BaseModel):
    categories: list[TipCategory]
    search_summary: str


# --- Schema Registry ---

SUBAGENT_SCHEMA: dict[str, type[BaseModel]] = {
    "flight-search": FlightSearchResult,
    "hotel-search": HotelSearchResult,
    "itinerary-planner": ItineraryResult,
    "travel-tips": TravelTipsResult,
}
