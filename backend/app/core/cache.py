from pathlib import Path
import fastf1

def init_cache():
    cache_dir = Path(__file__).resolve().parents[1] / "cache"
    cache_dir.mkdir(exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
