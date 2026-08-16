import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { EditorPanel } from "./components/EditorPanel";
import { VariablesInspector } from "./components/VariablesInspector";
import { TerminalOutput } from "./components/TerminalOutput";
import { TimelineControl } from "./components/TimelineControl";
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
  const [inputData, setInputData] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Timeline Cursor States
  const [step, setStep] = useState<number>(1);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [activeLine, setActiveLine] = useState<number>(1);
  const [variables, setVariables] = useState<VariableState[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  
  // Status flags
  const [status, setStatus] = useState<string>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(800);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playIntervalRef = useRef<any>(null);

  // Actions: Jump Cursor Navigation
  const handleJump = useCallback(async (targetStep: number) => {
    if (!sessionId) return;
    
    try {
      const data = await api.jumpSession(sessionId, targetStep);
      setStep(data.step);
      setActiveLine(data.line);
      setVariables(data.variables);
      setOutput(data.output);
    } catch (err) {
      console.error(err);
    }
  }, [sessionId]);

  // Actions: Step Cursor Navigation
  const handleStep = useCallback(async (direction: "forward" | "backward") => {
    if (!sessionId) return;
    
    if (direction === "forward" && step >= totalSteps) {
      setIsPlaying(false);
      return;
    }
    if (direction === "backward" && step <= 1) {
      setIsPlaying(false);
      return;
    }
    
    try {
      const data = await api.stepSession(sessionId, direction);
      setStep(data.step);
      setActiveLine(data.line);
      setVariables(data.variables);
      setOutput(data.output);
    } catch (err) {
      setIsPlaying(false);
      console.error(err);
    }
  }, [sessionId, step, totalSteps]);

  // Actions: Restart Timeline
  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    handleJump(1);
  }, [handleJump]);

  // Actions: Clear Editor Code
  const handleClearCode = useCallback(() => {
    setCode("");
  }, []);

  // Auto-play interval timer (references handleStep)
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        handleStep("forward");
      }, playSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playSpeed, handleStep]);

  // Actions: Compile Code & Create Session
  const handleCompileAndRun = async () => {
    setIsPlaying(false);
    setStatus("compiling");
    setErrorMessage(null);
    setVariables([]);
    setOutput([]);
    setStep(1);
    setTotalSteps(0);
    
    try {
      const data = await api.createSession(code, inputData);
      setSessionId(data.session_id);
      setStep(data.step);
      setTotalSteps(data.total_steps);
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
      
      <TimelineControl
        sessionId={sessionId}
        step={step}
        totalSteps={totalSteps}
        activeLine={activeLine}
        inputData={inputData}
        setInputData={setInputData}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playSpeed={playSpeed}
        setPlaySpeed={setPlaySpeed}
        onStep={handleStep}
        onJump={handleJump}
        onRestart={handleRestart}
        isCompiling={status === "compiling"}
      />
    </div>
  );
}
