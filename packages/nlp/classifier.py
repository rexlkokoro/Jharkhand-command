"""
DistilBERT 11-class event classifier for Jharkhand COMMAND.
Maps event text to one of: crime, politics, accident, infrastructure, protest, weather, disaster, economy, education, health, civic.
Phase 4: Fine-tune on Jharkhand-specific dataset; for now use zero-shot with heuristics.
"""

from transformers import pipeline
from typing import List, Dict, Tuple

# Lazy-load classifier to avoid heavy import at startup
_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        # DistilBERT zero-shot classification pipeline
        _classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli",
            device=-1,  # CPU
        )
    return _classifier

EVENT_CATEGORIES = [
    "crime",
    "politics",
    "accident",
    "infrastructure",
    "protest",
    "weather",
    "disaster",
    "economy",
    "education",
    "health",
    "civic",
]

def classify_event(text: str) -> Tuple[str, float]:
    """
    Classify event text into one of 11 categories.
    Returns (category, confidence).
    Falls back to keyword heuristics if model unavailable.
    """
    try:
        classifier = get_classifier()
        result = classifier(text, EVENT_CATEGORIES, multi_label=False)
        top_label = result["labels"][0]
        top_score = result["scores"][0]
        return top_label, top_score
    except Exception:
        # Fallback heuristic classifier
        return _heuristic_classify(text)

def _heuristic_classify(text: str) -> Tuple[str, float]:
    """
    Simple keyword-based fallback classification.
    """
    lowered = text.lower()
    if any(kw in lowered for kw in ["murder", "theft", "robbery", "crime", "police", "arrest"]):
        return "crime", 0.7
    if any(kw in lowered for kw in ["election", "bjp", "jmm", "minister", "government", "politics"]):
        return "politics", 0.7
    if any(kw in lowered for kw in ["accident", "crash", "collision", "injured"]):
        return "accident", 0.7
    if any(kw in lowered for kw in ["road", "bridge", "dam", "power", "water", "infrastructure"]):
        return "infrastructure", 0.7
    if any(kw in lowered for kw in ["protest", "strike", "bandh", "demonstration"]):
        return "protest", 0.7
    if any(kw in lowered for kw in ["rain", "flood", "storm", "weather", "monsoon"]):
        return "weather", 0.7
    if any(kw in lowered for kw in ["earthquake", "landslide", "disaster", "emergency"]):
        return "disaster", 0.7
    if any(kw in lowered for kw in ["economy", "market", "price", "inflation", "business"]):
        return "economy", 0.7
    if any(kw in lowered for kw in ["school", "college", "exam", "education", "student"]):
        return "education", 0.7
    if any(kw in lowered for kw in ["hospital", "health", "doctor", "medicine", "covid"]):
        return "health", 0.7
    return "civic", 0.5

# Example usage
if __name__ == "__main__":
    sample = "A mine accident in Bokaro injured three workers; rescue operations underway."
    cat, conf = classify_event(sample)
    print(f"Category: {cat}, Confidence: {conf:.2f}")
