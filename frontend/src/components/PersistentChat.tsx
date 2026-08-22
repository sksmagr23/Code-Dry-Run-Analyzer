import React, { useState } from "react";
import type { ChatMessage, ActionType } from "../types/ui";
import { Send, Bot, User, Sparkles, FileText, Code2, Play, Terminal } from "lucide-react";

interface PersistentChatProps {
  messages: ChatMessage[];
  onSendMessage: (query: string, problemStatement: string, userCode: string, testInput: string) => void;
  onSelectAction: (actionType: ActionType, actionLabel: string) => void;
  isAnalyzing: boolean;
  code: string;
  setCode: (c: string) => void;
}

export const PersistentChat: React.FC<PersistentChatProps> = ({
  messages,
  onSendMessage,
  onSelectAction,
  isAnalyzing,
  code,
  setCode
}) => {
  const [query, setQuery] = useState("");
  const [problemStatement, setProblemStatement] = useState(
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
  );
  const [testInput, setTestInput] = useState("nums = [2, 7, 11, 15], target = 9");
  const [activeInputTab, setActiveInputTab] = useState<"query" | "problem" | "code" | "input">("query");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !problemStatement.trim()) return;
    onSendMessage(query, problemStatement, code, testInput);
    setQuery("");
  };

  return (
    <aside className="w-115 border-l border-[#27272a] bg-[#18181b] flex flex-col h-full shrink-0 z-10">
      {/* 1. Header (Stitch Agent Bar) */}
      <div className="h-14 px-5 border-b border-[#27272a] bg-[#131316] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>CodeMentor AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] font-mono text-gray-400">Persistent AI DSA Mentor</p>
          </div>
        </div>

        <div className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Agent Active
        </div>
      </div>

      {/* 2. Scrollable Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                  <span>CodeMentor AI</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3 text-xs leading-relaxed max-w-[95%] whitespace-pre-wrap font-sans ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-none border border-emerald-500"
                  : "bg-[#121214] text-gray-200 rounded-none border border-[#27272a] font-mono"
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
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 p-3 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>Analyzing problem statement and solution code...</span>
          </div>
        )}
      </div>

      {/* 3. Input Console & Context Tabs Drawer */}
      <div className="border-t border-[#27272a] bg-[#131316] p-3 space-y-2">
        {/* Input Drawer Tabs */}
        <div className="flex items-center border-b border-[#27272a] pb-1 space-x-1 text-[11px] font-mono">
          <button
            onClick={() => setActiveInputTab("query")}
            className={`px-2 py-1 flex items-center space-x-1 transition ${
              activeInputTab === "query"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Send className="w-3 h-3 text-emerald-400" />
            <span>Chat Request</span>
          </button>

          <button
            onClick={() => setActiveInputTab("problem")}
            className={`px-2 py-1 flex items-center space-x-1 transition ${
              activeInputTab === "problem"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>Problem</span>
          </button>

          <button
            onClick={() => setActiveInputTab("code")}
            className={`px-2 py-1 flex items-center space-x-1 transition ${
              activeInputTab === "code"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Code2 className="w-3 h-3 text-indigo-400" />
            <span>Solution Code</span>
          </button>

          <button
            onClick={() => setActiveInputTab("input")}
            className={`px-2 py-1 flex items-center space-x-1 transition ${
              activeInputTab === "input"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-3 h-3 text-sky-400" />
            <span>Test Case</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeInputTab === "problem" && (
          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
              Problem Statement (Required):
            </label>
            <textarea
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Paste DSA Problem description..."
              className="w-full p-2 bg-[#121214] border border-[#27272a] text-xs font-sans text-gray-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        )}

        {activeInputTab === "code" && (
          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
              User Solution / Snippet / Class (Required):
            </label>
            <textarea
              rows={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste C++ Solution function or class..."
              className="w-full p-2 bg-[#121214] border border-[#27272a] text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        )}

        {activeInputTab === "input" && (
          <div>
            <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
              Optional Input / Example Case:
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. nums = [2,7,11,15], target = 9"
              className="w-full p-2 bg-[#121214] border border-[#27272a] text-xs font-mono text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Chat Query Form */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything or request a dry run..."
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
    </aside>
  );
};
