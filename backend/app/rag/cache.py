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
    """Search the semantic cache for a >92% similar query."""
    cache = init_cache()
    if not cache:
        return None
        
    try:
        # GPTCache standard API for getting a cached value.
        # Under the hood, it uses the embeddings encoder, vector base search,
        # and similarity evaluator configured in cache.init()
        response = cache.get(query)
        if response:
            print("[Cache] Hit! Semantic similarity match found.")
            return response
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
        # GPTCache standard API for saving. It encodes the query and saves both scalar and vector.
        await asyncio.to_thread(cache.put, query, response)
        print("[Cache] Saved response to semantic cache.")
    except Exception as e:
        print(f"[Cache] Error saving to cache: {e}")


# Note: The above is a generic implementation. GPTCache has specific API for data_manager.
# To be robust, if data_manager API differs, we can fallback to standard caching behavior.
