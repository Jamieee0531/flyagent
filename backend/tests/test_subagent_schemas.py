"""Unit tests for sub-agent output schemas."""

import json

import pytest


class TestFlightSearchSchema:
    def test_valid_flight_result(self):
        from src.subagents.schemas import FlightSearchResult

        data = {
            "flights": [
                {
                    "airline": "Singapore Airlines",
                    "flight_number": "SQ123",
                    "origin": "SIN",
                    "destination": "NRT",
                    "departure_time": "2026-05-01 08:00",
                    "arrival_time": "2026-05-01 16:00",
                    "price": "$450",
                    "currency": "USD",
                    "booking_link": "https://example.com",
                    "source": "Duffel",
                }
            ],
            "search_summary": "Found 1 option",
        }
        result = FlightSearchResult.model_validate(data)
        assert len(result.flights) == 1
        assert result.flights[0].airline == "Singapore Airlines"

    def test_missing_required_field_raises(self):
        from src.subagents.schemas import FlightSearchResult

        with pytest.raises(Exception):
            FlightSearchResult.model_validate({"flights": [{"airline": "Test"}]})

    def test_parse_from_json_string(self):
        from src.subagents.schemas import FlightSearchResult

        json_str = json.dumps({
            "flights": [
                {
                    "airline": "ANA",
                    "flight_number": "NH801",
                    "origin": "SIN",
                    "destination": "NRT",
                    "departure_time": "2026-05-01 10:00",
                    "arrival_time": "2026-05-01 18:00",
                    "price": "$380",
                    "currency": "USD",
                    "booking_link": "",
                    "source": "Duffel",
                }
            ],
            "search_summary": "1 option found",
        })
        result = FlightSearchResult.model_validate_json(json_str)
        assert result.flights[0].flight_number == "NH801"


class TestHotelSearchSchema:
    def test_valid_hotel_result(self):
        from src.subagents.schemas import HotelSearchResult

        data = {
            "hotels": [
                {
                    "name": "Hotel Gracery",
                    "location": "Shinjuku",
                    "price_per_night": "$120",
                    "currency": "USD",
                    "rating": "8.5/10",
                    "image_url": "",
                    "booking_link": "",
                    "source": "LiteAPI",
                }
            ],
            "search_summary": "Found 1 hotel",
        }
        result = HotelSearchResult.model_validate(data)
        assert result.hotels[0].name == "Hotel Gracery"


class TestItinerarySchema:
    def test_valid_itinerary(self):
        from src.subagents.schemas import ItineraryResult

        data = {
            "days": [
                {
                    "day": 1,
                    "theme": "Historic Tokyo",
                    "morning": "Visit Senso-ji Temple",
                    "afternoon": "Explore Ueno Park",
                    "evening": "Dinner in Asakusa",
                    "transport_notes": "Take Ginza Line",
                }
            ],
            "search_summary": "1-day itinerary",
        }
        result = ItineraryResult.model_validate(data)
        assert result.days[0].theme == "Historic Tokyo"


class TestTravelTipsSchema:
    def test_valid_tips(self):
        from src.subagents.schemas import TravelTipsResult

        data = {
            "categories": [
                {"category": "Visa & Entry", "tips": ["No visa needed for 30 days"]},
                {"category": "Transport", "tips": ["Get a Suica card", "Use JR Pass"]},
            ],
            "search_summary": "Tips for Japan",
        }
        result = TravelTipsResult.model_validate(data)
        assert len(result.categories) == 2
        assert len(result.categories[1].tips) == 2


class TestSchemaMapping:
    def test_all_subagent_types_have_schema(self):
        from src.subagents.schemas import SUBAGENT_SCHEMA

        expected = {"flight-search", "hotel-search", "itinerary-planner", "travel-tips"}
        assert set(SUBAGENT_SCHEMA.keys()) == expected
