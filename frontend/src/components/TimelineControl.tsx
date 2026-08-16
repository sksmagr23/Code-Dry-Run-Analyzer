import React from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

interface TimelineControlProps {
  sessionId: string | null;
  step: number;
  totalSteps: number;
  activeLine: number;
  inputData: string;
  setInputData: (val: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playSpeed: number;
  setPlaySpeed: (speed: number) => void;
  onStep: (direction: "forward" | "backward") => void;
  onJump: (targetStep: number) => void;
  onRestart: () => void;
  isCompiling: boolean;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  sessionId,
  step,
  totalSteps,
  activeLine,
  inputData,
  setInputData,
  isPlaying,
  setIsPlaying,
  playSpeed,
  setPlaySpeed,
  onStep,
  onJump,
  onRestart,
  isCompiling
}) => {
  return (
    <footer className="flex flex-col border-t border-[#2d2d2d] bg-[#1a1a1a] px-6 py-4 space-y-4">
      
      {/* 1. Timeline Slider & Indicators */}
      <div className="flex items-center justify-between space-x-6">
        <div className="flex items-center space-x-3 w-37.5">
          <span className="text-xs text-gray-400 font-semibold uppercase">Step timeline</span>
          <span className="text-xs px-2 py-0.5 bg-[#2d2d2d] text-white rounded font-mono">
            {sessionId ? `${step} / ${totalSteps}` : "0 / 0"}
          </span>
        </div>
        
        <input
          type="range"
          min={1}
          max={totalSteps || 1}
          value={step}
          disabled={!sessionId || totalSteps <= 1}
          onChange={(e) => onJump(Number(e.target.value))}
          className="flex-1 h-1.5 bg-[#2d2d2d] rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-50"
        />
        
        <div className="w-30 text-right">
          <span className="text-xs text-gray-400 font-semibold uppercase">Active line: </span>
          <span className="text-xs font-mono font-bold text-yellow-500">
            {sessionId ? activeLine : "-"}
          </span>
        </div>
      </div>

      {/* 2. Timeline Controls Panel */}
      <div className="flex items-start justify-between">
        
        {/* Multi-line STDIN Input Textarea (Fixes the \n and single line issue) */}
        <div className="flex flex-col space-y-1.5 w-75">
          <span className="text-xs text-gray-400 font-semibold uppercase">STDIN Input (Multi-line):</span>
          <textarea
            rows={3}
            placeholder="e.g.&#10;5&#10;1 8 6 2 5"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            disabled={isCompiling}
            className="px-3 py-2 bg-[#121212] border border-[#2d2d2d] focus:border-yellow-500 rounded text-xs text-white outline-none transition resize-none font-mono"
          />
        </div>

        {/* Remote Playback Buttons (Centered vertically with STDIN) */}
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => onStep("backward")}
            disabled={!sessionId || step <= 1}
            className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-md transition cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!sessionId || totalSteps <= 1}
            className="p-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-md transition font-semibold cursor-pointer"
            title={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => onStep("forward")}
            disabled={!sessionId || step >= totalSteps}
            className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-md transition cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRestart}
            disabled={!sessionId}
            className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-md transition cursor-pointer"
            title="Restart execution"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment (Centered vertically with STDIN) */}
        <div className="flex items-center space-x-3 w-50 justify-end mt-4">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Speed:</span>
          <select
            value={playSpeed}
            onChange={(e) => setPlaySpeed(Number(e.target.value))}
            disabled={!sessionId}
            className="bg-[#2d2d2d] border border-[#3d3d3d] text-xs px-2 py-1 rounded text-white outline-none cursor-pointer"
          >
            <option value={1500}>0.5x Slow</option>
            <option value={800}>1.0x Normal</option>
            <option value={400}>2.0x Fast</option>
            <option value={150}>5.0x Turbo</option>
          </select>
        </div>

      </div>
    </footer>
  );
};
