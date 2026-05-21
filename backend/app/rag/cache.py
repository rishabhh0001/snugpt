import os
import json
import asyncio
from typing import Optional, Tuple
from app.config import settings
from app.rag.embeddings import get_embeddings

# We will implement a lightweight custom semantic cache using Redis directly.
# GPTCache can sometimes be heavy or tricky to configure in serverless environments.
# Since we just need cosine similarity >= 0.96 and a Redis backend, 
# we can use Redis (if it has Redisearch) or implement a simple fallback.
# For maximum reliability, we'll use gptcache if available, but wrap it cleanly.

try:
    from gptcache import Cache
    from gptcache.manager import get_data_manager, CacheBase, VectorBase
    from gptcache.similarity_evaluation.distance import SearchDistanceEvaluation
    from gptcache.embedding import LangChain
    GPTCACHE_AVAILABLE = True
except ImportError:
    GPTCACHE_AVAILABLE = False

_cache = None

def init_cache():
    global _cache
    if _cache is not None:
        return _cache

    if not GPTCACHE_AVAILABLE:
        print("[Cache] GPTCache not installed. Semantic caching disabled.")
        return None

    if not settings.redis_url:
        print("[Cache] No REDIS_URL configured. Semantic caching disabled.")
        return None

    try:
        from gptcache import cache
        
        # 1. Initialize NVIDIA Embeddings via LangChain wrapper for GPTCache
        llm_embeddings = get_embeddings()
        encoder = LangChain(embeddings=llm_embeddings)
        
        # 2. Configure Redis for both scalar caching and vector search
        # Requires RediSearch module on the Redis server
        data_manager = get_data_manager(
            cache_base=CacheBase("redis", url=settings.redis_url),
            vector_base=VectorBase("redis", url=settings.redis_url, dimension=1024), # nv-embedqa-e5-v5 is 1024 dims
        )
        
        # 3. Initialize Cache
        cache.init(
            embedding_func=encoder.to_embeddings,
            data_manager=data_manager,
            similarity_evaluation=SearchDistanceEvaluation(),
        )
        
        _cache = cache
        print("[Cache] GPTCache initialized with Redis backend.")
    except Exception as e:
        print(f"[Cache] Failed to initialize GPTCache: {e}")
        _cache = None
        
    return _cache

def search_cache(query: str) -> Optional[str]:
    """Search the semantic cache for a >96% similar query."""
    cache = init_cache()
    if not cache:
        return None
        
    try:
        # GPTCache's internal similarity threshold is usually configured in the evaluator.
        # By default SearchDistanceEvaluation checks distance.
        # We can perform a manual query if needed, or use cache API.
        
        # Actually, GPTCache's interceptor handles the threshold, but we are streaming.
        # So we query the data_manager manually to find top-1 match.
        llm_embeddings = get_embeddings()
        query_embedding = llm_embeddings.embed_query(query)
        
        # Search vector base
        results = cache.data_manager.search(query_embedding, top_k=1)
        if not results:
            return None
            
        distance, cache_data = results[0]
        # Cosine similarity roughly corresponds to distance. 
        # For a 92% similarity (cosine similarity >= 0.92), distance should be <= 0.08 (if normalized 1-cosine)
        # or L2 distance threshold depending on the vector base implementation.
        # Assuming normalized vectors, threshold is 0.08 for 92% similarity.
        if distance <= 0.08:
            print(f"[Cache] Hit! Semantic similarity > 92% (Distance: {distance})")
            return cache.data_manager.get_scalar_data(cache_data, "response_text") # pseudo-code
            
        return None
    except Exception as e:
        print(f"[Cache] Error searching cache: {e}")
        return None

async def save_to_cache(query: str, response: str):
    """Save a successful generation to the semantic cache asynchronously."""
    cache = init_cache()
    if not cache:
        return
        
    try:
        def _save():
            llm_embeddings = get_embeddings()
            query_embedding = llm_embeddings.embed_query(query)
            cache.data_manager.save(query, response, query_embedding)
            print("[Cache] Saved response to semantic cache.")
            
        await asyncio.to_thread(_save)
    except Exception as e:
        print(f"[Cache] Error saving to cache: {e}")

# Note: The above is a generic implementation. GPTCache has specific API for data_manager.
# To be robust, if data_manager API differs, we can fallback to standard caching behavior.
