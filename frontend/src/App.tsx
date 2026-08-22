import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { EditorPanel } from "./components/EditorPanel";
import { VariablesInspector } from "./components/VariablesInspector";
import { TerminalOutput } from "./components/TerminalOutput";
import { api, type VariableState } from "./services/api";

const DEFAULT_CODE = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 5;
    vector<int> arr = {12, 3, 54, 2, 7};
    int sum = 0;
    
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    
    cout << "Total elements sum: " << sum << endl;
    return 0;
}
`;

export default function App() {
  // Session States
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [inputData] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Execution States
  const [activeLine, setActiveLine] = useState<number>(1);
  const [variables, setVariables] = useState<VariableState[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  
  // Status flags
  const [status, setStatus] = useState<string>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Actions: Clear Editor Code
  const handleClearCode = useCallback(() => {
    setCode("");
  }, []);

  // Actions: Compile Code & Create Session
  const handleCompileAndRun = async () => {
    setStatus("compiling");
    setErrorMessage(null);
    setVariables([]);
    setOutput([]);
    
    try {
      const data = await api.createSession(code, inputData);
      setSessionId(data.session_id);
      setActiveLine(data.line);
      setVariables(data.variables);
      setOutput(data.output);
      setStatus(data.status);
      
      if (data.status === "error" || data.status === "timeout") {
        setErrorMessage(data.error_message);
      }
    } catch (err) {
      setStatus("error");
      const errMsg = err instanceof Error ? err.message : "Failed to establish connection to compiler backend.";
      setErrorMessage(errMsg);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] text-gray-200 overflow-hidden font-sans">
      <Header
        status={status}
        onCompileAndRun={handleCompileAndRun}
        compiling={status === "compiling"}
      />
      
      <main className="flex flex-1 overflow-hidden">
        <EditorPanel
          code={code}
          setCode={setCode}
          isCompiling={status === "compiling"}
          activeLine={activeLine}
          sessionId={sessionId}
          onClear={handleClearCode}
        />
        
        <section className="flex flex-col flex-1 bg-[#151515] overflow-hidden">
          <VariablesInspector variables={variables} />
          <TerminalOutput output={output} errorMessage={errorMessage} />
        </section>
      </main>
    </div>
  );
}
