import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { LeftProblemPanel } from "./components/LeftProblemPanel";
import { RightAgentWindow } from "./components/RightAgentWindow";
import { FullCardModal } from "./components/FullCardModal";
import type { ChatMessage, ActionType, UIPlan, UIComponentIntent, TestCase } from "./types/ui";

const DEFAULT_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};
`;

export default function App() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [problemStatement, setProblemStatement] = useState<string>(
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
  );
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      name: "Test Case 1",
      input: "nums = [2, 7, 11, 15], target = 9",
      expectedOutput: "[0, 1]"
    },
    {
      id: "2",
      name: "Test Case 2",
      input: "nums = [3, 2, 4], target = 6",
      expectedOutput: "[1, 2]"
    }
  ]);
  const [activeTestCaseId, setActiveTestCaseId] = useState<string>("1");

  const [sessionId] = useState<string | null>(null);
  const [activeLine] = useState<number>(1);
  const [status] = useState<string>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentUIPlan, setCurrentUIPlan] = useState<UIPlan | null>(null);
  const [selectedFullCard, setSelectedFullCard] = useState<UIComponentIntent | null>(null);

  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId) || testCases[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "agent",
      content: "Welcome to CodeMentor AI! Provide a problem statement and solution code on the left panel, and ask me to explain, debug, optimize, or dry run your solution.",
      timestamp: "Just now",
      actions: [
        { id: "a1", label: "🔍 Show Dry Run", actionType: "DRY_RUN" },
        { id: "a2", label: "⚡ Show Fix", actionType: "SHOW_FIX" },
        { id: "a3", label: "🚀 Optimal Solution", actionType: "SHOW_OPTIMAL" },
        { id: "a4", label: "📊 Compare Complexity", actionType: "COMPARE" }
      ]
    }
  ]);

  const handleClearCode = useCallback(() => {
    setCode("");
  }, []);

  const handleSendMessage = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: queryText || "Analyze my solution against the problem statement.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    // Simulated Agent Analysis & UIPlan Composition
    setTimeout(() => {
      const queryLower = queryText.toLowerCase();
      const isDryRunReq = queryLower.includes("dry run") || queryLower.includes("visualize");
      
      const activeInputText = activeTestCase ? activeTestCase.input : "nums = [2, 7, 11, 15], target = 9";

      const newPlan: UIPlan = {
        layout: "split",
        rationale: isDryRunReq 
          ? "Educational dry-run image viewer loaded for step execution visualization."
          : "Problem summary, complexity analysis, and optimal solution comparison loaded for Two Sum solution.",
        components: isDryRunReq
          ? [
              { type: "image_viewer", props: { promptSummary: `Visualizing step execution for input: ${activeInputText}` }, priority: 10 },
              { type: "problem_summary", props: { statement: problemStatement }, priority: 8 },
              { type: "approach_card", props: { algorithm: "Nested Loop Brute Force", timeComplexity: "O(N²)", spaceComplexity: "O(1)" }, priority: 6 }
            ]
          : [
              { type: "problem_summary", props: { statement: problemStatement }, priority: 10 },
              { type: "approach_card", props: { algorithm: "Nested Loop Brute Force", timeComplexity: "O(N²)", spaceComplexity: "O(1)", rationale: "Two nested loops iterate through array pairs. quadratic time growth O(N²)." }, priority: 8 },
              { type: "solution_comparison", props: { userApproach: "Nested Loop", userTime: "O(N²)", optimalApproach: "Hash Map Lookup", optimalTime: "O(N)" }, priority: 6 }
            ]
      };

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        content: isDryRunReq
          ? "Here is the step-by-step visual dry run generated for your solution. Click [View Full] on any component card to view comprehensive details."
          : "I analyzed your approach against the problem statement. Your code uses a nested loop brute force approach running in O(N²) time. You can optimize this to O(N) single-pass using an unordered_map hash table.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { id: "a1", label: "🔍 Show Dry Run", actionType: "DRY_RUN" },
          { id: "a3", label: "⚡ Show Fix", actionType: "SHOW_FIX" },
          { id: "a4", label: "🚀 Optimal Solution", actionType: "SHOW_OPTIMAL" },
          { id: "a5", label: "📊 Compare Complexity", actionType: "COMPARE" }
        ],
        uiPlan: newPlan
      };

      setCurrentUIPlan(newPlan);
      setMessages((prev) => [...prev, agentMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleSelectAction = (actionType: ActionType, actionLabel: string) => {
    handleSendMessage(`[Action Selected: ${actionLabel}] Requesting ${actionType} analysis.`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11] text-gray-200 overflow-hidden font-sans select-none">
      <Header
        status={status}
        onAnalyze={() => handleSendMessage("Analyze my solution and suggest optimizations.")}
        isAnalyzing={isAnalyzing}
      />
      
      {/* 50/50 Dual Panel Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left 50% Panel: Code Editor, Problem Statement PS, Multiple Test Cases */}
        <LeftProblemPanel
          code={code}
          setCode={setCode}
          problemStatement={problemStatement}
          setProblemStatement={setProblemStatement}
          testCases={testCases}
          setTestCases={setTestCases}
          activeTestCaseId={activeTestCaseId}
          setActiveTestCaseId={setActiveTestCaseId}
          isAnalyzing={isAnalyzing}
          activeLine={activeLine}
          sessionId={sessionId}
          onClearCode={handleClearCode}
        />

        {/* Right 50% Panel: AI Agent Window (Chat + Dynamic Components Inline) */}
        <RightAgentWindow
          messages={messages}
          currentUIPlan={currentUIPlan}
          onSendMessage={handleSendMessage}
          onSelectAction={handleSelectAction}
          onViewFullCard={(intent) => setSelectedFullCard(intent)}
          isAnalyzing={isAnalyzing}
        />
      </main>

      {/* Full Card Centered Modal Overlay (Triggered by [ View Full ] button) */}
      <FullCardModal
        intent={selectedFullCard}
        onClose={() => setSelectedFullCard(null)}
      />
    </div>
  );
}
