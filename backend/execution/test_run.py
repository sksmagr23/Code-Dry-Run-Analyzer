import sys
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.execution.sandbox.manager import SandboxManager
from backend.execution.sandbox.policy import SandboxPolicy

test_code = """#include <bits/stdc++.h>
using namespace std;

int main() {
	// your code goes here
	int n;
	cin >> n;
	vector<int> h(n);
	for (int i = 0; i < n; i++) cin >> h[i];
	int i = 0, j = n-1;
	long long ans = 0;
	
	while (i < j){
	    long long w = 1LL * (j-i) * min(h[i], h[j]);
	    ans = max(ans, w);
	    if (h[i] < h[j]){
	        i++;
	    } else {
	        j--;
	    }
	}
	cout << ans;
	return 0;
}
"""

def main():
    print("Initializing SandboxManager...")
    manager = SandboxManager()
    
    print("Running C++ test code execution...")
    policy = SandboxPolicy(timeout_ms=15000)
    program_input = "9\n1 8 6 2 5 4 8 3 7"
    trace = manager.compile_and_run(test_code, program_input, policy)
    
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
