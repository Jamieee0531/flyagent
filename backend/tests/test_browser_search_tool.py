"""Unit tests for browser_search tool."""

import json
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestBrowserSearchTool:
    """Tests for browser_search_tool."""

    def test_invalid_site_returns_error(self):
        """Tool returns error for unknown site."""
        from src.tools.builtins.browser_search_tool import browser_search_tool

        result = browser_search_tool.invoke(
            {"site": "unknown_site", "query_params": '{"origin_city": "Singapore"}'}
        )
        parsed = json.loads(result)
        assert "error" in parsed
        assert "unknown_site" in parsed["error"]

    def test_invalid_json_params_returns_error(self):
        """Tool returns error for malformed query_params JSON."""
        from src.tools.builtins.browser_search_tool import browser_search_tool

        result = browser_search_tool.invoke(
            {"site": "google_flights", "query_params": "not valid json"}
        )
        parsed = json.loads(result)
        assert "error" in parsed

    def test_supported_sites_list(self):
        """All expected sites are in SUPPORTED_SITES."""
        from src.tools.builtins.browser_search_tool import SUPPORTED_SITES

        assert "google_flights" in SUPPORTED_SITES
        assert "skyscanner" in SUPPORTED_SITES
        assert "booking" in SUPPORTED_SITES
        assert "agoda" in SUPPORTED_SITES

    def test_load_skill_template(self):
        """Skill template loads and contains expected placeholders."""
        from src.tools.builtins.browser_search_tool import _load_skill_template

        # This test will work once skill files are created (Task 3+)
        # For now, test that missing skill returns None
        result = _load_skill_template("nonexistent_site")
        assert result is None

    def test_format_task_replaces_placeholders(self):
        """Task formatter replaces placeholders in skill template."""
        from src.tools.builtins.browser_search_tool import _format_task

        template = "Search flights from {origin_city} to {destination_city} on {departure_date}"
        params = {
            "origin_city": "Singapore",
            "destination_city": "Tokyo",
            "departure_date": "2026-05-01",
        }
        result = _format_task(template, params)
        assert "Singapore" in result
        assert "Tokyo" in result
        assert "2026-05-01" in result
        assert "{origin_city}" not in result
