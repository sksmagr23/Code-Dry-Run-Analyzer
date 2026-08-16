import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

test_code = """#include <iostream>
#include <vector>
using namespace std;

class Node {
public:
    int data;
    Node* left;
    Node* right;

    Node(int x) {
        data = x;
        left = right = NULL;
    }
};

void inOrder(Node* node, vector<int>& res) {
    if (node == nullptr)
        return;
        
    inOrder(node->left, res);
    res.push_back(node->data);
    inOrder(node->right, res);
}

int main() {
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->right = new Node(6);

    vector<int> res;
    inOrder(root, res);
    
    for (int node : res) 
        cout << node << " ";

    return 0;
}
"""

def main():
    print("Testing Phase 2 Session API endpoints with Graph BFS...")
    
    # POST /api/v1/sessions (Create Session)
    print("\n1. Calling POST /api/v1/sessions...")
    payload = {
        "source_code": test_code,
        "input_data": ""
    }
    response = client.post("/api/v1/sessions", json=payload)
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Failed to create session: {response.text}"
    
    data = response.json()
    session_id = data["session_id"]
    total_steps = data["total_steps"]
    print(f"Session Created. ID: {session_id}")
    print(f"Total steps captured: {total_steps}")
    print(f"Current step cursor: {data['step']}")
    print(f"Highlighted line hit: {data['line']}")
    print(f"Variables list: {data['variables']}")
    
    # GET /api/v1/sessions/{id} (Fetch Session State)
    print(f"\n2. Calling GET /api/v1/sessions/{session_id}...")
    response = client.get(f"/api/v1/sessions/{session_id}")
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200
    print(f"Session state retrieved. Step: {response.json()['step']}")
    
    # POST /api/v1/sessions/{id}/step (Step Timeline)
    print(f"\n3. Calling POST /api/v1/sessions/{session_id}/step (Step Forward 2)...")
    step_payload = {
        "direction": "forward",
        "steps": 2
    }
    response = client.post(f"/api/v1/sessions/{session_id}/step", json=step_payload)
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200
    step_data = response.json()
    print(f"Timeline moved to Step: {step_data['step']}")
    print(f"Variables at Step 3: {step_data['variables']}")
    
    # POST /api/v1/sessions/{id}/jump (Jump Timeline)
    target_jump_step = total_steps - 2
    print(f"\n4. Calling POST /api/v1/sessions/{session_id}/jump (Jump to step {target_jump_step})...")
    jump_payload = {
        "step": target_jump_step
    }
    response = client.post(f"/api/v1/sessions/{session_id}/jump", json=jump_payload)
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200
    jump_data = response.json()
    print(f"Timeline jumped to Step: {jump_data['step']}")
    print(f"Highlighted line hit: {jump_data['line']}")
    print(f"Variables after jump: {jump_data['variables']}")
    print(f"Console Output captured: {jump_data['output']}")
    
    print("\nAPI tests completed successfully! All endpoints returned code 200 and verified correctly.")

if __name__ == "__main__":
    main()
