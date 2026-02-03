from fastapi import APIRouter, Query
from typing import Optional
from app.services.fastf1_service import get_ferrari_analytics
from app.services.fastf1_service import get_driver_lap_progress

router = APIRouter(prefix="/api/ferrari", tags=["Ferrari"])

@router.get("/analytics")
def ferrari_analytics(
    year: Optional[int] = Query(None),
    circuit: Optional[str] = Query(None),
    driver: Optional[str] = Query(None)
):
    return get_ferrari_analytics(year, circuit, driver)


@router.get("/lap-telemetry")
def lap_telemetry(
    year: int,
    circuit: str,
    driver: str
):
    return get_driver_lap_progress(year, circuit, driver)

@router.get("/lap-telemetry")
def lap_telemetry(
    year: int,
    circuit: str,
    driver: str
):
    return get_driver_lap_progress(year, circuit, driver)

