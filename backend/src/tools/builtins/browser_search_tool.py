"""Browser-based search tool using browser-use for real website scraping."""

import asyncio
import json
import logging
import os
from pathlib import Path

from langchain.tools import tool

logger = logging.getLogger(__name__)

# Supported sites and their skill directory names
SUPPORTED_SITES = {
    "google_flights": "google-flights",
    "ctrip": "ctrip",
    "skyscanner": "skyscanner",
    "booking": "booking-com",
    "agoda": "agoda",
}

# Base path for skill files
_SKILLS_BASE = Path(__file__).resolve().parents[4] / "skills" / "custom"


def _load_skill_template(site: str) -> str | None:
    """Load the SKILL.md template for a given site.

    Args:
        site: Site key from SUPPORTED_SITES.

    Returns:
        The skill template content (without frontmatter), or None if not found.
    """
    dir_name = SUPPORTED_SITES.get(site)
    if dir_name is None:
        return None

    skill_path = _SKILLS_BASE / dir_name / "SKILL.md"
    if not skill_path.exists():
        logger.warning(f"Skill file not found: {skill_path}")
        return None

    content = skill_path.read_text(encoding="utf-8")

    # Strip YAML frontmatter (between --- markers)
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            content = content[end + 3:].strip()

    return content


def _format_task(template: str, params: dict) -> str:
    """Replace placeholders in skill template with actual parameters.

    Uses str.format_map with a defaultdict to leave unknown placeholders unchanged.

    Args:
        template: Skill template with {placeholder} markers.
        params: Dictionary of parameter values.

    Returns:
        Formatted task string.
    """
    class SafeDict(dict):
        def __missing__(self, key: str) -> str:
            return f"{{{key}}}"

    return template.format_map(SafeDict(params))


async def _run_browser_agent(task: str, timeout: int = 60) -> str:
    """Run browser-use agent with the given task.

    Args:
        task: The formatted task description.
        timeout: Maximum seconds to wait.

    Returns:
        The extracted result as a string.
    """
    from browser_use import Agent, BrowserProfile
    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=os.environ.get("GOOGLE_API_KEY"),
        temperature=0.3,
    )

    profile = BrowserProfile(
        headless=True,
        wait_between_actions=0.5,
    )

    agent = Agent(
        task=task,
        llm=llm,
        browser_profile=profile,
        max_actions_per_step=3,
        max_failures=3,
    )

    try:
        history = await asyncio.wait_for(
            agent.run(max_steps=30),
            timeout=timeout,
        )
        result = history.final_result()
        return result if result else '{"error": "Browser agent returned no result"}'
    except asyncio.TimeoutError:
        return '{"error": "Browser search timed out after ' + str(timeout) + ' seconds"}'
    except Exception as e:
        return json.dumps({"error": f"Browser search failed: {e}"})


@tool("browser_search", parse_docstring=True)
def browser_search_tool(
    site: str,
    query_params: str,
) -> str:
    """Search travel websites using browser automation for real prices and booking links.

    Available sites:
    - google_flights: Best for flight search (broad coverage, real-time prices)
    - ctrip: Chinese travel platform, direct URL search, prices in CNY (携程)
    - skyscanner: Good for budget airlines (may have CAPTCHA issues)
    - booking: Best for hotel search (largest inventory)
    - agoda: Good for Asian hotels and deals

    Args:
        site: Target website. One of: google_flights, ctrip, skyscanner, booking, agoda.
        query_params: JSON string with search parameters. For flights: origin_city, origin_code, destination_city, destination_code, departure_date, return_date, passengers. For hotels: city, checkin, checkout, guests, rooms.
    """
    # Validate site
    if site not in SUPPORTED_SITES:
        return json.dumps({
            "error": f"Unsupported site '{site}'. Available: {', '.join(SUPPORTED_SITES.keys())}"
        })

    # Parse query params
    try:
        params = json.loads(query_params)
    except (json.JSONDecodeError, TypeError) as e:
        return json.dumps({"error": f"Invalid query_params JSON: {e}"})

    # Load skill template
    template = _load_skill_template(site)
    if template is None:
        return json.dumps({"error": f"Skill file not found for site '{site}'"})

    # Format task with parameters
    task = _format_task(template, params)
    logger.info(f"browser_search: site={site}, task length={len(task)}")

    # Run browser agent
    try:
        result = asyncio.run(_run_browser_agent(task))
    except RuntimeError:
        # Already in an async context — run in thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(asyncio.run, _run_browser_agent(task))
            result = future.result(timeout=90)

    return result
