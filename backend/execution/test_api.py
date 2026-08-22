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
    print(f"Session state retrieved. Status: {response.json()['status']}")
    
    print("\nAPI tests completed successfully! All endpoints returned code 200 and verified correctly.")

if __name__ == "__main__":
    main()
