import json
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.session import (
    SessionCreateRequest, SessionStepRequest, SessionJumpRequest, SessionStateResponse
)
from backend.app.schemas.analysis import AnalysisRequest
from backend.agents.planner import AgentPlanner, AgentAnalysisResponse
from backend.app.redis_client import redis_client
from backend.execution.sandbox.manager import SandboxManager
from backend.execution.sandbox.policy import SandboxPolicy

router = APIRouter(prefix="/sessions", tags=["Sessions"])
manager = SandboxManager()

def get_session_data(session_id: str) -> tuple:
    """Helper to fetch trace, cursor, and code from Redis."""
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis client is not initialized.")
        
    trace_json = redis_client.get(f"trace_{session_id}")
    cursor_str = redis_client.get(f"cursor_{session_id}")
    code = redis_client.get(f"code_{session_id}")
    
    if not trace_json or not cursor_str:
        raise HTTPException(status_code=404, detail="Execution session not found or expired.")
        
    return json.loads(trace_json), int(cursor_str), code or ""

def reconstruct_state(session_id: str, trace_data: dict, step: int, code: str) -> dict:
    """Replays trace events up to target step K to reconstruct variables, outputs, and line cursor."""
    events = trace_data.get("events", [])
    total_steps = len(events)
    status = trace_data.get("status", "success")
    error_message = trace_data.get("error_message")
    
    if total_steps == 0:
        return {
            "session_id": session_id,
            "step": 1,
            "total_steps": 0,
            "line": 1,
            "variables": [],
            "output": [f"[error]: {error_message}"] if error_message else [],
            "status": status,
            "error_message": error_message
        }
        
    if step < 1:
        step = 1
    if step > total_steps:
        step = total_steps
        
    current_line = 1
    variables = {}
    output = []
    
    for idx in range(step):
        event = events[idx]
        event_type = event.get("type")
        
        if "line" in event and event["line"] > 0:
            current_line = event["line"]
            
        for var in variables.values():
            var["changed"] = False
            
        if event_type == "assignment":
            var_name = event.get("variable")
            val = event.get("value")
            prev_val = variables.get(var_name, {}).get("value")
            
            variables[var_name] = {
                "name": var_name,
                "value": val,
                "prev_value": prev_val,
                "changed": True
            }
        elif event_type == "output":
            output.append(event.get("text"))
            
    return {
        "session_id": session_id,
        "step": step,
        "total_steps": total_steps,
        "line": current_line,
        "variables": list(variables.values()),
        "output": output,
        "status": status,
        "error_message": error_message
    }

@router.post("", response_model=SessionStateResponse)
async def create_session(req: SessionCreateRequest):
    """Compiles C++ source code, executes it inside sandbox, and registers a session."""
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis server is offline.")
        
    policy = SandboxPolicy()
    trace = manager.compile_and_run(req.source_code, req.input_data, policy)
    
    session_id = trace.session_id
    
    redis_client.setex(f"trace_{session_id}", 1800, trace.model_dump_json())
    redis_client.setex(f"code_{session_id}", 1800, req.source_code)
    redis_client.setex(f"input_{session_id}", 1800, req.input_data)
    redis_client.setex(f"cursor_{session_id}", 1800, "1")
    
    trace_data = json.loads(trace.model_dump_json())
    
    return reconstruct_state(session_id, trace_data, 1, req.source_code)

@router.get("/{session_id}", response_model=SessionStateResponse)
async def get_session(session_id: str):
    """Retrieves current visual state of the execution session."""
    trace_data, cursor, code = get_session_data(session_id)
    return reconstruct_state(session_id, trace_data, cursor, code)

@router.post("/{session_id}/step", response_model=SessionStateResponse)
async def step_session(session_id: str, req: SessionStepRequest):
    """Moves execution timeline cursor forward or backward and returns updated state."""
    trace_data, cursor, code = get_session_data(session_id)
    events = trace_data.get("events", [])
    total_steps = len(events)
    
    if total_steps == 0:
        return reconstruct_state(session_id, trace_data, 1, code)
        
    delta = req.steps
    if req.direction == "backward":
        delta = -delta
        
    target_cursor = cursor + delta
    
    if target_cursor < 1:
        target_cursor = 1
    if target_cursor > total_steps:
        target_cursor = total_steps
        
    redis_client.setex(f"cursor_{session_id}", 1800, str(target_cursor))
    
    return reconstruct_state(session_id, trace_data, target_cursor, code)

@router.post("/{session_id}/jump", response_model=SessionStateResponse)
async def jump_session(session_id: str, req: SessionJumpRequest):
    """Jumps timeline cursor to a specific execution step."""
    trace_data, cursor, code = get_session_data(session_id)
    events = trace_data.get("events", [])
    total_steps = len(events)
    
    if total_steps == 0:
        return reconstruct_state(session_id, trace_data, 1, code)
        
    target_cursor = req.step
    if target_cursor < 1:
        target_cursor = 1
    if target_cursor > total_steps:
        target_cursor = total_steps
        
    redis_client.setex(f"cursor_{session_id}", 1800, str(target_cursor))
    
    return reconstruct_state(session_id, trace_data, target_cursor, code)

@router.post("/{session_id}/analyze", response_model=AgentAnalysisResponse)
async def analyze_session(session_id: str, req: AnalysisRequest):
    """Invokes the Agent Planner to analyze the session trace and code."""
    trace_data, _, code = get_session_data(session_id)
    
    input_val = redis_client.get(f"input_{session_id}") or ""
    input_data = input_val.decode("utf8") if isinstance(input_val, bytes) else str(input_val)
    
    try:
        planner = AgentPlanner()
        analysis = planner.plan_session(code, input_data, trace_data, req.query)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent analysis failed: {str(e)}")
