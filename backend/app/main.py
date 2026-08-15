from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Agentic Code Dry-Run Analyzer API",
    description="Backend API powering the dry-run sandbox execution engine and Agent Planner UI services.",
    version="0.1.0"
)

# Configure CORS for separate frontend deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Code Dry-Run Analyzer Backend API",
        "version": "0.1.0"
    }
