import React, { useState } from "react";
import type { ChatMessage, ActionType, UIPlan, UIComponentIntent } from "../types/ui";
import { DynamicWorkspace } from "./DynamicWorkspace";
import { Bot, User, Sparkles, Play } from "lucide-react";

interface RightAgentWindowProps {
  messages: ChatMessage[];
  currentUIPlan: UIPlan | null;
  onSendMessage: (query: string) => void;
  onSelectAction: (actionType: ActionType, actionLabel: string) => void;
  onViewFullCard: (intent: UIComponentIntent) => void;
  isAnalyzing: boolean;
}

export const RightAgentWindow: React.FC<RightAgentWindowProps> = ({
  messages,
  currentUIPlan,
  onSendMessage,
  onSelectAction,
  onViewFullCard,
  isAnalyzing
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSendMessage(query);
    setQuery("");
  };

  return (
    <section className="w-1/2 flex flex-col h-full bg-[#18181b] overflow-hidden">
      {/* 1. Header (Agent Window Bar) */}
      <div className="h-10 px-4 bg-[#131316] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5 font-mono">
              <span>AlgoMentor AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Agent Window Active
          </span>
        </div>
      </div>

      {/* 2. Scrollable Agent Stream (Chat + Dynamic Components Inside Agent Window) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f0f11]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono text-gray-500">
              {msg.sender === "user" ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-emerald-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-400" />
                  <span>AlgoMentor AI</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 text-xs leading-relaxed max-w-[95%] whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white border border-emerald-500"
                  : "bg-[#18181b] text-gray-200 border border-[#27272a] font-mono"
              }`}
            >
              {msg.content}
            </div>

            {/* Contextual Action Chips */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                {msg.actions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => onSelectAction(act.actionType, act.label)}
                    className="px-2.5 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-emerald-300 hover:text-white border border-[#3f3f46] text-[11px] font-mono transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 p-3.5 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>Analyzing problem statement, solution logic & structure...</span>
          </div>
        )}

        {/* Dynamic Workspace Component Cards Rendered INSIDE Agent Window */}
        <div className="mt-4 pt-4 border-t border-[#27272a]">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-2 tracking-wider">
            Agent Visual Workspace Output
          </span>
          <DynamicWorkspace uiPlan={currentUIPlan} onViewFullCard={onViewFullCard} />
        </div>
      </div>

      {/* 3. Chat Input Console */}
      <div className="p-3 border-t border-[#27272a] bg-[#131316]">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything or request dry run, fix, optimal approach..."
            className="flex-1 px-3 py-2 bg-[#121214] border border-[#27272a] text-xs font-sans text-white focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-black text-xs font-bold font-mono transition flex items-center space-x-1 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </section>
  );
};
