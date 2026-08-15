# Agentic Code Dry-Run Analyzer

An interactive visual tool that lets you run C++ code and step through it like a video player, showing you exactly how lines execute and how variables change.

---

## Things Done till now

Implemented the core tracing engine in three simple parts:

1. **The Code Rewriter (Instrumentation)**:
   It takes your standard C++ code and inserts trace logs on every line. For example, if your code says `sum = 10;`, the engine automatically rewrites it to:
   * `"I am at line 4"`
   * `sum = 10;`
   * `"Variable 'sum' just changed to 10"`
2. **The Safe Digital Box (Docker Sandbox)**:
   Running code submitted by users can be unsafe. To protect your machine, the engine compiles and runs this rewritten code inside a restricted, temporary box (a Docker container) that is isolated from your computer. The compiler sandbox containers (gcc:latest) are designed to be disposable. They spin up, execute the code, and are deleted immediately after (in less than a second)
3. **The Step-by-Step Log Collector**:
   When the code runs inside the box, it spits out the logs we added in Step 1. We catch these logs and turn them into a neat list of events (e.g., Step 1: hit line 4, Step 2: variable `sum` became 10). This list is what will feed our interactive frontend screen.

---

## 📂 Code Layout
```
backend/execution/
├── instrumentation/
│   └── engine.py        # Rewrites C++ code to inject tracking logs
├── sandbox/
│   ├── manager.py       # Compiles & runs code inside the safe Docker container
│   └── policy.py        # Defines resource limits (e.g. CPU time, RAM caps)
├── trace/
│   └── model.py         # Standard templates for events (Lines, Variable changes)
└── test_run.py          # Quick script to test the engine
```

---

## (Quick Start engine)

You can run the verification script to watch the engine rewrite, compile, and output a line-by-line trace of an algorithm:

```powershell
# Run the trace test script
python backend/execution/test_run.py
```

---

