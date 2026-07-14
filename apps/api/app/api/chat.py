from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chat_service import chat_service

router = APIRouter()

class ChatPayload(BaseModel):
    message: str

@router.post("/")
async def chat_assistant(payload: ChatPayload):
    """Executes a query on the Ops Chat Assistant with active context."""
    try:
        reply = await chat_service.query_assistant(payload.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
