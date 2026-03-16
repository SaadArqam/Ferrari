from fastapi import APIRouter, HTTPException
from app.services.fastf1_service import get_fastest_lap_telemetry

router = APIRouter(tags=["Telemetry"])

@router.get("/api/telemetry")
def telemetry(year: int, race: str, driver: str):
    try:
        return get_fastest_lap_telemetry(year, race, driver)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
