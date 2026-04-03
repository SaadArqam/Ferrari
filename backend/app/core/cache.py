import os
from pathlib import Path
import fastf1

def init_cache():
    # Vercel and most serverless environments only have /tmp as writeable
    if os.environ.get("VERCEL") == "1":
        cache_dir = Path("/tmp/fastf1_cache")
    else:
        cache_dir = Path(__file__).resolve().parents[1] / "cache"
        
    cache_dir.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
