from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "Ferrari backend running 🟥"}
