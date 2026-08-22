import React from "react";
import { Cpu, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

interface HeaderProps {
  status: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, onAnalyze, isAnalyzing }) => {
  return (
    <header className="h-14 px-6 border-b border-[#27272a] bg-[#131316] flex items-center justify-between z-20">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
            <span>CodeMentor AI</span>
            
          </h1>
          <p className="text-[11px] text-gray-400">DSA Learning, Debugging & Educational Visual Workspace</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-black transition duration-200 cursor-pointer border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>{isAnalyzing ? "Analyzing Solution..." : "Analyze Solution"}</span>
        </button>
        
        <div className="h-5 w-px bg-[#27272a]" />
        
        <div className="flex items-center space-x-2">
          {status === "success" && (
            <span className="flex items-center px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <CheckCircle className="w-3 h-3 mr-1" /> Sandbox Active
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono">
              <AlertCircle className="w-3 h-3 mr-1" /> Compile Error
            </span>
          )}
          {status === "idle" && (
            <span className="flex items-center px-2.5 py-1 bg-[#27272a] text-gray-400 text-[11px] font-mono">
              Agent Idle
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
