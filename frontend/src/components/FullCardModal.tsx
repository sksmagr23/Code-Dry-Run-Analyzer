import React from "react";
import { X, Sparkles } from "lucide-react";
import type { UIComponentIntent } from "../types/ui";
import { ProblemSummaryCard } from "./cards/ProblemSummaryCard";
import { ApproachComplexityCard } from "./cards/ApproachComplexityCard";
import { BugAnalysisCard } from "./cards/BugAnalysisCard";
import { ImageViewerCard } from "./cards/ImageViewerCard";
import { SolutionComparisonCard } from "./cards/SolutionComparisonCard";

interface FullCardModalProps {
  intent: UIComponentIntent | null;
  onClose: () => void;
}

export const FullCardModal: React.FC<FullCardModalProps> = ({ intent, onClose }) => {
  if (!intent) return null;

  const props = intent.props || {};

  const renderCardContent = () => {
    switch (intent.type) {
      case "problem_summary":
        return <ProblemSummaryCard {...props} />;
      case "approach_card":
      case "complexity_card":
        return <ApproachComplexityCard {...props} />;
      case "bug_analysis":
      case "counterexample":
        return <BugAnalysisCard {...props} />;
      case "image_viewer":
        return <ImageViewerCard {...props} />;
      case "solution_comparison":
      case "corrected_code":
      case "optimization_card":
        return <SolutionComparisonCard {...props} />;
      default:
        return (
          <div className="bg-[#121214] p-4 font-mono text-xs text-gray-300">
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-[#3f3f46] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="h-12 bg-[#131316] border-b border-[#27272a] px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Expanded Analysis View • {intent.type.replace("_", " ")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#27272a] hover:bg-rose-600/20 text-gray-400 hover:text-rose-400 border border-[#3f3f46] hover:border-rose-500/30 transition cursor-pointer"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {renderCardContent()}
        </div>
      </div>
    </div>
  );
};
