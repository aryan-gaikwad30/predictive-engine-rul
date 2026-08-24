from fastapi import FastAPI
from src.api.routes import router

app = FastAPI(
    title="Predictive Engine API",
    description="Backend API for the Predictive Engine RUL Platform",
    version="1.0.0"
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
