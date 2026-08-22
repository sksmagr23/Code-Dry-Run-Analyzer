export type ComponentType =
  | "problem_summary"
  | "approach_card"
  | "bug_analysis"
  | "counterexample"
  | "complexity_card"
  | "solution_comparison"
  | "optimization_card"
  | "explanation"
  | "corrected_code"
  | "code_viewer"
  | "image_viewer";

export type ActionType =
  | "DRY_RUN"
  | "SHOW_COUNTEREXAMPLE"
  | "SHOW_FIX"
  | "SHOW_OPTIMAL"
  | "COMPARE"
  | "EXPLAIN_COMPLEXITY"
  | "VISUALIZE";

export interface ContextualAction {
  id: string;
  label: string;
  actionType: ActionType;
  payload?: Record<string, unknown>;
}

export interface UIComponentIntent {
  type: ComponentType;
  props: Record<string, unknown>;
  priority: number;
}

export interface UIPlan {
  layout?: "split" | "full" | "stacked";
  components: UIComponentIntent[];
  actions?: ContextualAction[];
  rationale?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  actions?: ContextualAction[];
  uiPlan?: UIPlan;
}

export interface Anomaly {
  type: string;
  message: string;
  line: number;
}

export interface ComplexityEstimation {
  time: string;
  space: string;
  rationale: string;
}

export interface BugAnalysis {
  issue: string;
  fix: string;
  code_fixed: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput?: string;
}

export interface AgentAnalysisResponse {
  anomalies: Anomaly[];
  complexity: ComplexityEstimation;
  bug_analysis: BugAnalysis;
  ui_plan: UIPlan;
}
