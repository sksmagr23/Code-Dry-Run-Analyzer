# Agentic Code Dry-Run Analyzer

An interactive visual tool that lets you run C++ code and step through it like a video player, showing you exactly how lines execute and how variables change.

---

## What is Built till now

### Phase 1: Sandbox & Tracing Core
To build a "video player" for code, we need a camera that records the program's journey step-by-step:
1. **The Code Rewriter (Instrumentation)**: Injects invisible "status notes" around statements. For example, if your code says `x = 5;`, the engine automatically rewrites it to log: *"I hit line 4, and variable 'x' changed to 5"*. It sends these notes to a separate channel (`stderr`) to keep your output clean.
2. **The Safe Container Sandbox**: Compiles and executes this rewritten code inside an isolated container (Docker) with strict CPU and memory limits. This prevents unsafe code from accessing your filesystem.
3. **The Log Collector**: Reads the status prints from the sandbox and converts them into a list of structured trace events.

### Phase 2: Session API & Redis State
Now that we can record the trace, we need a way to store it and provide play/pause control:
1. **The Memory Bank (Redis)**: When you run code, we save the full execution trace in a fast cache database (Redis) and set a digital timeline pointer (the cursor) starting at step 1.
2. **The Remote Control API (FastAPI)**: We built backend endpoints that act like remote buttons:
   * **Play / Create Session** (`POST /api/v1/sessions`): Runs the code and starts a session.
   * **Step Forward / Backward** (`POST /api/v1/sessions/{id}/step`): Increments or decrements the timeline cursor in Redis.
   * **Jump to Step** (`POST /api/v1/sessions/{id}/jump`): Skips directly to any step in the execution.
3. **The Replay Engine**: When you step or jump to a specific step $K$, the backend automatically "replays" the events from step 1 up to $K$. This reconstructs the values of all variables at that exact moment and displays them on the screen!

---

## 📂 Repository Layout
```
backend/
├── app/
│   ├── main.py          # FastAPI app server entrypoint
│   ├── config.py        # Environment configurations (Redis host/port)
│   ├── redis_client.py  # Connection wrapper for Redis State Cache
│   └── schemas/
│       └── session.py   # Request/Response data models (Create, Step, Jump)
├── api/routes/
│   └── sessions.py      # Route endpoints mapping Step and Jump controllers
└── execution/
    ├── instrumentation/
    │   └── engine.py    # Rewrites C++ code to inject tracking logs
    ├── sandbox/
    │   ├── manager.py   # Compiles & runs code inside Docker sandbox
    │   └── policy.py    # Defines resource policies (512MB RAM cap)
    ├── trace/
    │   └── model.py     # Pydantic models for trace events
    ├── test_run.py      # Verifies Phase 1 compilation & tracking
    └── test_api.py      # Verifies Phase 2 timeline endpoint step/jump logic
```

---

## 🚀 Quick Start & Verification

Ensure you have activated your virtual environment and have Redis running in Docker before testing.

### 1. Test Code Tracing (Phase 1)
```powershell
python backend/execution/test_run.py
```

### 2. Test Timeline API Control (Phase 2)
```powershell
python backend/execution/test_api.py
```

### 3. Run the FastAPI Development Server
Start the uvicorn development server from the **project root** directory (to ensure absolute package imports are resolved correctly):
```powershell
# Ensure you are in the project root directory, then run:
uvicorn backend.app.main:app --reload
```

---

