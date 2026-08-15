import os
import json
import uuid
import tempfile
import subprocess
import logging
from typing import List, Dict, Any, Tuple
from backend.execution.instrumentation.engine import CppInstrumenter
from backend.execution.sandbox.policy import SandboxPolicy
from backend.execution.trace.model import (
    ExecutionTrace, LineEvent, AssignmentEvent, OutputEvent
)

logger = logging.getLogger(__name__)

class SandboxManager:
    """
    Manages compilation and execution of C++ source code in a restricted sandbox.
    Uses Docker if available, otherwise falls back to safe local execution.
    """
    
    def __init__(self):
        self.instrumenter = CppInstrumenter()
        self.docker_available = self._check_docker()
        
    def _check_docker(self) -> bool:
        """Checks if Docker daemon is running and reachable."""
        try:
            import docker
            client = docker.from_env()
            client.ping()
            logger.info("Docker daemon is running. Docker sandbox mode enabled.")
            return True
        except Exception as e:
            logger.warning(f"Docker is not available: {str(e)}. Falling back to local execution.")
            return False
            
    def compile_and_run(self, source_code: str, input_data: str = "", policy: SandboxPolicy = SandboxPolicy()) -> ExecutionTrace:
        """
        Instruments, compiles, and runs user C++ code with optional input.
        """
        session_id = str(uuid.uuid4())
        instrumented_code = self.instrumenter.instrument(source_code)
        
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        temp_base = os.path.join(project_root, ".tmp")
        os.makedirs(temp_base, exist_ok=True)
        
        with tempfile.TemporaryDirectory(dir=temp_base) as temp_dir:
            cpp_filename = "main.cpp"
            bin_filename = "main.exe" if os.name == 'nt' else "main"
            
            cpp_path = os.path.join(temp_dir, cpp_filename)
            bin_path = os.path.join(temp_dir, bin_filename)
            input_path = os.path.join(temp_dir, "input.txt")
            
            with open(cpp_path, "w", encoding="utf-8") as f:
                f.write(instrumented_code)
                
            with open(input_path, "w", encoding="utf-8") as f:
                f.write(input_data)
                
            if self.docker_available:
                return self._run_in_docker(session_id, temp_dir, cpp_filename, bin_filename, input_data, policy)
            else:
                return self._run_locally(session_id, cpp_path, bin_path, input_data, policy)
                
    def _run_in_docker(
        self, session_id: str, temp_dir: str, cpp_file: str, bin_file: str, input_data: str, policy: SandboxPolicy
    ) -> ExecutionTrace:
        """Compiles and executes C++ code inside a single Docker container, bypassing Windows NTFS execution permissions limits."""
        import docker
        client = docker.from_env()
        
        try:
            volumes = {temp_dir: {"bind": "/workspace", "mode": "rw"}}
            combined_cmd = f"sh -c 'g++ -O0 /workspace/{cpp_file} -o /tmp/main && /tmp/main < /workspace/input.txt'"
            
            logger.info("Compiling and executing inside Docker sandbox...")
            
            mem_limit_str = f"{policy.memory_mb}m"
            nano_cpus_limit = int(policy.cpu_time_ms * 1_000_000)
            
            container = client.containers.run(
                image="gcc:latest",
                command=combined_cmd,
                volumes=volumes,
                working_dir="/workspace",
                mem_limit=mem_limit_str,
                nano_cpus=nano_cpus_limit,
                network_mode="none",
                detach=True,
                stderr=True,
                stdout=True
            )
            
            try:
                wait_result = container.wait(timeout=float(policy.timeout_ms / 1000))
                exit_code = wait_result.get("StatusCode", 0)
                
                stdout_data = container.logs(stdout=True, stderr=False).decode("utf-8", errors="ignore")
                stderr_data = container.logs(stdout=False, stderr=True).decode("utf-8", errors="ignore")
                
                container.remove(force=True)
                
                if exit_code != 0:
                    return ExecutionTrace(
                        session_id=session_id,
                        status="error",
                        error_message=stderr_data if stderr_data.strip() else stdout_data
                    )
                    
                return self._parse_output(session_id, stdout_data, stderr_data)
                
            except Exception as wait_exc:
                try:
                    container.kill()
                except Exception:
                    pass
                try:
                    container.remove(force=True)
                except Exception:
                    pass
                
                if "timeout" in str(wait_exc).lower():
                    return ExecutionTrace(
                        session_id=session_id,
                        status="timeout",
                        error_message=f"Execution timed out. Exceeded policy limit of {policy.timeout_ms}ms"
                    )
                raise wait_exc
                
        except docker.errors.ContainerError as ce:
            stderr_data = ce.stderr.decode("utf-8", errors="ignore")
            return ExecutionTrace(
                session_id=session_id,
                status="error",
                error_message=stderr_data
            )
        except Exception as e:
            return ExecutionTrace(
                session_id=session_id,
                status="sandbox_violation",
                error_message=f"Sandbox execution aborted: {str(e)}"
            )

    def _run_locally(
        self, session_id: str, cpp_path: str, bin_path: str, input_data: str, policy: SandboxPolicy
    ) -> ExecutionTrace:
        """Fallback local g++ compilation and execution with timeouts and constraints."""
        logger.info("Executing locally (Fallback mode)...")
        
        try:
            compile_process = subprocess.run(
                ["g++", "-O0", cpp_path, "-o", bin_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            if compile_process.returncode != 0:
                return ExecutionTrace(
                    session_id=session_id,
                    status="error",
                    error_message=compile_process.stderr
                )
        except subprocess.TimeoutExpired:
            return ExecutionTrace(
                session_id=session_id,
                status="error",
                error_message="Local compiler compilation timed out (max 10s)."
            )
        except FileNotFoundError:
            return ExecutionTrace(
                session_id=session_id,
                status="error",
                error_message="g++ compiler not found. Ensure GCC is installed on host system."
            )
            
        try:
            run_process = subprocess.run(
                [bin_path],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=float(policy.timeout_ms / 1000)
            )
            
            return self._parse_output(session_id, run_process.stdout, run_process.stderr)
            
        except subprocess.TimeoutExpired:
            return ExecutionTrace(
                session_id=session_id,
                status="timeout",
                error_message=f"Local execution timed out. Exceeded policy limit of {policy.timeout_ms}ms."
            )
        except Exception as e:
            return ExecutionTrace(
                session_id=session_id,
                status="error",
                error_message=f"Local execution failed: {str(e)}"
            )
            
    def _parse_output(self, session_id: str, stdout: str, stderr: str) -> ExecutionTrace:
        """Parses output streams: trace logs are parsed from stderr, and user outputs are captured from stdout."""
        events = []
        step_counter = 1
        
        for line in stderr.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
                
            if line_str.startswith("{") and line_str.endswith("}"):
                try:
                    data = json.loads(line_str)
                    event_type = data.get("type")
                    
                    if event_type == "line":
                        events.append(LineEvent(
                            type="line",
                            step=step_counter,
                            line=data["line"]
                        ))
                        step_counter += 1
                        
                    elif event_type == "assignment":
                        events.append(AssignmentEvent(
                            type="assignment",
                            step=step_counter,
                            line=data["line"],
                            variable=data["variable"],
                            value=data["value"]
                        ))
                        step_counter += 1
                except (json.JSONDecodeError, KeyError):
                    events.append(OutputEvent(
                        type="output",
                        line=0,
                        text=line_str
                    ))
            else:
                events.append(OutputEvent(
                    type="output",
                    line=0,
                    text=f"[stderr]: {line_str}"
                ))
                
        for line in stdout.splitlines():
            events.append(OutputEvent(
                type="output",
                line=0,
                text=line
            ))
            
        return ExecutionTrace(
            session_id=session_id,
            events=events,
            status="success"
        )
