"""Peak / off-peak / shoulder season lookup for common travel destinations.

Season scoring for the trigger model:
  off_peak   → best time to go (lower prices, fewer crowds) → score 2
  shoulder   → decent time                                  → score 1
  peak       → popular but expensive / crowded              → score 0

A destination is considered "season-matched" if score >= 1.
"""

from datetime import date

# {keyword_lowercase: {peak: [months], off_peak: [months]}}
# Months not listed are shoulder season.
SEASON_MAP: dict[str, dict[str, list[int]]] = {
    "bangkok":   {"peak": [11,12,1,2],    "off_peak": [5,6,7,8,9]},
    "bkk":       {"peak": [11,12,1,2],    "off_peak": [5,6,7,8,9]},
    "phuket":    {"peak": [11,12,1,2],    "off_peak": [5,6,7,8,9]},
    "chiang mai":{"peak": [11,12,1,2],    "off_peak": [5,6,7,8,9]},
    "tokyo":     {"peak": [3,4,10,11],    "off_peak": [1,2,7,8]},
    "osaka":     {"peak": [3,4,10,11],    "off_peak": [1,2,7,8]},
    "kyoto":     {"peak": [3,4,10,11],    "off_peak": [1,2,7,8]},
    "japan":     {"peak": [3,4,10,11],    "off_peak": [1,2,7,8]},
    "nrt":       {"peak": [3,4,10,11],    "off_peak": [1,2,7,8]},
    "bali":      {"peak": [7,8,12,1],     "off_peak": [2,3,4,5]},
    "dps":       {"peak": [7,8,12,1],     "off_peak": [2,3,4,5]},
    "london":    {"peak": [6,7,8],        "off_peak": [11,12,1,2,3]},
    "lhr":       {"peak": [6,7,8],        "off_peak": [11,12,1,2,3]},
    "paris":     {"peak": [6,7,8],        "off_peak": [11,12,1,2,3]},
    "cdg":       {"peak": [6,7,8],        "off_peak": [11,12,1,2,3]},
    "seoul":     {"peak": [4,5,9,10],     "off_peak": [1,2,7,8]},
    "icn":       {"peak": [4,5,9,10],     "off_peak": [1,2,7,8]},
    "dubai":     {"peak": [11,12,1,2,3],  "off_peak": [6,7,8,9]},
    "dxb":       {"peak": [11,12,1,2,3],  "off_peak": [6,7,8,9]},
    "new york":  {"peak": [6,7,8,12],     "off_peak": [1,2,3]},
    "jfk":       {"peak": [6,7,8,12],     "off_peak": [1,2,3]},
    "sydney":    {"peak": [12,1,2],       "off_peak": [6,7,8]},
    "syd":       {"peak": [12,1,2],       "off_peak": [6,7,8]},
    "singapore": {"peak": [12,6,7],       "off_peak": []},  # year-round, slight dip in rainy months
    "sin":       {"peak": [12,6,7],       "off_peak": []},
    "vietnam":   {"peak": [11,12,1,2,3],  "off_peak": [9,10]},
    "hanoi":     {"peak": [10,11,12,3,4], "off_peak": [6,7,8]},
    "ho chi minh":{"peak":[11,12,1,2,3],  "off_peak": [9,10]},
    "taipei":    {"peak": [10,11,12,1,2,3],"off_peak": [7,8]},
    "tpe":       {"peak": [10,11,12,1,2,3],"off_peak": [7,8]},
}


def get_season_score(destination: str, travel_date: date) -> int:
    """Return season score for a destination on a given date.

    Returns 2 (off-peak), 1 (shoulder), or 0 (peak).
    Unknown destinations return 1 (neutral / shoulder).
    """
    dest_lower = destination.lower()
    month = travel_date.month

    # Find matching key
    matched = None
    for key in SEASON_MAP:
        if key in dest_lower:
            matched = SEASON_MAP[key]
            break

    if matched is None:
        return 1  # unknown → neutral

    if month in matched["off_peak"]:
        return 2
    if month in matched["peak"]:
        return 0
    return 1  # shoulder


def is_season_match(destination: str, travel_date: date) -> bool:
    """Return True if the travel date is shoulder or off-peak season."""
    return get_season_score(destination, travel_date) >= 1
