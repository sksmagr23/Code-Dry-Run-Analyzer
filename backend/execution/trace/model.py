from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union

class BaseEvent(BaseModel):
    type: str
    step: Optional[int] = None
    line: int

class LineEvent(BaseEvent):
    type: str = "line"

class AssignmentEvent(BaseEvent):
    type: str = "assignment"
    variable: str
    value: Any
    previous_value: Optional[Any] = None
    scope_id: Optional[str] = "global"

class CallEvent(BaseEvent):
    type: str = "call"
    function_name: str
    scope_id: str

class ReturnEvent(BaseEvent):
    type: str = "return"
    function_name: str
    value: Optional[Any] = None

class ExceptionEvent(BaseEvent):
    type: str = "exception"
    message: str
    exception_type: str

class OutputEvent(BaseEvent):
    type: str = "output"
    text: str

class ExecutionTrace(BaseModel):
    session_id: str
    events: List[Union[LineEvent, AssignmentEvent, CallEvent, ReturnEvent, ExceptionEvent, OutputEvent]] = []
    status: str = "success"  # success, error, timeout, sandbox_violation
    error_message: Optional[str] = None
