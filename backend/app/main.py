from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes.sessions import router as sessions_router

app = FastAPI(
    title="Agentic Code Dry-Run Analyzer API",
    description="Backend API powering the dry-run sandbox execution engine and Agent Planner UI services.",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Code Dry-Run Analyzer Backend API",
        "version": "0.1.0"
    }
