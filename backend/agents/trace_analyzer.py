import re
from typing import Dict, Any, List
from backend.agents.tool import tool

@tool(
    name="analyze_trace_programmatic",
    description="Programmatically analyzes a session execution trace and code to detect infinite loops, crashes, or recursion safety limits."
)
def analyze_trace_programmatic(trace_data: Dict[str, Any], source_code: str) -> Dict[str, Any]:
    """
    Programmatically scans execution trace events for anomalies.
    """
    events = trace_data.get("events", [])
    status = trace_data.get("status", "success")
    error_message = trace_data.get("error_message") or ""
    
    anomalies: List[Dict[str, Any]] = []
    
    # 1. Runtime Error / Assert Crashes
    if status == "error" or "aborted" in error_message.lower() or "assertion" in error_message.lower() or "killed" in error_message.lower():
        line_num = 1
        # Extract line number from g++ compilation or runtime backtrace if available
        line_match = re.search(r'main.cpp:(\d+):', error_message)
        if line_match:
            line_num = int(line_match.group(1))
        else:
            # Fallback: find last line executed in trace
            for e in reversed(events):
                if e.get("line"):
                    line_num = e.get("line")
                    break
                    
        anomalies.append({
            "type": "runtime_error",
            "message": error_message.strip(),
            "line": line_num
        })
        
    # 2. Infinite Loop / Statement Limit Warnings
    line_hit_counts: Dict[int, int] = {}
    for event in events:
        if event.get("type") == "line":
            line = event.get("line")
            line_hit_counts[line] = line_hit_counts.get(line, 0) + 1
            if line_hit_counts[line] > 250:  # Threshold representing infinite loops
                anomalies.append({
                    "type": "infinite_loop",
                    "message": f"Line {line} executed over {line_hit_counts[line]} times. Indicative of infinite loop or redundant loops.",
                    "line": line
                })
                break
                
    # 3. Sandbox safety limits / Infinite Recursion
    # If the execution step list is extremely long, verify recursion limits
    if len(events) >= 500 and not any(a["type"] == "infinite_loop" for a in anomalies):
        anomalies.append({
            "type": "infinite_recursion",
            "message": "Execution aborted after reaching sandbox step safety limit (500 steps). Indicative of infinite recursion.",
            "line": events[-1].get("line", 1) if events else 1
        })
        
    # Collect list of variable names inspected
    variables_seen = set()
    for event in events:
        if event.get("type") == "assignment":
            v = event.get("variable")
            if v:
                variables_seen.add(v)
                
    return {
        "anomalies": anomalies,
        "variables_inspected": list(variables_seen)
    }
