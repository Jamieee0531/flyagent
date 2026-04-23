"""Prompt templates for memory update and injection."""

import re
from typing import Any

try:
    import tiktoken

    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False

# Prompt template for updating memory based on conversation
MEMORY_UPDATE_PROMPT = """You are a memory management system for Nomie, an AI travel planning assistant. Your task is to analyze a conversation and update the user's long-term travel preference profile.

Current Memory State:
<current_memory>
{current_memory}
</current_memory>

New Conversation to Process:
<conversation>
{conversation}
</conversation>

## What TO store (cross-trip preferences that apply to every future trip)

**travelProfile** — stable preferences that rarely change:
- homeCity: User's home city / usual departure point (e.g. "Shanghai (PVG)")
- flightPreference: Seat class, direct vs. connecting, preferred airlines, layover tolerance
- accommodationStyle: Hotel star rating, boutique vs. chain, location priority (city center / near transit)
- travelStyle: Pace (packed vs. relaxed), interests (history, food, nature, nightlife), solo/couple/family
- budgetRange: General per-trip budget range (e.g. "economy, 5000–10000 CNY per trip")
- dietaryNeeds: Vegetarian, halal, allergies, etc.
- mobilityNeeds: Accessibility requirements, physical limitations
- personalContext: Languages spoken, MBTI if mentioned, communication style

**Facts** — specific reusable facts:
- preference: Things user likes/dislikes about travel (e.g. "prefers window seat", "avoids red-eye flights")
- behavior: Booking habits, planning horizon (e.g. "books 2–3 months in advance")
- context: Stable background (home city, passport nationality, frequent flyer status)
- goal: Bucket list destinations, recurring travel goals

## What NOT to store (trip-specific, ephemeral — already saved in thread checkpoints)

NEVER store any of the following in memory:
- Specific destination for a current trip (e.g. "planning to visit Chiang Mai")
- Specific travel dates or departure dates (e.g. "departing May 1st")
- Specific flight or hotel options discussed (e.g. "considering MU5003")
- Current trip budget quoted in conversation (only store general budget range if explicitly stated as a habit)
- Itinerary details, day-by-day plans, or activity bookings
- Anything the user said "this time" or "for this trip"

If the conversation is purely about planning a specific trip with no new preference signals, output shouldUpdate=false for all sections and an empty newFacts array.

## Output Format (JSON)

{{
  "user": {{
    "travelProfile": {{ "summary": "...", "shouldUpdate": true/false }},
    "personalContext": {{ "summary": "...", "shouldUpdate": true/false }}
  }},
  "newFacts": [
    {{ "content": "...", "category": "preference|behavior|context|goal", "confidence": 0.0-1.0 }}
  ],
  "factsToRemove": ["fact_id_1", "fact_id_2"]
}}

## Rules

- Only set shouldUpdate=true when there is genuinely new cross-trip preference information
- Confidence: 0.9+ for explicitly stated facts, 0.7–0.8 for strongly implied, skip anything below 0.7
- Remove facts contradicted by new information (e.g. user corrects their home city)
- Do NOT record file upload events — they are session-specific and ephemeral
- Return ONLY valid JSON, no explanation or markdown"""


# Prompt template for extracting facts from a single message
FACT_EXTRACTION_PROMPT = """Extract factual information about the user from this message.

Message:
{message}

Extract facts in this JSON format:
{{
  "facts": [
    {{ "content": "...", "category": "preference|knowledge|context|behavior|goal", "confidence": 0.0-1.0 }}
  ]
}}

Categories:
- preference: User preferences (likes/dislikes, styles, tools)
- knowledge: User's expertise or knowledge areas
- context: Background context (location, job, projects)
- behavior: Behavioral patterns
- goal: User's goals or objectives

Rules:
- Only extract clear, specific facts
- Confidence should reflect certainty (explicit statement = 0.9+, implied = 0.6-0.8)
- Skip vague or temporary information

Return ONLY valid JSON."""


def _count_tokens(text: str, encoding_name: str = "cl100k_base") -> int:
    """Count tokens in text using tiktoken.

    Args:
        text: The text to count tokens for.
        encoding_name: The encoding to use (default: cl100k_base for GPT-4/3.5).

    Returns:
        The number of tokens in the text.
    """
    if not TIKTOKEN_AVAILABLE:
        # Fallback to character-based estimation if tiktoken is not available
        return len(text) // 4

    try:
        encoding = tiktoken.get_encoding(encoding_name)
        return len(encoding.encode(text))
    except Exception:
        # Fallback to character-based estimation on error
        return len(text) // 4


def format_memory_for_injection(memory_data: dict[str, Any], max_tokens: int = 2000) -> str:
    """Format memory data for injection into system prompt.

    Args:
        memory_data: The memory data dictionary.
        max_tokens: Maximum tokens to use (counted via tiktoken for accuracy).

    Returns:
        Formatted memory string for system prompt injection.
    """
    if not memory_data:
        return ""

    sections = []

    # Format user context
    user_data = memory_data.get("user", {})
    if user_data:
        user_sections = []

        travel_profile = user_data.get("travelProfile", {})
        if travel_profile.get("summary"):
            user_sections.append(f"Travel Preferences: {travel_profile['summary']}")

        personal_ctx = user_data.get("personalContext", {})
        if personal_ctx.get("summary"):
            user_sections.append(f"Personal: {personal_ctx['summary']}")

        if user_sections:
            sections.append("User Profile:\n" + "\n".join(f"- {s}" for s in user_sections))

    if not sections:
        return ""

    result = "\n\n".join(sections)

    # Use accurate token counting with tiktoken
    token_count = _count_tokens(result)
    if token_count > max_tokens:
        # Truncate to fit within token limit
        # Estimate characters to remove based on token ratio
        char_per_token = len(result) / token_count
        target_chars = int(max_tokens * char_per_token * 0.95)  # 95% to leave margin
        result = result[:target_chars] + "\n..."

    return result


def format_conversation_for_update(messages: list[Any]) -> str:
    """Format conversation messages for memory update prompt.

    Args:
        messages: List of conversation messages.

    Returns:
        Formatted conversation string.
    """
    lines = []
    for msg in messages:
        role = getattr(msg, "type", "unknown")
        content = getattr(msg, "content", str(msg))

        # Handle content that might be a list (multimodal)
        if isinstance(content, list):
            text_parts = [p.get("text", "") for p in content if isinstance(p, dict) and "text" in p]
            content = " ".join(text_parts) if text_parts else str(content)

        # Strip uploaded_files tags from human messages to avoid persisting
        # ephemeral file path info into long-term memory.  Skip the turn entirely
        # when nothing remains after stripping (upload-only message).
        if role == "human":
            content = re.sub(r"<uploaded_files>[\s\S]*?</uploaded_files>\n*", "", str(content)).strip()
            if not content:
                continue

        # Truncate very long messages
        if len(str(content)) > 1000:
            content = str(content)[:1000] + "..."

        if role == "human":
            lines.append(f"User: {content}")
        elif role == "ai":
            lines.append(f"Assistant: {content}")

    return "\n\n".join(lines)
