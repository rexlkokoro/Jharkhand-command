"""
Sentiment analysis for Jharkhand COMMAND.
Combines VADER (English) and multilingual BERT for English/Hindi sentiment.
Returns compound score -1 (negative) to +1 (positive).
"""

from vaderSentiment.vader import SentimentIntensityAnalyzer
from transformers import pipeline
from typing import Tuple

# Initialize VADER
vader_analyzer = SentimentIntensityAnalyzer()

# Lazy-load multilingual BERT sentiment
_multilingual_sentiment = None

def get_multilingual_sentiment():
    global _multilingual_sentiment
    if _multilingual_sentiment is None:
        _multilingual_sentiment = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            device=-1,  # CPU
        )
    return _multilingual_sentiment

def analyze_sentiment(text: str, language: str = "en") -> Tuple[float, str]:
    """
    Analyze sentiment of text.
    Returns (compound_score, label) where label is 'positive', 'neutral', or 'negative'.
    Uses VADER for English, multilingual BERT for Hindi/others.
    """
    if language == "en" or _is_english(text):
        # Use VADER for English
        scores = vader_analyzer.polarity_scores(text)
        compound = scores["compound"]
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"
        return compound, label
    else:
        # Use multilingual BERT for non-English
        try:
            classifier = get_multilingual_sentiment()
            result = classifier(text[:512])  # Truncate to avoid length issues
            label = result[0]["label"].lower()
            score = result[0]["score"]
            # Map labels to compound-like score
            if "positive" in label:
                compound = score
            elif "negative" in label:
                compound = -score
            else:
                compound = 0.0
                label = "neutral"
            return compound, label
        except Exception:
            # Fallback: neutral
            return 0.0, "neutral"

def _is_english(text: str) -> bool:
    """
    Simple heuristic to detect if text is primarily English.
    """
    try:
        text.encode(encoding="utf-8").decode("ascii")
    except UnicodeDecodeError:
        return False
    return True

# Example usage
if __name__ == "__main__":
    samples = [
        "Five workers injured in mine accident, rescue operations ongoing.",
        "हादसे में पांच श्रमिक घायल, बचाव कार्य जारी।",
        "Government announces new development projects for Ranchi.",
    ]
    for s in samples:
        score, label = analyze_sentiment(s)
        print(f"Text: {s[:50]}...")
        print(f"Sentiment: {label} ({score:.3f})\n")
