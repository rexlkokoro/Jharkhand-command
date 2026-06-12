"""
MiniLM embeddings + pgvector deduplication for Jharkhand COMMAND.
Generates 384-dim embeddings for semantic similarity and duplicate detection.
Phase 4: Store embeddings in PostgreSQL pgvector for fast similarity search.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Optional, Tuple

# Lazy-load MiniLM model
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        # MiniLM for fast, efficient embeddings (384-dim)
        _embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _embedding_model

def generate_embedding(text: str) -> Optional[np.ndarray]:
    """
    Generate 384-dim embedding for input text using MiniLM.
    Returns numpy array or None on error.
    """
    try:
        model = get_embedding_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding
    except Exception:
        return None

def compute_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    Compute cosine similarity between two embeddings.
    Returns float between -1 and 1 (usually 0 to 1 for normalized embeddings).
    """
    try:
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    except Exception:
        return 0.0

def find_duplicates(
    embeddings: List[np.ndarray],
    threshold: float = 0.95,
    texts: Optional[List[str]] = None,
) -> List[Tuple[int, int]]:
    """
    Find duplicate pairs based on embedding similarity.
    Returns list of index pairs (i, j) where i < j and similarity >= threshold.
    """
    duplicates = []
    n = len(embeddings)
    for i in range(n):
        for j in range(i + 1, n):
            if embeddings[i] is None or embeddings[j] is None:
                continue
            sim = compute_similarity(embeddings[i], embeddings[j])
            if sim >= threshold:
                duplicates.append((i, j))
                if texts:
                    print(f"Duplicate found: {texts[i][:50]}... == {texts[j][:50]}... (sim={sim:.3f})")
    return duplicates

def cluster_embeddings(
    embeddings: List[np.ndarray],
    threshold: float = 0.85,
) -> List[List[int]]:
    """
    Simple clustering based on similarity threshold.
    Returns list of clusters, each a list of indices.
    """
    n = len(embeddings)
    visited = [False] * n
    clusters = []

    def dfs(i: int, cluster: List[int]):
        visited[i] = True
        cluster.append(i)
        for j in range(n):
            if not visited[j] and embeddings[i] is not None and embeddings[j] is not None:
                sim = compute_similarity(embeddings[i], embeddings[j])
                if sim >= threshold:
                    dfs(j, cluster)

    for i in range(n):
        if not visited[i]:
            cluster = []
            dfs(i, cluster)
            if len(cluster) > 1:
                clusters.append(cluster)

    return clusters

# Example usage
if __name__ == "__main__":
    texts = [
        "Mine accident in Bokaro injures three workers.",
        "Three workers injured in Bokaro mine accident.",
        "Protest in Ranchi over new mining policy.",
        "Ranchi residents protest mining policy changes.",
        "Flood warning issued for Simdega district.",
    ]
    embeddings = [generate_embedding(t) for t in texts]
    print("Duplicates:", find_duplicates(embeddings, texts=texts))
    print("Clusters:", cluster_embeddings(embeddings))
