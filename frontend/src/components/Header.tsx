import React from "react";
import { Cpu, CheckCircle, AlertCircle } from "lucide-react";

interface HeaderProps {
  status: string;
  onCompileAndRun: () => void;
  compiling: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, onCompileAndRun, compiling }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d2d] bg-[#1a1a1a]">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-yellow-500 rounded-lg text-black">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide text-white">Dry-Run Workspace</h1>
          <p className="text-xs text-gray-400">Step-by-Step execution visualizer</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onCompileAndRun}
          disabled={compiling}
          className="flex items-center px-4 py-2 text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black rounded-md transition duration-200 cursor-pointer"
        >
          {compiling ? "Compiling..." : "Run Sandbox"}
        </button>
        
        <div className="h-6 w-px bg-[#2d2d2d]" />
        
        <div className="flex items-center space-x-2">
          {status === "success" && (
            <span className="flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Sandbox Active
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Compile Error
            </span>
          )}
          {status === "timeout" && (
            <span className="flex items-center px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Timeout
            </span>
          )}
          {status === "idle" && (
            <span className="flex items-center px-3 py-1 bg-gray-500/10 border border-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
              Idle
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
