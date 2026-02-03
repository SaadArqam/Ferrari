from fastapi import APIRouter, Query
from typing import Optional
from app.services.fastf1_service import get_ferrari_analytics

router = APIRouter(prefix="/api/ferrari", tags=["Ferrari"])

@router.get("/analytics")
def ferrari_analytics(
    year: Optional[int] = Query(None),
    circuit: Optional[str] = Query(None),
    driver: Optional[str] = Query(None)
):
    return get_ferrari_analytics(year, circuit, driver)
