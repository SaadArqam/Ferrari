from fastapi import APIRouter
from app.services.fastf1_service import get_ferrari_last_race

router = APIRouter(prefix="/api/ferrari", tags=["Ferrari"])

@router.get("/last-race")
def ferrari_last_race():
    return get_ferrari_last_race()
