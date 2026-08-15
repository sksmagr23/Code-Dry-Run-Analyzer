import sys
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.execution.sandbox.manager import SandboxManager
from backend.execution.sandbox.policy import SandboxPolicy

test_code = """#include <iostream>

int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int val = 6;
    int res = fib(val);
    std::cout << "Fibonacci of 6 is: " << res << std::endl;
    return 0;
}
"""

def main():
    print("Initializing SandboxManager...")
    manager = SandboxManager()
    
    print("Running C++ test code execution...")
    policy = SandboxPolicy(timeout_ms=15000)
    trace = manager.compile_and_run(test_code, policy)
    
    print(f"Execution Status: {trace.status}")
    if trace.status != "success":
        print(f"Error: {trace.error_message}")
        sys.exit(1)
        
    print(f"Total Trace Events Captured: {len(trace.events)}")
    print("\n--- Event Traces ---")
    for event in trace.events:
        if event.type == "line":
            print(f"[Step {event.step}] Line hit: {event.line}")
        elif event.type == "assignment":
            print(f"[Step {event.step}] Assignment: {event.variable} = {event.value} at line {event.line}")
        elif event.type == "output":
            print(f"[Stdout/Stderr]: {event.text}")

if __name__ == "__main__":
    main()
