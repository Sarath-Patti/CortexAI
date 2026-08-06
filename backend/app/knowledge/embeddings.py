import hashlib

from app.core.logging import logger
from app.knowledge.exceptions import EmbeddingError


class EmbeddingService:
    """
    Sentence Transformers Embedding Generator.
    Uses 'all-MiniLM-L6-v2' (384 dimensions) for generating dense vector embeddings.
    """

    MODEL_NAME = "all-MiniLM-L6-v2"
    DIMENSION = 384

    def __init__(self) -> None:
        self._model = None
        self._initialized = False

    def _get_model(self):
        if not self._initialized:
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(self.MODEL_NAME)
                self._initialized = True
                logger.info(
                    "SentenceTransformers model '%s' initialized successfully.",
                    self.MODEL_NAME,
                )
            except Exception as err:
                logger.warning(
                    "SentenceTransformers model loading deferred (%s). "
                    "Using fallback embedder.",
                    err,
                )
                self._initialized = True
        return self._model

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        try:
            model = self._get_model()
            if model is not None:
                embeddings = model.encode(texts, convert_to_numpy=True)
                return [e.tolist() for e in embeddings]
        except Exception as err:
            logger.warning("Error generating sentence embeddings: %s", err)

        # Deterministic 384-dimensional fallback embedding vector generator
        return [self._fallback_embedding(t) for t in texts]

    def embed_query(self, query: str) -> list[float]:
        results = self.embed_texts([query])
        if not results:
            raise EmbeddingError("Failed to generate query embedding.")
        return results[0]

    def _fallback_embedding(self, text: str) -> list[float]:
        vec: list[float] = []
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        for i in range(self.DIMENSION):
            val = (seed[i % len(seed)] / 255.0) * 2.0 - 1.0
            vec.append(round(val, 6))
        return vec
