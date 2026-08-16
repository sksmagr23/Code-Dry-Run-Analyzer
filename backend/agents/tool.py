from functools import wraps
from typing import Callable, TypeVar, Any, Optional, Union
import inspect

FuncType = TypeVar("FuncType", bound=Callable[..., Any])

def tool(
    func: Optional[Callable] = None,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None
) -> Union[Callable[[FuncType], FuncType], FuncType]:
    """
    Decorator for agent tool functions.
    Marks functions as tools that can be discovered and used by agents.
    """
    def decorator(fn: FuncType) -> FuncType:
        if inspect.iscoroutinefunction(fn):
            @wraps(fn)
            async def wrapper(*args, **kwargs):
                return await fn(*args, **kwargs)
        else:
            @wraps(fn)
            def wrapper(*args, **kwargs):
                return fn(*args, **kwargs)
            
        if name:
            wrapper.__name__ = name
        if description:
            wrapper.__doc__ = description
            
        wrapper._is_tool = True
        wrapper._tool_name = name or fn.__name__
        wrapper._tool_description = description or fn.__doc__
        
        return wrapper
        
    if func is not None:
        return decorator(func)
    return decorator
