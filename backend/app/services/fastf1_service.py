import fastf1
from typing import Optional
from datetime import datetime
import pandas as pd


def get_latest_race(season: int | None = None):
    season = season or datetime.now().year

    for year in [season, season - 1]:
        schedule = fastf1.get_event_schedule(year)

        schedule["EventDate"] = pd.to_datetime(
            schedule["EventDate"], utc=True
        )

        now_utc = pd.Timestamp.utcnow()

        completed = schedule[schedule["EventDate"] <= now_utc]

        if not completed.empty:
            latest_event = completed.iloc[-1]
            return year, latest_event["EventName"]

    raise ValueError("No completed races found in recent seasons")



def get_ferrari_analytics(
    year: Optional[int] = None,
    circuit: Optional[str] = None,
    driver: Optional[str] = None
):
    season = year or datetime.now().year
    if circuit:
        race = circuit
    else:
        season, race = get_latest_race(season)


    session = fastf1.get_session(season, race, "R")
    session.load()

    laps = session.laps.pick_teams("Ferrari")

    if driver:
        laps = laps.pick_driver(driver)

    best_lap = laps.loc[laps["LapTime"].idxmin()]

    return {
        "year": season,
        "circuit": race,
        "team": "Ferrari",
        "drivers": laps["Driver"].unique().tolist(),
        "total_laps": int(len(laps)),
        "best_lap": {
            "driver": best_lap["Driver"],
            "lap_time": str(best_lap["LapTime"])
        }
    }

def get_driver_lap_progress(year, circuit, driver):
    session = fastf1.get_session(year, circuit, "R")
    session.load()

    laps = session.laps.pick_driver(driver)
    fastest = laps.pick_fastest()

    tel = fastest.get_telemetry()
    if tel.empty:
        raise ValueError("No telemetry available")

    tel = tel.sort_values("Time")

    max_dist = tel["Distance"].max()

    samples = [
        {
            "t": float(t),
            "progress": float(d / max_dist),
            "speed": float(s)
        }
        for t, d, s in zip(
            tel["Time"].dt.total_seconds(),
            tel["Distance"],
            tel["Speed"]
        )
    ]

    return {
        "lap_time": fastest["LapTime"].total_seconds(),
        "samples": samples
    }
