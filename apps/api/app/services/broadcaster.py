import asyncio
import json
import os
from typing import AsyncGenerator

import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CHANNEL = "jhcmd:events"


class Broadcaster:
    def __init__(self):
        self._redis: aioredis.Redis | None = None
        self._pubsub = None

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(REDIS_URL, decode_responses=True)
        return self._redis

    async def publish(self, event_dict: dict) -> None:
        r = await self._get_redis()
        await r.publish(CHANNEL, json.dumps(event_dict))

    async def subscribe(self) -> AsyncGenerator[str, None]:
        r = await self._get_redis()
        pubsub = r.pubsub()
        await pubsub.subscribe(CHANNEL)
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    yield message["data"]
        finally:
            await pubsub.unsubscribe(CHANNEL)
            await pubsub.close()


broadcaster = Broadcaster()
