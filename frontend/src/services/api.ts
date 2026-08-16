const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface VariableState {
  name: string;
  value: any;
  prev_value: any | null;
  changed: boolean;
}

export interface SessionState {
  session_id: string;
  step: number;
  total_steps: number;
  line: number;
  variables: VariableState[];
  output: string[];
  status: string;
  error_message: string | null;
}

export const api = {
  createSession: async (sourceCode: string, inputData: string): Promise<SessionState> => {
    const res = await fetch(`${API_URL}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: sourceCode,
        input_data: inputData,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create session");
    }
    
    return res.json();
  },

  stepSession: async (sessionId: string, direction: "forward" | "backward"): Promise<SessionState> => {
    const res = await fetch(`${API_URL}/api/v1/sessions/${sessionId}/step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        direction,
        steps: 1,
      }),
    });

    if (!res.ok) throw new Error("Timeline step action failed");
    return res.json();
  },

  jumpSession: async (sessionId: string, targetStep: number): Promise<SessionState> => {
    const res = await fetch(`${API_URL}/api/v1/sessions/${sessionId}/jump`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        step: targetStep,
      }),
    });

    if (!res.ok) throw new Error("Timeline jump action failed");
    return res.json();
  },
};
