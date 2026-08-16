import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.agents.trace_analyzer import analyze_trace_programmatic

logger = logging.getLogger(__name__)

class Anomaly(BaseModel):
    type: str = Field(..., description="Type of anomaly: out_of_bounds, infinite_recursion, infinite_loop, runtime_error, or none.")
    message: str = Field(..., description="Explanation of the anomaly.")
    line: int = Field(..., description="Line number where the anomaly was detected.")

class ComplexityEstimation(BaseModel):
    time: str = Field(..., description="Estimated Time Complexity (e.g., O(N log N)).")
    space: str = Field(..., description="Estimated Space Complexity (e.g., O(N)).")
    rationale: str = Field(..., description="Brief rationale for the complexity estimate.")

class BugAnalysis(BaseModel):
    issue: str = Field(..., description="If a bug is present, explain the issue. If the code executes successfully with no bugs, provide a detailed walkthrough of the dry-run solution execution.")
    fix: str = Field(..., description="If a bug is present, explain the fix. If correct, return 'No bugs detected'.")
    code_fixed: str = Field(..., description="Corrected C++ source code if a bug is present. If correct, return the original C++ code unchanged.")

class UIComponentIntent(BaseModel):
    type: str = Field(..., description="Type of UI component: variables_delta, bug_analysis, recursion_tree, graph_visualizer, or array_visualizer.")
    props: Dict[str, Any] = Field(default_factory=dict, description="Component configuration properties.")
    priority: int = Field(..., description="Ordering priority of the component (higher values rendered first).")

class UIPlan(BaseModel):
    components: List[UIComponentIntent] = Field(..., description="List of components planned for rendering.")
    rationale: str = Field(..., description="Concise rationale for this layout choice.")

class AgentAnalysisResponse(BaseModel):
    anomalies: List[Anomaly] = Field(..., description="List of execution trace anomalies detected.")
    complexity: ComplexityEstimation = Field(..., description="Algorithmic complexity estimate.")
    bug_analysis: BugAnalysis = Field(..., description="Analysis of the code behavior (bug explanation or execution walkthrough).")
    ui_plan: UIPlan = Field(..., description="Planned UI components composition.")

def load_dotenv():
    for path in (".env", "backend/.env", "../.env"):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip("'\"")
            break

class AgentPlanner:
    """
    Agentic Planner orchestrating Query Analysis, Trace Retrieval, Anomaly Scanning, and Generative UI planning.
    Uses Google GenAI SDK (Gemini API) to output structured UIPlans and TraceAnalysisResults.
    """
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Agent Error: GEMINI_API_KEY environment variable is not set. Please set the API key.")
        
        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            raise RuntimeError(f"Agent Error: Failed to initialize Gemini API Client: {str(e)}")

    def plan_session(self, code: str, input_data: str, trace_data: Dict[str, Any], query: Optional[str] = None) -> AgentAnalysisResponse:
        """
        Orchestrates trace scanner tools, fetches Gemini API analysis, and outputs structured UI plans.
        """
        tool_result = analyze_trace_programmatic(trace_data, code)
        schema_dict = AgentAnalysisResponse.model_json_schema()
        
        def clean_schema(s: Any):
            if isinstance(s, dict):
                s.pop("additionalProperties", None)
                for k, v in list(s.items()):
                    clean_schema(v)
            elif isinstance(s, list):
                for item in s:
                    clean_schema(item)
                    
        clean_schema(schema_dict)
        
        system_prompt = (
            "You are the Agent Planner for the Dry-Run Timeline Analyzer.\n"
            "You analyze C++ source code, standard inputs, and program execution trace logs to find bugs, "
            "estimate algorithmic complexity, and structure a custom user interface plan (UIPlan).\n\n"
            "CRITICAL INSTRUCTIONS FOR SUCCESSFULLY RUNNING CODE:\n"
            "- If the execution status is 'success' and no anomalies are found, the code is correct.\n"
            "- For correct code: under 'bug_analysis.issue', provide a clear, step-by-step walkthrough of the solution's dry-run execution (how the variables change, what is printed, and how it arrives at the final answer based on the input).\n"
            "- Set 'bug_analysis.fix' to 'No bugs detected' and 'bug_analysis.code_fixed' to the original source code unchanged.\n\n"
            "Keep the UIPlan rationale concise (e.g. 'Recursion tree prioritized because the query targets recursive call behavior').\n"
            "Do NOT send raw/unrestricted LLM thoughts in the rationale."
        )
        
        user_prompt = f"""
C++ SOURCE CODE:
```cpp
{code}
```

INPUT PROVIDED:
{input_data or "(None)"}

EXECUTION TRACE OVERVIEW:
- Total Steps Captured: {len(trace_data.get('events', []))}
- Execution Status: {trace_data.get('status')}
- Error Message: {trace_data.get('error_message') or "(None)"}

PROGRAMMATIC SCANNERS DETECTED:
{json.dumps(tool_result, indent=2)}

USER QUESTION / FOCUS:
{query or "Analyze the execution trace and provide a structured plan and bug analysis."}
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=schema_dict,
                    temperature=0.2
                )
            )
            
            raw_json = json.loads(response.text)
            return AgentAnalysisResponse.model_validate(raw_json)
            
        except Exception as e:
            raise RuntimeError(f"Agent Error: Gemini API generation failed: {str(e)}")
