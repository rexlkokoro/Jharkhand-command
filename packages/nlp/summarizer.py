"""
BART/mBART summarization for Jharkhand COMMAND.
Generates concise summaries of event articles.
Phase 4: Use mBART for multilingual (English/Hindi) support.
"""

from transformers import pipeline
from typing import Optional

# Lazy-load summarizer
_summarizer = None

def get_summarizer():
    global _summarizer
    if _summarizer is None:
        # Use mBART for multilingual support (English + Hindi)
        _summarizer = pipeline(
            "summarization",
            model="facebook/mbart-large-50-many-to-many-mmt",
            device=-1,  # CPU
        )
    return _summarizer

def summarize_text(text: str, max_length: int = 60, min_length: int = 20) -> Optional[str]:
    """
    Summarize event text using mBART.
    Returns summary string or None on error.
    """
    try:
        summarizer = get_summarizer()
        # Truncate input if too long (model limit ~1024 tokens)
        if len(text) > 1024:
            text = text[:1024]
        result = summarizer(
            text,
            max_length=max_length,
            min_length=min_length,
            do_sample=False,
        )
        return result[0]["summary_text"]
    except Exception:
        # Fallback: return first sentence or truncated text
        sentences = text.split(". ")
        if sentences:
            return sentences[0][:200] + ("..." if len(sentences[0]) > 200 else "")
        return text[:200] + ("..." if len(text) > 200 else "")

# Example usage
if __name__ == "__main__":
    article = (
        "A major mine accident occurred at the BCCL coal mine in Dhanbad district late Tuesday night. "
        "At least five workers were trapped inside when a portion of the mine collapsed. "
        "Rescue teams have been rushed to the spot and operations are underway to save the trapped workers. "
        "The incident has sparked protests by local residents demanding better safety measures."
    )
    print("Summary:", summarize_text(article))
