from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
from pathlib import Path

app = FastAPI()

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable FastF1 cache
cache_dir = Path(__file__).parent / "cache"
fastf1.Cache.enable_cache(cache_dir)

@app.get("/")
def root():
    return {"status": "Ferrari backend running 🏎️"}

@app.get("/api/ferrari/last-race")
def ferrari_last_race():
    session = fastf1.get_session(2024, "Monza", "R")
    session.load()

    ferrari_laps = session.laps.pick_teams("Ferrari")

    return {
        "race": "Monza 2025",
        "team": "Ferrari",
        "total_laps": int(len(ferrari_laps)),
        "drivers": ferrari_laps["Driver"].unique().tolist()
    }
