from pydantic import BaseModel

class SandboxPolicy(BaseModel):
    cpu_time_ms: int = 2000
    memory_mb: int = 128
    process_limit: int = 2
    file_size_mb: int = 10
    stdout_limit_bytes: int = 50 * 1024  # 50 KB
    stderr_limit_bytes: int = 50 * 1024  # 50 KB
    network_enabled: bool = False
    timeout_ms: int = 5000
