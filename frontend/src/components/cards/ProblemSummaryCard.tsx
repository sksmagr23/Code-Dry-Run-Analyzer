import React from "react";
import { FileText, Tag, CheckCircle2, Maximize2 } from "lucide-react";

interface ProblemSummaryCardProps {
  title?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  statement?: string;
  constraints?: string[];
  inputBounds?: string;
  onViewFull?: () => void;
}

export const ProblemSummaryCard: React.FC<ProblemSummaryCardProps> = ({
  title = "Two Sum",
  difficulty = "Easy",
  statement = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  constraints = [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  inputBounds,
  onViewFull
}) => {
  const difficultyColors = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-4">
      <div className="h-9 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Problem Summary & Constraints
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 border ${difficultyColors[difficulty]}`}>
            {difficulty}
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
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>{title}</span>
          </h3>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            {statement}
          </p>
        </div>

        {inputBounds && (
          <div className="text-xs font-mono bg-[#121214] p-2 border border-[#27272a] text-gray-300">
            <span className="text-gray-500 uppercase text-[10px] block font-bold mb-1">Target Constraints</span>
            {inputBounds}
          </div>
        )}

        <div>
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5 flex items-center">
            <Tag className="w-3 h-3 mr-1 text-emerald-400" /> Key Constraints
          </span>
          <ul className="space-y-1">
            {constraints.map((c, i) => (
              <li key={i} className="text-xs font-mono text-gray-400 flex items-center space-x-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="bg-[#121214] px-1.5 py-0.5 border border-[#27272a]">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
