from __future__ import annotations

from supabase import create_client, Client
from utils.settings import settings

def get_supabase_client() -> Client | None:
    if not settings.supabase_url or not settings.supabase_key:
        return None
    try:
        return create_client(settings.supabase_url, settings.supabase_key)
    except Exception:
        return None
