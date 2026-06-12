"""
spaCy NER pipeline for Jharkhand COMMAND.
Extracts PERSON, LOCATION, ORGANIZATION, DATE, EVENT entities from event text.
Phase 4: Custom Jharkhand entity rules + multilingual support.
"""

import spacy
from spacy.pipeline import EntityRuler
from typing import List, Dict, Any

# Load English model; fallback to blank if not available
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = spacy.blank("en")

# Jharkhand-specific entity patterns
JHARKHAND_PATTERNS = [
    # Locations: districts, cities, landmarks
    {"label": "LOCATION", "pattern": [{"LOWER": "ranchi"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "jamshedpur"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "dhanbad"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "bokaro"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "hazaribagh"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "deoghar"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "giridih"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "dumka"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "chaibasa"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "palamu"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "garhwa"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "lohardaga"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "simdega"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "chatra"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "koderma"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "ramgarh"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "khunti"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "saraikela"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "godda"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "sahebganj"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "pakur"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "jamtara"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "latehar"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "gumla"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "jharkhand"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "chotanagpur"}]},
    {"label": "LOCATION", "pattern": [{"LOWER": "santhal"}, {"LOWER": "pargana"}]},
    # Organizations: govt bodies, companies, institutions
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "jmm"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "bjp"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "ajsu"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "jvm"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "tata"}, {"LOWER": "steel"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "ccl"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "bccl"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "ncl"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "ndma"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "state"}, {"LOWER": "disaster"}, {"LOWER": "management"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "jharkhand"}, {"LOWER": "police"}]},
    {"label": "ORGANIZATION", "pattern": [{"LOWER": "railways"}]},
    # Persons: political leaders, officials
    {"label": "PERSON", "pattern": [{"LOWER": "hemant"}, {"LOWER": "soren"}]},
    {"label": "PERSON", "pattern": [{"LOWER": "babulal"}, {"LOWER": "marandi"}]},
    {"label": "PERSON", "pattern": [{"LOWER": "arjun"}, {"LOWER": "munda"}]},
    {"label": "PERSON", "pattern": [{"LOWER": "raghubar"}, {"LOWER": "das"}]},
    {"label": "PERSON", "pattern": [{"LOWER": "shibu"}, {"LOWER": "soren"}]},
    {"label": "PERSON", "pattern": [{"LOWER": "champai"}, {"LOWER": "soren"}]},
    # Events: common incident types
    {"label": "EVENT", "pattern": [{"LOWER": "naxal"}, {"LOWER": "attack"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "mine"}, {"LOWER": "accident"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "road"}, {"LOWER": "accident"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "protest"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "bandh"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "strike"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "flood"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "landslide"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "earthquake"}]},
    {"label": "EVENT", "pattern": [{"LOWER": "covid"}]},
    # Dates: common patterns
    {"label": "DATE", "pattern": [{"LOWER": "today"}]},
    {"label": "DATE", "pattern": [{"LOWER": "yesterday"}]},
    {"label": "DATE", "pattern": [{"LOWER": "tomorrow"}]},
    {"label": "DATE", "pattern": [{"LOWER": "last"}, {"LOWER": "week"}]},
    {"label": "DATE", "pattern": [{"LOWER": "this"}, {"LOWER": "month"}]},
]

# Add EntityRuler with Jharkhand patterns
if "entity_ruler" not in nlp.pipe_names:
    ruler = nlp.add_pipe("entity_ruler", before="ner")
    ruler.add_patterns(JHARKHAND_PATTERNS)

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract entities from text using spaCy NER + custom Jharkhand patterns.
    Returns list of dicts with label, text, start, end, confidence.
    """
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "label": ent.label_,
            "text": ent.text,
            "start": ent.start_char,
            "end": ent.end_char,
            "confidence": 0.8 if ent.label_ in {"PERSON", "LOCATION", "ORGANIZATION"} else 0.6,
        })
    return entities

# Example usage
if __name__ == "__main__":
    sample = "Hemant Soren visited Ranchi after a mine accident in Bokaro. JMM leaders protested the incident."
    for e in extract_entities(sample):
        print(e)
