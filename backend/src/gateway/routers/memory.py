"""Memory API router for retrieving and managing global memory data."""

import uuid
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.agents.memory.updater import _save_memory_to_file, get_memory_data, reload_memory_data
from src.config.memory_config import get_memory_config

router = APIRouter(prefix="/api", tags=["memory"])


class ContextSection(BaseModel):
    """Model for context sections (user and history)."""

    summary: str = Field(default="", description="Summary content")
    updatedAt: str = Field(default="", description="Last update timestamp")


class UserContext(BaseModel):
    """User travel preferences (v2.0 schema)."""

    travelProfile: ContextSection = Field(default_factory=ContextSection)
    personalContext: ContextSection = Field(default_factory=ContextSection)


class Fact(BaseModel):
    """A single extracted memory fact."""

    id: str = Field(..., description="Unique identifier for the fact")
    content: str = Field(..., description="Fact content")
    category: str = Field(default="context", description="Fact category")
    confidence: float = Field(default=0.5, description="Confidence score (0-1)")
    createdAt: str = Field(default="", description="Creation timestamp")
    source: str = Field(default="unknown", description="Source thread ID")


class MemoryResponse(BaseModel):
    """Memory data response (v2.0 travel-specific schema)."""

    version: str = Field(default="2.0", description="Memory schema version")
    lastUpdated: str = Field(default="", description="Last update timestamp")
    user: UserContext = Field(default_factory=UserContext)
    facts: list[Fact] = Field(default_factory=list)


class MemoryConfigResponse(BaseModel):
    """Response model for memory configuration."""

    enabled: bool = Field(..., description="Whether memory is enabled")
    storage_path: str = Field(..., description="Path to memory storage file")
    debounce_seconds: int = Field(..., description="Debounce time for memory updates")
    max_facts: int = Field(..., description="Maximum number of facts to store")
    fact_confidence_threshold: float = Field(..., description="Minimum confidence threshold for facts")
    injection_enabled: bool = Field(..., description="Whether memory injection is enabled")
    max_injection_tokens: int = Field(..., description="Maximum tokens for memory injection")


class MemoryStatusResponse(BaseModel):
    """Response model for memory status."""

    config: MemoryConfigResponse
    data: MemoryResponse


@router.get(
    "/memory",
    response_model=MemoryResponse,
    summary="Get Memory Data",
    description="Retrieve the current global memory data including user context, history, and facts.",
)
async def get_memory() -> MemoryResponse:
    """Get the current global memory data.

    Returns:
        The current memory data with user context, history, and facts.

    Example Response:
        ```json
        {
            "version": "1.0",
            "lastUpdated": "2024-01-15T10:30:00Z",
            "user": {
                "workContext": {"summary": "Working on DeerFlow project", "updatedAt": "..."},
                "personalContext": {"summary": "Prefers concise responses", "updatedAt": "..."},
                "topOfMind": {"summary": "Building memory API", "updatedAt": "..."}
            },
            "history": {
                "recentMonths": {"summary": "Recent development activities", "updatedAt": "..."},
                "earlierContext": {"summary": "", "updatedAt": ""},
                "longTermBackground": {"summary": "", "updatedAt": ""}
            },
            "facts": [
                {
                    "id": "fact_abc123",
                    "content": "User prefers TypeScript over JavaScript",
                    "category": "preference",
                    "confidence": 0.9,
                    "createdAt": "2024-01-15T10:30:00Z",
                    "source": "thread_xyz"
                }
            ]
        }
        ```
    """
    memory_data = get_memory_data()
    return MemoryResponse(**memory_data)


@router.post(
    "/memory/reload",
    response_model=MemoryResponse,
    summary="Reload Memory Data",
    description="Reload memory data from the storage file, refreshing the in-memory cache.",
)
async def reload_memory() -> MemoryResponse:
    """Reload memory data from file.

    This forces a reload of the memory data from the storage file,
    useful when the file has been modified externally.

    Returns:
        The reloaded memory data.
    """
    memory_data = reload_memory_data()
    return MemoryResponse(**memory_data)


@router.get(
    "/memory/config",
    response_model=MemoryConfigResponse,
    summary="Get Memory Configuration",
    description="Retrieve the current memory system configuration.",
)
async def get_memory_config_endpoint() -> MemoryConfigResponse:
    """Get the memory system configuration.

    Returns:
        The current memory configuration settings.

    Example Response:
        ```json
        {
            "enabled": true,
            "storage_path": ".deer-flow/memory.json",
            "debounce_seconds": 30,
            "max_facts": 100,
            "fact_confidence_threshold": 0.7,
            "injection_enabled": true,
            "max_injection_tokens": 2000
        }
        ```
    """
    config = get_memory_config()
    return MemoryConfigResponse(
        enabled=config.enabled,
        storage_path=config.storage_path,
        debounce_seconds=config.debounce_seconds,
        max_facts=config.max_facts,
        fact_confidence_threshold=config.fact_confidence_threshold,
        injection_enabled=config.injection_enabled,
        max_injection_tokens=config.max_injection_tokens,
    )


@router.get(
    "/memory/status",
    response_model=MemoryStatusResponse,
    summary="Get Memory Status",
    description="Retrieve both memory configuration and current data in a single request.",
)
async def get_memory_status() -> MemoryStatusResponse:
    """Get the memory system status including configuration and data.

    Returns:
        Combined memory configuration and current data.
    """
    config = get_memory_config()
    memory_data = get_memory_data()

    return MemoryStatusResponse(
        config=MemoryConfigResponse(
            enabled=config.enabled,
            storage_path=config.storage_path,
            debounce_seconds=config.debounce_seconds,
            max_facts=config.max_facts,
            fact_confidence_threshold=config.fact_confidence_threshold,
            injection_enabled=config.injection_enabled,
            max_injection_tokens=config.max_injection_tokens,
        ),
        data=MemoryResponse(**memory_data),
    )


# ── Onboarding seed ──────────────────────────────────────────────────────────


class MbtiProfile(BaseModel):
    """MBTI quiz result used to seed initial memory facts."""

    mbtiType: str = Field(..., description="Travel personality type key, e.g. 'city_drifter'")
    mbtiTitle: str = Field(default="", description="Human-readable type name")
    mbtiSubtitle: str = Field(default="", description="One-line description")
    dimensions: dict[str, int] = Field(default_factory=dict, description="Five dimension scores 0–100")
    quickPick: dict[str, str] = Field(default_factory=dict, description="departure/companion/budget/timeWindow")


class SeedResponse(BaseModel):
    seeded: bool
    facts_added: int


@router.post(
    "/memory/seed",
    response_model=SeedResponse,
    summary="Seed Memory from MBTI Profile",
    description=(
        "Write initial high-confidence facts into memory.json from the user's quiz result. "
        "Safe to call multiple times — facts whose content already exists are not re-added."
    ),
)
async def seed_memory_from_profile(profile: MbtiProfile) -> SeedResponse:
    """Initialise memory.json with facts derived from the onboarding quiz result."""
    dims = profile.dimensions
    qp = profile.quickPick
    dim_str = ", ".join(f"{k.capitalize()} {v}" for k, v in dims.items() if v is not None)

    candidates: list[dict] = []

    if profile.mbtiTitle:
        candidates.append({
            "content": (
                f"User's travel personality is '{profile.mbtiTitle}' ({profile.mbtiType}). "
                f"Subtitle: {profile.mbtiSubtitle}. "
                f"Dimension scores — {dim_str}."
            ),
            "category": "preference",
            "confidence": 1.0,
        })

    if qp.get("departure"):
        candidates.append({
            "content": f"User typically travels from {qp['departure']}.",
            "category": "context",
            "confidence": 1.0,
        })

    if qp.get("companion"):
        candidates.append({
            "content": f"User's preferred travel companion type: {qp['companion']}.",
            "category": "preference",
            "confidence": 0.9,
        })

    if qp.get("budget"):
        candidates.append({
            "content": f"User's stated travel budget: {qp['budget']}.",
            "category": "preference",
            "confidence": 0.9,
        })

    solitude = dims.get("solitude", 50)
    if solitude >= 70:
        candidates.append({
            "content": f"User strongly prefers solo travel (Solitude score {solitude}).",
            "category": "preference",
            "confidence": 0.9,
        })
    elif solitude <= 30:
        candidates.append({
            "content": f"User prefers group or social travel (Solitude score {solitude}).",
            "category": "preference",
            "confidence": 0.9,
        })

    memory = get_memory_data()
    existing_contents = {f["content"] for f in memory.get("facts", [])}
    now = datetime.utcnow().isoformat() + "Z"

    added = 0
    for fact in candidates:
        if fact["content"] in existing_contents:
            continue
        memory.setdefault("facts", []).append({
            "id": f"fact_{uuid.uuid4().hex[:8]}",
            "content": fact["content"],
            "category": fact["category"],
            "confidence": fact["confidence"],
            "createdAt": now,
            "source": "onboarding_quiz",
        })
        added += 1

    if added > 0:
        _save_memory_to_file(memory)

    return SeedResponse(seeded=added > 0, facts_added=added)
