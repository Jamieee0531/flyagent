"""Unit tests for LiteAPI hotel search tool."""

import json
from unittest.mock import MagicMock, patch

import pytest


class TestLiteapiTool:
    """Tests for liteapi_hotel_search_tool."""

    def test_missing_api_key_raises(self):
        """Tool raises RuntimeError when LITEAPI_PRIVATE_KEY is not set."""
        from src.tools.builtins.liteapi_tool import _get_api_key

        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(RuntimeError, match="LITEAPI_PRIVATE_KEY"):
                _get_api_key()

    def test_api_key_from_env(self):
        """Tool reads API key from environment."""
        from src.tools.builtins.liteapi_tool import _get_api_key

        with patch.dict("os.environ", {"LITEAPI_PRIVATE_KEY": "sand_abc123"}):
            assert _get_api_key() == "sand_abc123"

    def test_successful_search_returns_hotels(self):
        """Tool returns normalized hotel list."""
        from src.tools.builtins.liteapi_tool import liteapi_hotel_search_tool

        mock_hotels = [
            {
                "hotelId": f"h{i}",
                "name": f"Hotel {i}",
                "price": 100 + i * 20,
                "currency": "USD",
                "rating": 4.0 + i * 0.1,
                "address": f"Address {i}",
            }
            for i in range(7)
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": mock_hotels}
        mock_response.raise_for_status = MagicMock()

        with patch.dict("os.environ", {"LITEAPI_PRIVATE_KEY": "sand_abc123"}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.__enter__ = MagicMock(return_value=mock_client)
                mock_client.__exit__ = MagicMock(return_value=False)
                mock_client.get.return_value = mock_response
                mock_client_cls.return_value = mock_client

                result = liteapi_hotel_search_tool.invoke(
                    {
                        "city_code": "Tokyo",
                        "country_code": "JP",
                        "checkin": "2026-05-01",
                        "checkout": "2026-05-05",
                    }
                )

        parsed = json.loads(result)
        assert "hotels" in parsed
        assert len(parsed["hotels"]) == 5  # capped at 5

    def test_http_error_returns_error_json(self):
        """Tool returns error JSON on HTTP failure."""
        from src.tools.builtins.liteapi_tool import liteapi_hotel_search_tool

        with patch.dict("os.environ", {"LITEAPI_PRIVATE_KEY": "sand_abc123"}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.__enter__ = MagicMock(return_value=mock_client)
                mock_client.__exit__ = MagicMock(return_value=False)
                mock_client.get.side_effect = Exception("Timeout")
                mock_client_cls.return_value = mock_client

                result = liteapi_hotel_search_tool.invoke(
                    {
                        "city_code": "Tokyo",
                        "country_code": "JP",
                        "checkin": "2026-05-01",
                        "checkout": "2026-05-05",
                    }
                )

        parsed = json.loads(result)
        assert "error" in parsed
