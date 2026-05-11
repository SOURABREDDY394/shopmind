from __future__ import annotations
import os
from langchain_openai import ChatOpenAI
from utils.settings import settings

def get_openrouter_api_key() -> str:
    api_key = settings.openrouter_api_key or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not configured")
    return api_key

def get_chat_llm(temperature: float = 0.3, model: str | None = None) -> ChatOpenAI:
    return ChatOpenAI(
        model=model or settings.openrouter_model,
        temperature=temperature,
        api_key=get_openrouter_api_key(),
        base_url=settings.openrouter_base_url,
    )
