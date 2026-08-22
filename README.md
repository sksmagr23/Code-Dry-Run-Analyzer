# Agentic Code Dry-Run Analyzer

An interactive visual tool that lets you run C++ code and step through it like a video player, showing you exactly how lines execute and how variables change.

---

## What is Built till now

### Phase 1: Sandbox & AST Tracing Core
1. **The Code Rewriter (AST Instrumentation)**: Parses your C++ code into a structured Abstract Syntax Tree (AST) using the **Tree-sitter compiler parser**. It traverses the nodes to identify primitive variable declarations and statements, then splices trace logs cleanly using byte offsets. This ensures that loop headers and class member declarations are bypassed, keeping compilation 100% stable. It outputs trace logs to a separate stream (`stderr`) to keep your stdout clean.
2. **The Safe Container Sandbox**: Compiles and executes this rewritten code inside an isolated container (Docker) with strict CPU and memory limits. This prevents unsafe code from accessing your filesystem.
3. **The Log Collector**: Reads the status prints from the sandbox and converts them into a list of structured trace events.

### Phase 2: Session API & Redis State
1. **The Memory Bank (Redis)**: When you run code, we save the execution trace and session state in a fast cache database (Redis).
2. **Session API (FastAPI)**:
   * **Create Session** (`POST /api/v1/sessions`): Executes code and registers session state.
   * **Get Session** (`GET /api/v1/sessions/{id}`): Fetches session execution details.

### Phase 3: Monaco Workspace UI
1. **The Code Viewer (Monaco Editor)**: A code display powered by Monaco (VS Code's editor) with active line indicators and a **Clear** button to wipe input code quickly.
2. **Variables Inspector**: Displays primitive variable states.
3. **Console Terminal Panel**: Consolidates stdout program outputs and stderr compile warnings.

### Phase 4: Trace Analysis & Agent Orchestration
We built an agent pipeline to explain program bugs and plan the rendering layout:
1. **Google ADK Tool Discovery Wrapper**: A custom `@tool` decorator (`backend/agents/tool.py`) that marks functions with tool attributes (`_is_tool`, `_tool_name`, `_tool_description`) matching the Google ADK discovery interface.
2. **Programmatic Trace Scan Scanner**: A deterministic scanner tool (`trace_analyzer.py`) that quickly flags compilation crashes, infinite recursion overflows, loop cycle limits, and safety capping violations.
3. **Trace Safety Logging Gate**: Integrates a trace count checker inside the C++ preamble (`engine.py`) that halts execution printouts at 500 steps, shielding the analyzer from log pollution and memory overflows during infinite loops.
4. **Agent UI Planner**: An orchestrator (`planner.py`) utilizing the `google-genai` SDK and Gemini 2.5 Flash to generate structured, type-safe JSON plans conforming to a target UI schema. It plans which visualizer widgets to render (e.g. `recursion_tree`, `graph_visualizer`, `array_visualizer`) based on code signatures, and provides a full bug explanation and C++ fix. Includes a robust offline fallback planner.
5. **Session Analysis Routing**: Mounts the FastAPI endpoint `POST /api/v1/sessions/{id}/analyze` to trigger the agent pipeline.

---

## 📂 Repository Layout
```
backend/
├── agents/              # Phase 4 Agent Orchestration
│   ├── tool.py          # Google ADK tool decoration wrapper
│   ├── trace_analyzer.py# Programmatic trace anomalies scanner
│   └── planner.py       # Gemini API planner and structured UI planners
├── app/
│   ├── main.py          # FastAPI app server entrypoint
│   ├── config.py        # Environment configurations (Redis host/port)
│   ├── redis_client.py  # Connection wrapper for Redis State Cache
│   └── schemas/
│       ├── session.py   # Request/Response data models (Create, Step, Jump)
│       └── analysis.py  # Agent analysis query request schemas
├── api/routes/
│   └── sessions.py      # Session and Agent Analysis routing endpoints
└── execution/
    ├── instrumentation/
    │   └── engine.py    # Rewrites C++ code using Tree-sitter C++ AST
    ├── sandbox/
    │   ├── manager.py   # Compiles & runs code inside Docker sandbox
    │   └── policy.py    # Defines resource policies (512MB RAM cap)
    ├── trace/
    │   └── model.py     # Pydantic models for trace events
    ├── test_run.py      # Verifies Phase 1 compilation & tracking
    ├── test_api.py      # Verifies Phase 2 timeline endpoint step/jump logic
    └── test_agent.py    # Verifies Phase 4 Agent analysis and fallbacks
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

### 3. Test Agent Planning & UI Plans (Phase 4)
```powershell
python backend/execution/test_agent.py
```

### 4. Run the FastAPI Development Server
Start the uvicorn development server from the **project root** directory (to ensure absolute package imports are resolved correctly):
```powershell
# Ensure you are in the project root directory, then run:
uvicorn backend.app.main:app --reload
```

### 4. Run the React Frontend Development Server
Start the client interface to interact with the dry-run timeline explorer:
```powershell
cd frontend
npm run dev
```

---

