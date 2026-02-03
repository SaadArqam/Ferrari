from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ferrari
from app.core.cache import init_cache

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init infra
init_cache()

# Routes
app.include_router(ferrari.router)

@app.get("/")
def root():
    return {"status": "Ferrari backend running 🏎️"}
