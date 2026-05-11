from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ValidationError
from langchain_core.messages import HumanMessage, SystemMessage
from utils.llm import get_chat_llm

class PriceAdvisorRequest(BaseModel):
    product_name: str = Field(..., min_length=2, description="Name of the product")
    product_description: str = Field(..., min_length=10, description="Detailed description of the product")
    target_audience: str = Field(..., min_length=2, description="Target customer segment")
    competitors: Optional[List[str]] = Field(default=[], description="List of competitors and their pricing if known")
    demand_level: str = Field(..., description="Current market demand level (Low, Medium, High)")

class PricePoint(BaseModel):
    price: float
    currency: str
    label: str = Field(..., description="Label for this price point (e.g., Basic, Pro, Enterprise)")

class PriceAdvisorResponse(BaseModel):
    suggested_pricing: List[PricePoint] = Field(..., min_length=1)
    optimal_price: float
    currency: str
    strategy: str = Field(..., description="Recommended pricing strategy (e.g., Value-based)")
    reasoning: str = Field(..., description="Detailed explanation for the recommended pricing")
    demand_analysis: str = Field(..., description="How current demand influenced this recommendation")

class PriceAdvisor:
    def __init__(self, model: str = "google/gemini-pro-latest") -> None:
        try:
            self.llm = get_chat_llm(temperature=0.3, model=model).with_structured_output(
                PriceAdvisorResponse,
                method="json_mode",
            )
        except Exception as e:
            raise ValueError(f"Failed to initialize LLM: {str(e)}")

    async def suggest_pricing(self, request: PriceAdvisorRequest) -> PriceAdvisorResponse:
        prompt = """
        You are an expert Strategic Pricing Advisor for startups.
        Your goal is to suggest the most optimal pricing strategy and specific price points based on product details, target audience, competition, and market demand.
        
        Analyze the following:
        - Value Proposition: Determine the perceived value based on the description.
        - Competitive Landscape: How to position against the listed competitors.
        - Demand Elasticity: Adjust pricing based on the current demand level (Low, Medium, High).
        - Pricing Model: Suggest whether it should be tiered, subscription-based, or one-time.

        Requirements:
        - Return at least 3 suggested price points (e.g., Basic, Pro, Enterprise).
        - Identify one 'Optimal Price' as the primary recommendation.
        - Provide a clear 'strategy' name.
        - Explain the 'reasoning' and 'demand_analysis' thoroughly.
        
        Return strict JSON only.
        """

        user_context = (
            f"Product: {request.product_name}\n"
            f"Description: {request.product_description}\n"
            f"Target Audience: {request.target_audience}\n"
            f"Competitors: {', '.join(request.competitors) if request.competitors else 'None listed'}\n"
            f"Market Demand: {request.demand_level}"
        )

        try:
            return await self.llm.ainvoke(
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=user_context),
                ]
            )
        except ValidationError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Model returned invalid pricing advice payload: {exc}",
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Price advisor analysis failed: {exc}",
            ) from exc

router = APIRouter()

@router.post("/ai/price-advisor", response_model=PriceAdvisorResponse)
async def get_price_advice(request: PriceAdvisorRequest) -> PriceAdvisorResponse:
    """
    Suggest optimal pricing based on product details, target audience, and market demand.
    """
    try:
        advisor = PriceAdvisor()
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return await advisor.suggest_pricing(request)
