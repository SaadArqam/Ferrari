import fastf1

def get_ferrari_last_race():
    session = fastf1.get_session(2024, "Monza", "R")
    session.load()

    ferrari_laps = session.laps.pick_teams("Ferrari")

    return {
        "race": "Monza 2024",
        "team": "Ferrari",
        "total_laps": int(len(ferrari_laps)),
        "drivers": ferrari_laps["Driver"].unique().tolist()
    }
