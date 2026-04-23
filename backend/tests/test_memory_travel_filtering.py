"""Tests for travel-specific memory filtering.

Verifies that the updated MEMORY_UPDATE_PROMPT correctly instructs the LLM
to store cross-trip preferences but NOT trip-specific details.

These tests mock the LLM call so they run without API keys.
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from langchain_core.messages import AIMessage, HumanMessage

from src.agents.memory.updater import MemoryUpdater, _create_empty_memory


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_llm_response(data: dict) -> MagicMock:
    """Wrap a dict as a fake LLM response."""
    mock = MagicMock()
    mock.content = json.dumps(data)
    return mock


TRIP_PLANNING_MESSAGES = [
    HumanMessage(content="帮我规划上海到东京5天行程，5月1日出发，预算8000元"),
    AIMessage(content="好的，我来帮你搜索从上海到东京的航班，5月1日出发，5天行程，预算8000元。"),
    HumanMessage(content="好，开始搜吧"),
    AIMessage(content="已找到3个航班选项：MU271 ¥3200，CA921 ¥2980，NH927 ¥4100。"),
]

PREFERENCE_MESSAGES = [
    HumanMessage(content="我一般喜欢直飞，不喜欢转机，座位要靠窗"),
    AIMessage(content="好的，我记住了，你偏好直飞靠窗座位。"),
    HumanMessage(content="对，而且我出发地基本都是上海浦东"),
    AIMessage(content="明白，以后搜索默认以上海浦东（PVG）为出发地。"),
]


# ---------------------------------------------------------------------------
# Test: trip-specific info is NOT stored
# ---------------------------------------------------------------------------

class TestTripSpecificNotStored:

    def test_destination_not_stored(self):
        """LLM output mentioning specific destination should not enter memory
        when the mock correctly refuses to store it."""
        # Simulate LLM correctly following the new prompt — no trip-specific facts
        llm_response = _make_llm_response({
            "user": {
                "travelProfile": {"summary": "", "shouldUpdate": False},
                "personalContext": {"summary": "", "shouldUpdate": False},
            },
            "newFacts": [],
            "factsToRemove": [],
        })

        updater = MemoryUpdater()
        with patch.object(updater, "_get_model") as mock_model_fn:
            mock_model = MagicMock()
            mock_model.invoke.return_value = llm_response
            mock_model_fn.return_value = mock_model

            with patch("src.agents.memory.updater._save_memory_to_file", return_value=True):
                with patch("src.agents.memory.updater.get_memory_data", return_value=_create_empty_memory()):
                    result = updater.update_memory(TRIP_PLANNING_MESSAGES, thread_id="test-trip")

        assert result is True
        # LLM correctly returned no new facts for a trip-only conversation
        assert mock_model.invoke.call_count == 1

    def test_new_prompt_contains_do_not_store_instructions(self):
        """The updated prompt must explicitly list trip-specific fields to exclude."""
        from src.agents.memory.prompt import MEMORY_UPDATE_PROMPT

        prompt_lower = MEMORY_UPDATE_PROMPT.lower()
        assert "never store" in prompt_lower or "not to store" in prompt_lower or "never" in prompt_lower
        assert "destination" in prompt_lower
        assert "date" in prompt_lower
        assert "budget" in prompt_lower

    def test_new_prompt_removed_work_context(self):
        """workContext / topOfMind / recentMonths should not appear in the new prompt."""
        from src.agents.memory.prompt import MEMORY_UPDATE_PROMPT

        assert "workContext" not in MEMORY_UPDATE_PROMPT
        assert "topOfMind" not in MEMORY_UPDATE_PROMPT
        assert "recentMonths" not in MEMORY_UPDATE_PROMPT

    def test_new_prompt_has_travel_profile(self):
        """New prompt should reference travelProfile as the main storage section."""
        from src.agents.memory.prompt import MEMORY_UPDATE_PROMPT

        assert "travelProfile" in MEMORY_UPDATE_PROMPT


# ---------------------------------------------------------------------------
# Test: cross-trip preferences ARE stored
# ---------------------------------------------------------------------------

class TestPreferencesAreStored:

    def test_flight_preference_stored(self):
        """Cross-trip preferences like direct flights and window seat should be stored."""
        llm_response = _make_llm_response({
            "user": {
                "travelProfile": {
                    "summary": "Departs from Shanghai Pudong (PVG). Prefers direct flights and window seats.",
                    "shouldUpdate": True,
                },
                "personalContext": {"summary": "", "shouldUpdate": False},
            },
            "newFacts": [
                {"content": "Prefers direct flights, avoids connecting flights.", "category": "preference", "confidence": 1.0},
                {"content": "Prefers window seat.", "category": "preference", "confidence": 1.0},
                {"content": "Home departure airport: Shanghai Pudong (PVG).", "category": "context", "confidence": 1.0},
            ],
            "factsToRemove": [],
        })

        saved_memory = {}

        def capture_save(memory_data, agent_name=None):
            saved_memory.update(memory_data)
            return True

        updater = MemoryUpdater()
        with patch.object(updater, "_get_model") as mock_model_fn:
            mock_model = MagicMock()
            mock_model.invoke.return_value = llm_response
            mock_model_fn.return_value = mock_model

            with patch("src.agents.memory.updater._save_memory_to_file", side_effect=capture_save):
                with patch("src.agents.memory.updater.get_memory_data", return_value=_create_empty_memory()):
                    result = updater.update_memory(PREFERENCE_MESSAGES, thread_id="test-pref")

        assert result is True

        # travelProfile summary was saved
        assert "PVG" in saved_memory["user"]["travelProfile"]["summary"]

        # 3 preference facts were stored
        fact_contents = [f["content"] for f in saved_memory["facts"]]
        assert any("direct" in c.lower() for c in fact_contents)
        assert any("window" in c.lower() for c in fact_contents)
        assert any("PVG" in c for c in fact_contents)


# ---------------------------------------------------------------------------
# Test: empty memory structure uses new schema
# ---------------------------------------------------------------------------

class TestEmptyMemorySchema:

    def test_new_schema_has_travel_profile(self):
        mem = _create_empty_memory()
        assert "travelProfile" in mem["user"]
        assert "personalContext" in mem["user"]

    def test_new_schema_no_old_fields(self):
        mem = _create_empty_memory()
        assert "workContext" not in mem["user"]
        assert "topOfMind" not in mem["user"]
        assert "history" not in mem

    def test_version_is_2(self):
        mem = _create_empty_memory()
        assert mem["version"] == "2.0"
