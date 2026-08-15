from pydantic import BaseModel

class SandboxPolicy(BaseModel):
    cpu_time_ms: int = 2000
    memory_mb: int = 512
    process_limit: int = 2
    file_size_mb: int = 10
    stdout_limit_bytes: int = 50 * 1024
    stderr_limit_bytes: int = 50 * 1024
    network_enabled: bool = False
    timeout_ms: int = 5000
