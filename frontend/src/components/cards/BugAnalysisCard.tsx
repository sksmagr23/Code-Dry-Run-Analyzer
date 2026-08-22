import React from "react";
import { AlertCircle, Wrench, Terminal, Maximize2 } from "lucide-react";

interface BugAnalysisCardProps {
  issue?: string;
  fix?: string;
  counterexampleInput?: string;
  expectedOutput?: string;
  actualOutput?: string;
  onViewFull?: () => void;
}

export const BugAnalysisCard: React.FC<BugAnalysisCardProps> = ({
  issue = "Missing Base Case in Recursion / Loop Boundary Overflow",
  fix = "Add base condition `if (n <= 1) return n;` to terminate recursion before negative values.",
  counterexampleInput = "nums = [3, 2, 4], target = 6",
  expectedOutput = "[1, 2]",
  actualOutput = "Stack Overflow / Segmentation Fault",
  onViewFull
}) => {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-4">
      <div className="h-9 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Bug Diagnosis & Counterexample
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Logical Bug Detected
          </span>
          {onViewFull && (
            <button
              onClick={onViewFull}
              className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 bg-[#27272a] hover:bg-[#3f3f46] text-emerald-300 border border-[#3f3f46] transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>View Full</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-rose-500/5 p-3 border border-rose-500/20">
          <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">Issue Identified</span>
          <p className="text-xs text-gray-200 leading-relaxed font-mono">
            {issue}
          </p>
        </div>

        <div className="bg-emerald-500/5 p-3 border border-emerald-500/20">
          <div className="flex items-center space-x-1.5 mb-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase text-emerald-400">Recommended Fix</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-mono">
            {fix}
          </p>
        </div>

        {(counterexampleInput || expectedOutput) && (
          <div className="bg-[#121214] p-3 border border-[#27272a] space-y-2">
            <div className="flex items-center space-x-1 text-gray-400">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase text-gray-300">Failing Counterexample Case</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-gray-500 block">Input:</span>
                <span className="text-amber-400 bg-[#18181b] px-2 py-1 block border border-[#27272a] truncate">
                  {counterexampleInput}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Expected:</span>
                <span className="text-emerald-400 bg-[#18181b] px-2 py-1 block border border-[#27272a] truncate">
                  {expectedOutput}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Actual:</span>
                <span className="text-rose-400 bg-[#18181b] px-2 py-1 block border border-[#27272a] truncate">
                  {actualOutput}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
