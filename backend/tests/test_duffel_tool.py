"""Unit tests for Duffel flight search tool."""

import json
from unittest.mock import MagicMock, patch

import pytest


class TestDuffelTool:
    """Tests for duffel_flight_search_tool."""

    def test_missing_api_key_raises(self):
        """Tool raises RuntimeError when DUFFEL_API_KEY is not set."""
        from src.tools.builtins.duffel_tool import _get_api_key

        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(RuntimeError, match="DUFFEL_API_KEY"):
                _get_api_key()

    def test_api_key_from_env(self):
        """Tool reads API key from environment."""
        from src.tools.builtins.duffel_tool import _get_api_key

        with patch.dict("os.environ", {"DUFFEL_API_KEY": "duffel_test_abc"}):
            assert _get_api_key() == "duffel_test_abc"

    def test_successful_search_returns_top5(self):
        """Tool returns top 5 offers sorted by price."""
        from src.tools.builtins.duffel_tool import duffel_flight_search_tool

        mock_offers = [
            {
                "id": f"off_{i}",
                "total_amount": str(100 + i * 50),
                "total_currency": "USD",
                "slices": [
                    {
                        "segments": [
                            {
                                "marketing_carrier": {"name": f"Airline {i}", "iata_code": "AA"},
                                "marketing_carrier_flight_number": f"{100 + i}",
                                "origin": {"iata_code": "SIN"},
                                "destination": {"iata_code": "NRT"},
                                "departing_at": "2026-05-01T08:00:00",
                                "arriving_at": "2026-05-01T16:00:00",
                            }
                        ]
                    }
                ],
            }
            for i in range(7)
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {"offers": mock_offers}}
        mock_response.raise_for_status = MagicMock()

        with patch.dict("os.environ", {"DUFFEL_API_KEY": "duffel_test_abc"}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.__enter__ = MagicMock(return_value=mock_client)
                mock_client.__exit__ = MagicMock(return_value=False)
                mock_client.post.return_value = mock_response
                mock_client_cls.return_value = mock_client

                result = duffel_flight_search_tool.invoke(
                    {"origin": "SIN", "destination": "NRT", "departure_date": "2026-05-01"}
                )

        parsed = json.loads(result)
        assert "offers" in parsed
        assert len(parsed["offers"]) == 5
        # verify sorted by price ascending
        prices = [float(o["total_amount"]) for o in parsed["offers"]]
        assert prices == sorted(prices)

    def test_http_error_returns_error_json(self):
        """Tool returns error JSON on HTTP failure."""
        from src.tools.builtins.duffel_tool import duffel_flight_search_tool

        with patch.dict("os.environ", {"DUFFEL_API_KEY": "duffel_test_abc"}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.__enter__ = MagicMock(return_value=mock_client)
                mock_client.__exit__ = MagicMock(return_value=False)
                mock_client.post.side_effect = Exception("Connection refused")
                mock_client_cls.return_value = mock_client

                result = duffel_flight_search_tool.invoke(
                    {"origin": "SIN", "destination": "NRT", "departure_date": "2026-05-01"}
                )

        parsed = json.loads(result)
        assert "error" in parsed

    def test_round_trip_with_return_date(self):
        """Tool sends two slices for round-trip search."""
        from src.tools.builtins.duffel_tool import duffel_flight_search_tool

        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {"offers": []}}
        mock_response.raise_for_status = MagicMock()

        with patch.dict("os.environ", {"DUFFEL_API_KEY": "duffel_test_abc"}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.__enter__ = MagicMock(return_value=mock_client)
                mock_client.__exit__ = MagicMock(return_value=False)
                mock_client.post.return_value = mock_response
                mock_client_cls.return_value = mock_client

                duffel_flight_search_tool.invoke(
                    {
                        "origin": "SIN",
                        "destination": "NRT",
                        "departure_date": "2026-05-01",
                        "return_date": "2026-05-05",
                    }
                )

                # verify payload has 2 slices
                call_args = mock_client.post.call_args
                payload = call_args[1]["json"]
                assert len(payload["data"]["slices"]) == 2
