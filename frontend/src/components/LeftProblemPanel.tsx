import React, { useState } from "react";
import { EditorPanel } from "./EditorPanel";
import type { TestCase } from "../types/ui";
import { Code2, FileText, Terminal, Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";

interface LeftProblemPanelProps {
  code: string;
  setCode: (c: string) => void;
  problemStatement: string;
  setProblemStatement: (ps: string) => void;
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  activeTestCaseId: string;
  setActiveTestCaseId: (id: string) => void;
  isAnalyzing: boolean;
  activeLine: number;
  sessionId: string | null;
  onClearCode: () => void;
}

export const LeftProblemPanel: React.FC<LeftProblemPanelProps> = ({
  code,
  setCode,
  problemStatement,
  setProblemStatement,
  testCases,
  setTestCases,
  activeTestCaseId,
  setActiveTestCaseId,
  isAnalyzing,
  activeLine,
  sessionId,
  onClearCode
}) => {
  const [activeTab, setActiveTab] = useState<"code" | "problem" | "input">("code");

  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId) || testCases[0];

  const handleAddTestCase = () => {
    const newId = Date.now().toString();
    const newCase: TestCase = {
      id: newId,
      name: `Test Case ${testCases.length + 1}`,
      input: "nums = [3, 2, 4], target = 6",
      expectedOutput: "[1, 2]"
    };
    setTestCases((prev) => [...prev, newCase]);
    setActiveTestCaseId(newId);
  };

  const handleDeleteTestCase = (id: string) => {
    if (testCases.length <= 1) return; // Keep at least one
    const updated = testCases.filter((tc) => tc.id !== id);
    setTestCases(updated);
    if (activeTestCaseId === id) {
      setActiveTestCaseId(updated[0].id);
    }
  };

  const handleUpdateActiveTestCase = (field: "name" | "input" | "expectedOutput", value: string) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === activeTestCaseId ? { ...tc, [field]: value } : tc))
    );
  };

  return (
    <section className="w-1/2 flex flex-col h-full border-r border-[#27272a] bg-[#0f0f11] overflow-hidden">
      {/* 1. Single Clean Header Toolbar with 3 Tab Selectors & Single Clear Button */}
      <div className="h-11 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 text-xs font-mono flex items-center space-x-1.5 transition ${
              activeTab === "code"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400 font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Code Editor</span>
          </button>

          <button
            onClick={() => setActiveTab("problem")}
            className={`px-3 py-1.5 text-xs font-mono flex items-center space-x-1.5 transition ${
              activeTab === "problem"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400 font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Problem Statement</span>
          </button>

          <button
            onClick={() => setActiveTab("input")}
            className={`px-3 py-1.5 text-xs font-mono flex items-center space-x-1.5 transition ${
              activeTab === "input"
                ? "bg-[#27272a] text-white border-b-2 border-emerald-400 font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Cases ({testCases.length})</span>
          </button>
        </div>

        {/* Single Clean Clear Button */}
        {activeTab === "code" && (
          <button
            onClick={onClearCode}
            disabled={isAnalyzing}
            className="flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-mono transition disabled:opacity-50 cursor-pointer"
            title="Clear Editor Code"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 2. Full-Height Main Viewport Area (100% of Left Panel) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0f0f11]">
        {/* Tab 1: Full-Height Code Editor */}
        {activeTab === "code" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <EditorPanel
              code={code}
              setCode={setCode}
              isCompiling={isAnalyzing}
              activeLine={activeLine}
              sessionId={sessionId}
              onClear={onClearCode}
            />
          </div>
        )}

        {/* Tab 2: Full-Height Problem Statement Editor */}
        {activeTab === "problem" && (
          <div className="flex-1 flex flex-col h-full p-6 space-y-4 overflow-y-auto custom-scrollbar bg-[#0f0f11]">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Problem Statement & Specifications
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Markdown Enabled
              </span>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-xs font-mono text-gray-400 font-bold uppercase">
                Problem Description & Constraints (REQUIRED):
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Enter or paste full DSA problem statement, constraints, input/output limits..."
                className="flex-1 w-full min-h-100 p-4 bg-[#18181b] border border-[#27272a] text-xs font-sans text-gray-200 focus:outline-none focus:border-amber-500 leading-relaxed resize-none custom-scrollbar"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Full-Height Multiple Test Cases Manager */}
        {activeTab === "input" && (
          <div className="flex-1 flex h-full overflow-hidden bg-[#0f0f11]">
            {/* Test Case Selection Sidebar */}
            <div className="w-48 border-r border-[#27272a] bg-[#131316] flex flex-col p-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                <span className="text-[10px] font-mono font-bold uppercase text-gray-400">
                  Test Cases ({testCases.length})
                </span>
                <button
                  onClick={handleAddTestCase}
                  className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition text-xs flex items-center space-x-0.5 cursor-pointer"
                  title="Add New Test Case"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-[10px] font-mono font-bold">Add</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
                {testCases.map((tc) => {
                  const isActive = tc.id === activeTestCaseId;
                  return (
                    <button
                      key={tc.id}
                      onClick={() => setActiveTestCaseId(tc.id)}
                      className={`w-full p-2 text-left text-xs font-mono flex items-center justify-between border transition cursor-pointer ${
                        isActive
                          ? "bg-[#27272a] text-emerald-400 border-emerald-500/50 font-bold"
                          : "bg-[#18181b] text-gray-400 border-[#27272a] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <Terminal className="w-3 h-3 shrink-0" />
                        <span className="truncate">{tc.name}</span>
                      </div>
                      {isActive && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Case Content Editor */}
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {activeTestCase && (
                <>
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-5 h-5 text-sky-400" />
                      <input
                        type="text"
                        value={activeTestCase.name}
                        onChange={(e) => handleUpdateActiveTestCase("name", e.target.value)}
                        className="bg-[#18181b] border border-[#27272a] px-2 py-1 text-sm font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {testCases.length > 1 && (
                      <button
                        onClick={() => handleDeleteTestCase(activeTestCase.id)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Case</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 font-bold uppercase block">
                      Input Data / Parameters:
                    </label>
                    <textarea
                      rows={5}
                      value={activeTestCase.input}
                      onChange={(e) => handleUpdateActiveTestCase("input", e.target.value)}
                      placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                      className="w-full p-3 bg-[#18181b] border border-[#27272a] text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 font-bold uppercase block">
                      Expected Output (Optional):
                    </label>
                    <textarea
                      rows={3}
                      value={activeTestCase.expectedOutput || ""}
                      onChange={(e) => handleUpdateActiveTestCase("expectedOutput", e.target.value)}
                      placeholder="e.g. [0, 1]"
                      className="w-full p-3 bg-[#18181b] border border-[#27272a] text-xs font-mono text-gray-300 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="bg-[#131316] p-3 border border-[#27272a] text-[11px] font-mono text-gray-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Active test case data is sent to AlgoMentor AI when requesting analysis or dry runs.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
