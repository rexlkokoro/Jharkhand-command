"""
Confidence scoring ensemble for Jharkhand COMMAND.
Combines outputs from NER, classifier, sentiment, summarizer, and embeddings
to produce an overall confidence score for each event.
"""

from typing import Dict, List, Any, Optional
import numpy as np

from .ner import extract_entities
from .classifier import classify_event
from .sentiment import analyze_sentiment
from .embeddings import generate_embedding

def compute_confidence(event: Dict[str, Any]) -> float:
    """
    Compute overall confidence score (0.0 to 1.0) for an event.
    Factors:
    - Category classification confidence
    - Sentiment confidence (absolute value)
    - Entity count and diversity
    - Embedding quality (non-null)
    - Source reliability (placeholder)
    """
    text = event.get("title", "") + " " + (event.get("summary") or "")
    if not text.strip():
        return 0.0

    scores = []

    # 1) Category classification confidence
    _, cat_conf = classify_event(text)
    scores.append(cat_conf)

    # 2) Sentiment confidence (absolute compound score)
    sent_compound, _ = analyze_sentiment(text)
    scores.append(abs(sent_compound))

    # 3) Entity extraction quality
    entities = extract_entities(text)
    entity_score = min(len(entities) / 5.0, 1.0)  # Cap at 1.0, expect ~5 entities per event
    # Bonus for diverse entity types
    types = set(e["label"] for e in entities)
    diversity_bonus = min(len(types) / 4.0, 0.2)
    scores.append(entity_score + diversity_bonus)

    # 4) Embedding existence (indicates clean text)
    embedding = generate_embedding(text)
    scores.append(1.0 if embedding is not None else 0.0)

    # 5) Source reliability (placeholder: known sources get bonus)
    source = event.get("source_name", "").lower()
    source_bonus = 0.0
    if any(s in source for s in ["prabhatkhabar", "jagran", "times", "hindustan"]):
        source_bonus = 0.1
    elif any(s in source for s in ["twitter", "facebook", "social"]):
        source_bonus = -0.1
    scores.append(max(0.0, 0.5 + source_bonus))  # Normalize to 0-1

    # Ensemble: weighted average
    weights = [0.3, 0.2, 0.25, 0.15, 0.1]
    weighted_sum = sum(w * s for w, s in zip(weights, scores))
    confidence = min(max(weighted_sum, 0.0), 1.0)

    return confidence

def enrich_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich an event dict with all NLP outputs and confidence score.
    Returns enriched event (does not modify original).
    """
    text = event.get("title", "") + " " + (event.get("summary") or "")
    enriched = event.copy()

    # NER
    enriched["entities"] = extract_entities(text)

    # Classification
    category, cat_conf = classify_event(text)
    enriched["category"] = category
    enriched["category_confidence"] = cat_conf

    # Sentiment
    sent_score, sent_label = analyze_sentiment(text)
    enriched["sentiment"] = sent_score
    enriched["sentiment_label"] = sent_label

    # Embedding
    embedding = generate_embedding(text)
    enriched["embedding"] = embedding.tolist() if embedding is not None else None

    # Overall confidence
    enriched["confidence"] = compute_confidence(enriched)

    return enriched

# Example usage
if __name__ == "__main__":
    sample_event = {
        "title": "Mine accident in Bokaro injures three workers",
        "summary": "A roof collapse at a BCCL mine in Bokaro injured three workers. Rescue operations are ongoing.",
        "source_name": "Prabhat Khabar",
    }
    enriched = enrich_event(sample_event)
    print(f"Category: {enriched['category']} (conf={enriched['category_confidence']:.2f})")
    print(f"Sentiment: {enriched['sentiment_label']} ({enriched['sentiment']:.2f})")
    print(f"Entities: {[e['text'] for e in enriched['entities']]}")
    print(f"Overall confidence: {enriched['confidence']:.2f}")
