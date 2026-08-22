Update `agents.md` to reflect the final refined product vision of the Code Dry-Run Analyzer.

IMPORTANT:
- First inspect the current repository and existing `agents.md`.
- Preserve the existing architecture wherever it is still valid.
- Do NOT implement application code.
- Do NOT start Phase 5 implementation.
- Only update `agents.md` and the phased architecture/implementation plan.
- Clearly distinguish what is already implemented, partially implemented, and planned.
- Do not invent implementation status; determine it from the repository and existing `agents.md`.

# PRODUCT VISION

The project should evolve from a code dry-run visualizer into an AI-powered DSA learning, debugging, and optimization assistant.

The primary experience should be similar to a LeetCode-style problem-solving mentor.

The user provides:

1. A DSA problem statement — REQUIRED
2. Their solution/code — REQUIRED
3. Optional input/example/test case
4. A natural-language request

The user's solution may be:

- a complete C++ program
- a LeetCode-style C++ `class Solution`
- only a solution function
- a relevant C++ code snippet

The core product MUST NOT require a complete executable C++ program, `main()`, compilation, or execution.

Example:

Problem:
"Given an array of integers and a target, return indices of two numbers that add up to the target."

User solution:

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        ...
    }
};
```

The Agent should be able to analyze this directly using the problem statement + user solution.

Example user requests:

* "Explain my approach."
* "Is my solution correct?"
* "Why is my solution wrong?"
* "What is wrong with my logic?"
* "Dry run my solution."
* "Show where my logic fails."
* "Give me a counterexample."
* "Suggest a fix."
* "Give me a better approach."
* "Compare my solution with the optimal approach."
* "What is the time complexity?"
* "Can this be optimized?"

The final product should feel like an AI DSA mentor, not a C++ compiler/debugger.

# CORE PRODUCT PRINCIPLE

The primary flow is:

Problem Statement
+
User Solution
+
Optional Input
↓
Persistent Chat
↓
Agent / Query Analyzer
↓
Problem Understanding
↓
User Approach Analysis
↓
Correctness / Bug / Optimization Analysis
↓
Normal Response
OR
Dynamic Workspace
OR
Normal Response + Contextual Actions

The problem statement is essential because correctness must be evaluated against what the problem actually asks.

If the user provides code without a problem statement and the intended problem cannot be reliably determined, the Agent should ask for the problem rather than guessing.

# PERSISTENT CHAT-FIRST UI

The chat window MUST always remain visible.

It is a permanent part of the application UI.

Dynamic UI must never replace the conversation.

Conceptually:

┌──────────────────────────────────────────────┐
│                                              │
│             Dynamic Workspace                │
│                                              │
│ Problem Summary / Approach / Analysis /      │
│ Comparison / Dry-Run Image / Code            │
│                                              │
├──────────────────────────────────────────────┤
│                Persistent Chat               │
│                                              │
│ Agent messages                               │
│ User messages                                │
│ Contextual action chips                      │
│                                              │
│ [ Ask anything...                      Send ]│
└──────────────────────────────────────────────┘

The exact layout can evolve, but the chat must always remain accessible.

The user must be able to continue asking questions while viewing:

* problem analysis
* approach analysis
* bug analysis
* corrected code
* optimal approach
* comparison
* dry-run image
* other Dynamic UI

The Dynamic Workspace is a visual/action layer around the conversation, NOT a replacement for the conversation.

# CORE ARCHITECTURAL INVARIANTS

Maintain these boundaries:

Agent = problem understanding, reasoning, debugging, optimization, explanation, action planning, UI planning
Frontend Component Registry = rendering
Persistent Chat = conversational control layer
Dynamic Workspace = visual/interactive presentation layer
Gemini Image Generation = on-demand educational visualization

If existing execution infrastructure remains in the repository:

Execution/Sandbox = optional verified runtime capability
Trace Analyzer = optional verified execution facts

Execution must NOT be a required dependency of the primary DSA analysis experience.

The Agent must NEVER:

* pretend to execute C++
* invent verified runtime values
* claim an AI-generated visualization is actual runtime evidence
* require a complete executable program for conceptual analysis
* invent arbitrary frontend actions

# PROBLEM UNDERSTANDING

Add a first-class `ProblemUnderstanding` concept.

The Agent should extract:

* problem objective
* input requirements
* output requirements
* constraints
* important observations
* edge cases
* relevant DSA pattern/technique
* expected complexity where inferable

The Agent should use this context when evaluating the user's solution.

# USER APPROACH

Add a `UserApproach` concept containing:

* algorithm/technique
* high-level idea
* data structures
* intended reasoning
* correctness status
* detected issues
* time complexity
* space complexity
* relevant edge cases
* strengths
* weaknesses

Classify the solution where possible as:

* correct and optimal
* correct but suboptimal
* conceptually correct but implementation is wrong
* incorrect approach
* partially correct
* insufficient information to determine correctness

The Agent should explain why it classified the solution that way.

# SOLUTION ANALYSIS

The Agent should analyze the user's solution against the problem statement.

The analysis should determine:

1. What the problem asks.
2. What the user is trying to do.
3. What algorithm/technique the user is using.
4. Whether the algorithm is appropriate.
5. Whether the implementation matches the intended algorithm.
6. Whether constraints are satisfied.
7. Whether edge cases are handled.
8. Where the solution fails, if it fails.
9. Why it fails.
10. How to fix it.
11. Whether a more optimal approach exists.
12. Time and space complexity.

This analysis must work directly on LeetCode-style functions and code snippets without requiring compilation.

# SOLUTION CANDIDATES

Add a `SolutionCandidate` concept:

* type: user / fixed / optimal
* source code
* approach
* explanation
* time complexity
* space complexity
* tradeoffs

Possible candidates:

User Solution
↓
Fixed Solution
↓
Optimal Solution

Not every request requires all three.

Only generate a fixed or optimal solution when relevant.

# CORRECTNESS ANALYSIS

When the user's solution is wrong, the Agent should explain:

1. What the problem requires.
2. What the user's approach is.
3. Where the approach or implementation diverges from the requirement.
4. The exact logical issue when identifiable.
5. Why the issue occurs.
6. A counterexample/failing input when useful.
7. The corrected approach.
8. Optional corrected code.

Example:

Problem:
"Find the maximum subarray sum."

User provides an incorrect implementation.

Agent response:

* Explain the intended approach.
* Identify the incorrect state transition.
* Provide a small counterexample.
* Explain why it fails.
* Suggest the corrected approach.

Then optionally provide:

[ Show Counterexample ]
[ Show Dry Run ]
[ Show Corrected Approach ]

Do not automatically generate a dry-run image unless requested.

# OPTIMAL APPROACH

If the user's solution is correct but suboptimal:

* acknowledge that it is correct
* explain its current complexity
* identify the bottleneck
* suggest a better approach
* explain why it is better
* compare both approaches
* optionally offer dry runs

Example:

User approach:
O(N²), correct.

Optimal approach:
O(N), using a hash map.

Actions:

[ Compare Approaches ]
[ Show My Dry Run ]
[ Show Optimal Dry Run ]

# CONTEXTUAL ACTION CHIPS

Normal Agent responses should remain focused.

When deeper analysis could be useful, provide contextual action chips below the response.

Examples:

[ Show Dry Run ]
[ Show Counterexample ]
[ Show Corrected Approach ]
[ Show Optimal Approach ]
[ Compare Approaches ]
[ Explain Complexity ]
[ Visualize ]

A chip is an action invitation, not automatic execution.

If the user does not ask for a dry run, do NOT automatically generate one.

Use a controlled action registry such as:

* DRY_RUN
* SHOW_COUNTEREXAMPLE
* SHOW_FIX
* SHOW_OPTIMAL
* COMPARE
* EXPLAIN_COMPLEXITY
* VISUALIZE

The Agent may select relevant actions but must NOT invent arbitrary frontend actions.

# DRY-RUN PHILOSOPHY

Dry runs are OPTIONAL.

The product should NOT automatically generate a dry-run image for every question.

If the user asks:

"Explain my approach."

Respond with an explanation and optionally:

[ Show Dry Run ]

If the user asks:

"Why is my solution wrong?"

Explain the bug and optionally:

[ Show Failing Dry Run ]

Only generate the dry-run visualization when:

* the user explicitly asks for it, OR
* the user selects a relevant contextual action.

This reduces token usage, latency, cost, and visual clutter.

# GEMINI-GENERATED DRY-RUN VISUALIZATION

Do NOT create algorithm-specific React components for dry runs.

Do NOT create separate frontend components for:

* array visualization
* pointer visualization
* recursion trees
* graph traversal
* tree traversal
* algorithm-specific variable visualization
* algorithm-specific execution diagrams

All educational dry-run visualizations should be generated as images using Gemini image generation.

The frontend should only provide a generic `image_viewer` / visualization container.

The intended flow is:

User requests dry run
↓
Agent analyzes:

* problem
* solution
* optional input
  ↓
  Agent determines important steps/state
  ↓
  Structured dry-run reasoning
  ↓
  Gemini image generation
  ↓
  Generated dry-run image
  ↓
  Generic image viewer
  ↓
  Persistent Chat remains visible

The generated image may visually communicate:

* array/state
* pointers
* important variables
* iterations
* comparisons
* state transitions
* recursion
* graph/tree traversal
* incorrect steps
* expected vs actual behavior

The visualization should be specific to the problem and user's approach.

# DRY RUN WITHOUT EXECUTION

A dry run does NOT require compilation or execution.

For example:

Problem:
Two Sum

User solution:
LeetCode-style `class Solution` or function.

Input:
`nums = [2,7,11,15], target = 9`

User:
"Dry run this."

Flow:

Problem + User Solution + Input
↓
Agent reasoning
↓
Structured dry-run steps
↓
Gemini image generation
↓
Dry-run image

No compiler, `main()`, sandbox, or runtime trace is required for this interaction.

# IMAGE GENERATION TRUTH MODEL

Gemini-generated images are educational visualizations.

They are NOT authoritative runtime evidence.

The Agent must reason about the dry run before requesting image generation.

The image-generation model must not independently determine:

* algorithmic correctness
* actual runtime values
* exact execution order
* runtime output

The logical source for the visualization is:

Problem
+
User Solution
+
Agent Analysis
+
Optional Input

The generated image is only the presentation layer.

# IMAGE GENERATION COST

Do NOT generate images automatically for every response.

Normal response:

"Your approach uses a hash map and runs in O(N) time."

Then optionally:

[ Show Dry Run ]
[ Explain Complexity ]
[ Compare With Brute Force ]

Only generate the image after the user explicitly requests it or selects the corresponding action.

# DYNAMIC UI

Keep the Dynamic UI intentionally small and generic.

Potential components:

* problem_summary
* approach_card
* bug_analysis
* counterexample
* complexity_card
* solution_comparison
* optimization_card
* explanation
* corrected_code
* code_viewer
* image_viewer

Do NOT create algorithm-specific visualization components.

Specifically do NOT create:

* array_visualizer
* pointer_visualizer
* recursion_tree
* graph_visualizer
* tree_visualizer
* algorithm-specific dry-run components

All dry-run visualizations are Gemini-generated images displayed through `image_viewer`.

The Agent should choose only the minimum useful UI for the current request.

# UIPLAN

UIPlan controls the Dynamic Workspace.

It does NOT replace persistent chat.

Conceptually:

Persistent Chat
+
Dynamic Workspace
+
Contextual Actions

Example:

```json
{
  "layout": "split",
  "components": [
    {
      "type": "problem_summary"
    },
    {
      "type": "approach_card"
    },
    {
      "type": "bug_analysis"
    }
  ]
}
```

For a requested dry run:

```json
{
  "layout": "full",
  "components": [
    {
      "type": "image_viewer"
    }
  ]
}
```

The image viewer displays the Gemini-generated visualization.

# AGENT RESPONSIBILITIES

Gemini 2.5 Flash should handle:

* problem understanding
* intent detection
* user approach interpretation
* correctness reasoning
* bug diagnosis
* counterexample generation
* fix generation
* optimal approach generation
* complexity analysis
* conceptual dry-run planning
* explanation
* deciding whether Dynamic UI is useful
* deciding which contextual actions are useful
* generating UIPlan
* preparing structured information for Gemini image generation

The Agent must NOT:

* pretend to execute C++
* claim exact runtime behavior without verified execution evidence
* invent runtime values and present them as actual execution
* claim generated images are runtime evidence
* require a complete executable program for conceptual analysis
* invent arbitrary UI actions

# NO EXECUTION DEPENDENCY FOR THE CORE PRODUCT

The core product MUST NOT depend on:

* compiling the user's C++
* executing the user's code
* requiring a `main()` function
* requiring a complete C++ program
* pause/play controls
* step-by-step debugger controls
* runtime traces

The primary experience is conceptual DSA analysis based on:

Problem Statement
+
User Solution
+
Optional Input

The user should be able to provide a LeetCode-style function and receive useful analysis without compilation.

If existing sandbox/execution infrastructure exists, preserve it where valid, but treat it as optional infrastructure rather than a required part of the primary product.

Do not make execution a prerequisite for:

* problem understanding
* approach analysis
* correctness reasoning
* bug explanation
* complexity analysis
* optimal approach generation
* conceptual dry runs

# OPTIONAL FUTURE EXECUTION

If the existing execution engine remains in the project, document it as an optional future capability.

It may support cases where the user explicitly wants verified runtime behavior and provides executable code.

Potential future flow:

Complete Executable Code
↓
Optional Execution
↓
Verified Runtime Evidence
↓
Agent Analysis

This should NOT change the core requirement that LeetCode-style functions can be analyzed without compilation.

# TARGET ARCHITECTURE

Update the architecture toward:

Problem Statement + User Solution + Optional Input
↓
Persistent Chat
↓
Agent / Query Analyzer
↓
Problem Understanding
↓
User Approach Analysis
↓
┌─────────┼─────────┐
↓         ↓         ↓
Debug      Fix      Optimize
│         │         │
└─────────┼─────────┘
↓
Solution Analysis
↓
Agent Response
↓
┌───────────┼────────────┐
↓           ↓            ↓
Chat       UIPlan      Action Chips
│           │            │
│           ↓            ↓
│     Dynamic Workspace  User Action
│           │            │
│           ↓            ↓
│      image_viewer   Agent
│           │
│           ↓
│     Gemini Image
│
└───────────────┐
↓
Continue Chat

The primary architecture is:

Agent + Persistent Chat + Dynamic Workspace.

Gemini image generation is an on-demand visualization capability.

Execution is optional and is not part of the core analysis flow.

# EXISTING EXECUTION INFRASTRUCTURE

Do not delete or rewrite existing execution-related architecture merely because it is no longer core to the product.

If existing phases already contain:

* sandbox
* AST instrumentation
* trace generation
* replay
* execution state
* Monaco execution timeline

preserve them where they remain technically useful.

However, clearly mark them as existing infrastructure / optional capabilities rather than mandatory requirements for the main DSA mentor experience.

Do not allow the old execution-first architecture to dictate the new product vision.

# PHASE ROADMAP

Preserve existing phases where they are already implemented, but adjust the future roadmap to match the refined product.

## Phase 1

Sandbox + AST instrumentation

Keep as existing infrastructure if already implemented.

It is not a mandatory dependency for the primary AI DSA analysis experience.

## Phase 2

Session API + Redis state + replay

Preserve existing valid work.

Session state should primarily support:

* conversation
* problem
* user solution
* analysis
* UI state

## Phase 3

Interactive Monaco timeline UI

Preserve existing work if already implemented.

Do not make debugger-style timeline interaction a core requirement of the new product.

## Phase 4

Trace analysis + Gemini agent + structured UIPlan

Preserve valid existing work, but evolve the Agent toward:

* problem understanding
* user approach analysis
* correctness reasoning
* optimization
* contextual actions
* UI planning
* persistent chat

Existing trace analysis can remain as optional infrastructure.

## Phase 5

Adaptive Generative UI + Component Registry + Persistent Chat + Contextual Actions

Focus on:

* persistent chat interface
* dynamic workspace
* generic component registry
* UIPlan rendering
* contextual action chips
* generic image viewer
* mock Gemini-generated dry-run image flow
* response/workspace coordination
* keeping chat persistent while workspace changes

Do NOT implement:

* advanced DSA reasoning
* automatic correctness analysis
* automatic optimal solution generation
* algorithm-specific visualizers
* automatic image generation
* execution-dependent workflows

Phase 5 is the UI foundation.

## Phase 6

DSA Problem + Approach Intelligence

Implement:

* problem understanding
* user approach extraction
* correctness analysis
* approach classification
* complexity analysis
* edge-case reasoning
* intent-aware responses

## Phase 7

On-Demand Educational Dry Run

Implement:

* structured dry-run reasoning
* on-demand Gemini image generation
* problem-specific visual explanations
* contextual dry-run actions
* efficient image-generation flow

Do NOT build algorithm-specific React visualizers.

## Phase 8

Solution Improvement

Implement:

* bug diagnosis
* counterexamples
* corrected approach
* corrected code
* optimal approach
* complexity comparison
* tradeoff explanation

## Phase 9

Optional Verified Execution

If useful, integrate existing execution infrastructure as an optional capability for:

* complete executable programs
* exact runtime verification
* compiler/runtime errors
* actual output
* runtime-specific debugging

This phase must NOT change the core product requirement that LeetCode-style solution functions can be analyzed without compilation.

Do not over-specify implementation details for future phases.

Clearly distinguish:

* implemented
* partially implemented
* planned

# WHAT PHASE 5 IS NOT

Phase 5 should NOT implement:

* advanced DSA reasoning
* automatic correctness analysis
* automatic optimal solution generation
* multi-solution analysis
* execution-dependent debugging
* trace comparison
* compiler integration changes
* array visualizer
* pointer visualizer
* recursion tree component
* graph visualizer
* tree visualizer
* algorithm-specific dry-run components
* automatic Gemini image generation for every response

# FINAL PRODUCT DEFINITION

The final product should behave like an AI DSA mentor:

Problem Statement
+
User Solution
+
Optional Input
↓
Persistent Chat
↓
Agent
↓
Understand Problem
↓
Understand Student's Approach
↓
Evaluate Correctness
↓
Explain / Debug / Optimize
↓
Normal Chat
OR
Dynamic Workspace
OR
Contextual Actions
↓
User selects:

* Dry Run
* Counterexample
* Fix
* Optimal Approach
* Comparison
  ↓
  Agent performs requested analysis
  ↓
  Gemini generates dry-run image when requested
  ↓
  Dynamic Workspace updates
  ↓
  Persistent Chat continues

The core principle is:

"The Agent understands the DSA problem and the student's solution, reasons about correctness and optimization, decides what explanation or interaction is useful, and uses persistent chat plus an adaptive workspace to help the student understand and improve their solution. Dry-run visualizations are generated on demand by Gemini as explanatory images. The system does not require compilation or execution for its core LeetCode-style solution analysis."

The project is NOT:

"LLM explains code."

It IS:

"An agentic DSA learning workspace where the problem statement and user's solution drive conversational analysis, debugging, optimization, contextual actions, and on-demand Gemini-generated visual explanations."

Do not modify application code.

After updating `agents.md`, provide:

1. Summary of architectural changes
2. Updated phase roadmap
3. What is already implemented
4. What Phase 5 should focus on
5. What should explicitly NOT be implemented yet

```