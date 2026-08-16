import React from "react";
import { Layers } from "lucide-react";
import type { VariableState } from "../services/api";

interface VariablesInspectorProps {
  variables: VariableState[];
}

export const VariablesInspector: React.FC<VariablesInspectorProps> = ({ variables }) => {
  return (
    <div className="flex-1 flex flex-col border-b border-[#2d2d2d] overflow-hidden">
      <div className="flex items-center px-6 py-3 bg-[#181818] border-b border-[#2d2d2d]">
        <Layers className="w-4 h-4 mr-2 text-yellow-500" />
        <span className="text-xs font-bold text-gray-300">Variables Inspector</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {variables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <p className="text-sm">No primitive variables tracked at this step.</p>
            <p className="text-xs">Compile and step forward to watch assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {variables.map((varItem) => (
              <div
                key={varItem.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition duration-200 ${
                  varItem.changed
                    ? "bg-yellow-500/10 border-yellow-500/40 text-white"
                    : "bg-[#1d1d1d] border-[#2d2d2d] text-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-semibold">{varItem.name}</span>
                  {varItem.changed && (
                    <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">
                      UPDATED
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {varItem.changed && varItem.prev_value !== null && (
                    <span className="text-xs text-gray-500 line-through font-mono">
                      {String(varItem.prev_value)}
                    </span>
                  )}
                  <span className="font-mono font-bold text-sm text-yellow-500">
                    {String(varItem.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
