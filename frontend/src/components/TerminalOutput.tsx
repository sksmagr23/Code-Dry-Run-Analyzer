import React from "react";
import { Terminal } from "lucide-react";

interface TerminalOutputProps {
  output: string[];
  errorMessage: string | null;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, errorMessage }) => {
  return (
    <div className="h-[40%] flex flex-col overflow-hidden bg-[#181818]">
      <div className="flex items-center justify-between px-6 py-3 bg-[#151515] border-b border-[#2d2d2d]">
        <div className="flex items-center">
          <Terminal className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="text-xs font-bold text-gray-300">Console Terminal Output</span>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto font-mono text-sm bg-[#101010] text-gray-300 select-text">
        {errorMessage ? (
          <div className="text-red-400 whitespace-pre-wrap leading-relaxed">
            [Compilation / Runtime Error]:<br />
            {errorMessage}
          </div>
        ) : output.length === 0 ? (
          <span className="text-gray-600">No output printed yet.</span>
        ) : (
          <div className="space-y-1">
            {output.map((lineText, idx) => (
              <div key={idx} className="leading-relaxed">
                {lineText}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
