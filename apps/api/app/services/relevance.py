"""
Jharkhand relevance filter.
Uses a simple keyword + district list to decide if an article is likely about Jharkhand.
Phase 4 will upgrade to ML classifier.
"""

JHARKHAND_KEYWORDS = [
    "jharkhand", "ranchi", "jamshedpur", "dhanbad", "bokaro", "hazaribagh",
    "deoghar", "giridih", "dumka", "chaibasa", "palamu", "garhwa",
    "lohardaga", "simdega", "chatra", "koderma", "ramgarh", "khunti",
    "saraikela", "godda", "sahebganj", "pakur", "jamtara", "latehar", "gumla",
    "jmm", "bjp", "ajsu", "jvm", "hemant soren", "babulal marandi", "arjun munda",
    "coal", "mine", "ncl", "bccl", "ccl", "tisco", "tata", "steel",
    "damodar", "subarnarekha", "swarnarekha", "koel", "barakar",
    "tribal", "tribe", "adivasi", "santhal", "munda", "ho", "kharia",
    "jungle", "forest", "naxal", "maoist", "extremism",
    "chotanagpur", "santhal pargana",
]

EXCLUDE_KEYWORDS = [
    "bihar", "west bengal", "odisha", "chhattisgarh", "uttar pradesh",
    "delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad",
    "india vs", "cricket", "ipl", "election 2024", "national", "international",
]

def is_jharkhand_relevant(text: str) -> bool:
    """
    Returns True if the text is likely about Jharkhand.
    Simple keyword-based heuristic.
    """
    lowered = text.lower()

    # Quick reject if any exclude keyword appears
    for kw in EXCLUDE_KEYWORDS:
        if kw in lowered:
            return False

    # Accept if any Jharkhand keyword appears
    for kw in JHARKHAND_KEYWORDS:
        if kw in lowered:
            return True

    return False
