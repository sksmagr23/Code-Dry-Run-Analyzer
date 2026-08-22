import React from "react";
import { GitCompare, CheckCircle2, ArrowRight, Maximize2 } from "lucide-react";

interface SolutionComparisonCardProps {
  userApproach?: string;
  userTime?: string;
  userSpace?: string;
  optimalApproach?: string;
  optimalTime?: string;
  optimalSpace?: string;
  correctedCode?: string;
  optimalCode?: string;
  onViewFull?: () => void;
}

export const SolutionComparisonCard: React.FC<SolutionComparisonCardProps> = ({
  userApproach = "Nested Loop Brute Force",
  userTime = "O(N²)",
  userSpace = "O(1)",
  optimalApproach = "Hash Map Single-Pass Lookup",
  optimalTime = "O(N)",
  optimalSpace = "O(N)",
  correctedCode,
  optimalCode = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (mp.count(complement)) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
  onViewFull
}) => {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-4">
      <div className="h-9 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Solution & Complexity Comparison
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Optimization Available
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

      <div className="p-4 space-y-4">
        {/* Comparison Matrix */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {/* User Approach Column */}
          <div className="bg-[#121214] p-3 border border-[#27272a] space-y-2">
            <span className="text-[10px] font-bold uppercase text-amber-400 block border-b border-[#27272a] pb-1">
              Your Current Approach
            </span>
            <div className="space-y-1 text-gray-300">
              <p className="font-semibold text-white">{userApproach}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Time:</span>
                <span className="text-amber-400 font-bold">{userTime}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Space:</span>
                <span className="text-gray-300 font-bold">{userSpace}</span>
              </div>
            </div>
          </div>

          {/* Optimal Approach Column */}
          <div className="bg-[#121214] p-3 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-400 border-b border-[#27272a] pb-1 flex items-center justify-between">
              <span>Optimal Approach</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </span>
            <div className="space-y-1 text-gray-300">
              <p className="font-semibold text-white">{optimalApproach}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Time:</span>
                <span className="text-emerald-400 font-bold">{optimalTime}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Space:</span>
                <span className="text-indigo-400 font-bold">{optimalSpace}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Viewer (Corrected / Optimal Code) */}
        {(correctedCode || optimalCode) && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span>{correctedCode ? "Corrected Code Fix" : "Optimal Solution Code"}</span>
              </span>
            </div>
            <pre className="bg-[#121214] p-3 border border-[#27272a] font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{correctedCode || optimalCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
