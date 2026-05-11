from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from utils.supabase_client import get_supabase_client

router = APIRouter(prefix="/sales", tags=["Sales"])


class SaleRecord(BaseModel):
    item_id: str = Field(..., description="Unique identifier of the item sold")
    quantity: int = Field(..., gt=0, description="Quantity of items sold")
    amount: float = Field(..., gt=0, description="Total amount of the sale")
    customer_id: Optional[str] = Field(None, description="Optional customer identifier")
    timestamp: Optional[datetime] = Field(
        default_factory=datetime.utcnow, 
        description="Timestamp of the sale. Defaults to current UTC time."
    )


class SaleResponse(BaseModel):
    status: str = Field(..., example="success")
    sale_id: str = Field(..., description="The ID of the recorded sale")


class RevenuePoint(BaseModel):
    period: str = Field(..., description="The time period (e.g., '2024-05-01')")
    revenue: float = Field(..., description="Total revenue for this period")


class AnalyticsResponse(BaseModel):
    timeframe: str = Field(..., example="daily")
    total_revenue: float = Field(..., description="Sum of revenue over the entire timeframe")
    revenue_breakdown: List[RevenuePoint] = Field(..., description="Breakdown of revenue by period")


@router.post("/record", response_model=SaleResponse)
async def record_sale(sale: SaleRecord):
    """
    Records a new sale in the Supabase database.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(
            status_code=500, 
            detail="Supabase client is not configured. Check environment variables."
        )

    # Prepare data for insertion
    sale_data = sale.model_dump()
    if sale_data["timestamp"]:
        sale_data["timestamp"] = sale_data["timestamp"].isoformat()

    try:
        result = supabase.table("sales").insert(sale_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to record sale in database")
            
        return SaleResponse(
            status="success", 
            sale_id=str(result.data[0].get("id", "unknown"))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_sales_analytics(
    timeframe: str = Query("daily", enum=["daily", "weekly", "monthly"])
):
    """
    Returns revenue breakdown based on the specified timeframe.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    now = datetime.utcnow()
    
    # Define query range and grouping format
    if timeframe == "daily":
        start_date = now - timedelta(days=30)
        group_format = "%Y-%m-%d"
    elif timeframe == "weekly":
        start_date = now - timedelta(weeks=12)
        group_format = "%Y-W%W"
    else:  # monthly
        start_date = now - timedelta(days=365)
        group_format = "%Y-%m"

    try:
        # Fetch sales within the timeframe
        result = supabase.table("sales") \
            .select("amount, timestamp") \
            .gte("timestamp", start_date.isoformat()) \
            .execute()

        if not result.data:
            return AnalyticsResponse(
                timeframe=timeframe,
                total_revenue=0.0,
                revenue_breakdown=[]
            )

        # Aggregate revenue in Python
        breakdown_dict: Dict[str, float] = {}
        total_sum = 0.0

        for record in result.data:
            # Parse timestamp and amount
            ts_str = record.get("timestamp")
            amount = float(record.get("amount", 0))
            
            if ts_str:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                period_key = dt.strftime(group_format)
                
                breakdown_dict[period_key] = breakdown_dict.get(period_key, 0.0) + amount
                total_sum += amount

        # Convert to list of RevenuePoint and sort by period
        sorted_periods = sorted(breakdown_dict.keys())
        formatted_breakdown = [
            RevenuePoint(period=p, revenue=breakdown_dict[p]) 
            for p in sorted_periods
        ]

        return AnalyticsResponse(
            timeframe=timeframe,
            total_revenue=total_sum,
            revenue_breakdown=formatted_breakdown
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")
