import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.broadcaster import broadcaster

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: str):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


manager = ConnectionManager()


@router.websocket("/feed/live")
async def websocket_feed(ws: WebSocket):
    await manager.connect(ws)
    try:
        async for event_json in broadcaster.subscribe():
            await ws.send_text(event_json)
    except WebSocketDisconnect:
        manager.disconnect(ws)
