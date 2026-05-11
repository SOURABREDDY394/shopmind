from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from utils.supabase_client import get_supabase_client

router = APIRouter(prefix="/inventory", tags=["Inventory"])

class InventoryItem(BaseModel):
    id: Optional[int] = None
    name: str
    quantity: int
    description: Optional[str] = None
    created_at: Optional[datetime] = None

class InventoryCreate(BaseModel):
    name: str
    quantity: int
    description: Optional[str] = None

@router.post("/add", response_model=InventoryItem)
async def add_item(item: InventoryCreate):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    data, count = supabase.table("inventory").insert({
        "name": item.name,
        "quantity": item.quantity,
        "description": item.description
    }).execute()
    
    if not data[1]:
        raise HTTPException(status_code=400, detail="Failed to add item to inventory")
    
    return data[1][0]

@router.get("/list", response_model=List[InventoryItem])
async def list_items():
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    data, count = supabase.table("inventory").select("*").execute()
    
    if not data[1]:
        return []
    
    return data[1]
