import React from "react";
import { Cpu, Clock, HardDrive, AlertTriangle, Maximize2 } from "lucide-react";

interface ApproachComplexityCardProps {
  algorithm?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  rationale?: string;
  isOptimal?: boolean;
  onViewFull?: () => void;
}

export const ApproachComplexityCard: React.FC<ApproachComplexityCardProps> = ({
  algorithm = "Nested Loop Brute Force",
  timeComplexity = "O(N²)",
  spaceComplexity = "O(1)",
  rationale = "The solution uses two nested loops to check all pairs of elements. This causes quadratic time growth as N increases.",
  isOptimal = false,
  onViewFull
}) => {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-4">
      <div className="h-9 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Approach & Algorithmic Complexity
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 border ${
            isOptimal 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {isOptimal ? "Optimal Approach" : "Suboptimal"}
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
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Detected Approach</span>
            <h4 className="text-sm font-semibold text-white font-mono">{algorithm}</h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121214] p-3 border border-[#27272a] flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Time Complexity</span>
              <span className="text-sm font-bold font-mono text-indigo-400">{timeComplexity}</span>
            </div>
          </div>

          <div className="bg-[#121214] p-3 border border-[#27272a] flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Space Complexity</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{spaceComplexity}</span>
            </div>
          </div>
        </div>

        <div className="text-xs bg-[#121214] p-3 border border-[#27272a] text-gray-400 leading-relaxed flex items-start space-x-2">
          {!isOptimal && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          <div>
            <span className="font-bold text-gray-300 block mb-0.5">Complexity Rationale:</span>
            {rationale}
          </div>
        </div>
      </div>
    </div>
  );
};
