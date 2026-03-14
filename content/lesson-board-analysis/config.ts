export const LESSON_META = {
  id: "board-analysis",
  title: "Board Analysis",
  subtitle: "Improving the Workflow · Lesson 5.3",
  steps: ["Intro", "Boards 1-2", "Boards 3-4", "Metrics Quiz"],
};

export interface BoardItem {
  id: string;
  color: string; // orange, blue, green, yellow, gray, red (red = blocked)
  blocked?: boolean;
}

export interface BoardColumn {
  name: string;
  subColumns?: { name: string; items: BoardItem[] }[];
  items?: BoardItem[];
  wipLimit?: number;
}

export interface ScenarioBoard {
  id: number;
  title: string;
  description: string;
  columns: BoardColumn[];
  analysisQuestion: string;
  problems: string[];
  keyInsight: string;
}

// Scenario boards matching the Kanban Game column structure:
// Input Queue | Discovery (In Progress / Complete) | Building (Doing / Complete) | User Acceptance | Prod

export const SCENARIO_BOARDS: ScenarioBoard[] = [
  {
    id: 1,
    title: "The Left-Heavy Board",
    description:
      "This team is frustrated \u2014 they started lots of work but stakeholders say nothing is getting delivered. Look at where the work items are concentrated.",
    columns: [
      {
        name: "Input Queue",
        items: [
          { id: "1", color: "orange" },
          { id: "2", color: "orange" },
          { id: "3", color: "yellow" },
        ],
      },
      {
        name: "Discovery",
        wipLimit: 3,
        subColumns: [
          {
            name: "In Progress",
            items: [
              { id: "4", color: "orange" },
              { id: "5", color: "blue" },
              { id: "6", color: "blue" },
            ],
          },
          {
            name: "Complete",
            items: [
              { id: "7", color: "blue" },
              { id: "8", color: "gray" },
            ],
          },
        ],
      },
      {
        name: "Building",
        wipLimit: 3,
        subColumns: [
          {
            name: "Doing",
            items: [
              { id: "9", color: "blue" },
              { id: "10", color: "gray" },
            ],
          },
          {
            name: "Complete",
            items: [],
          },
        ],
      },
      {
        name: "User Acceptance",
        wipLimit: 3,
        items: [],
      },
      {
        name: "Prod.",
        items: [],
      },
    ],
    analysisQuestion: "What do you notice about where the work is on this board?",
    problems: [
      "WIP limits are busted \u2014 Discovery has 5 items (limit 3), work is piling up in early stages",
      "Nothing in User Acceptance or Prod \u2014 the team is starting work but not finishing it",
      "The board is \u2018left-heavy\u2019: all items concentrated in Discovery and Building",
      "No pull signal from the right \u2014 upstream keeps pushing work without downstream demand",
      "Stakeholders see no delivered value despite the team appearing busy",
    ],
    keyInsight:
      "This is the classic \u2018start more, finish less\u2019 anti-pattern. The team needs to stop starting and start finishing. Enforcing WIP limits would create a pull signal from the right side of the board.",
  },
  {
    id: 2,
    title: "The Downstream Bottleneck",
    description:
      "Something is clearly wrong with this board. One column is severely overloaded while others are empty. What\u2019s happening?",
    columns: [
      {
        name: "Input Queue",
        items: [
          { id: "1", color: "orange" },
        ],
      },
      {
        name: "Discovery",
        wipLimit: 3,
        subColumns: [
          {
            name: "In Progress",
            items: [],
          },
          {
            name: "Complete",
            items: [],
          },
        ],
      },
      {
        name: "Building",
        wipLimit: 3,
        subColumns: [
          {
            name: "Doing",
            items: [],
          },
          {
            name: "Complete",
            items: [],
          },
        ],
      },
      {
        name: "User Acceptance",
        wipLimit: 1,
        items: [
          { id: "2", color: "gray" },
          { id: "3", color: "gray" },
          { id: "4", color: "gray" },
          { id: "5", color: "gray" },
          { id: "6", color: "gray" },
        ],
      },
      {
        name: "Prod.",
        items: [],
      },
    ],
    analysisQuestion: "Why are all 5 items stuck in User Acceptance with a WIP limit of 1?",
    problems: [
      "User Acceptance has 5 items but a WIP limit of 1 \u2014 the limit is being massively violated",
      "Discovery and Building are completely empty \u2014 no new work is flowing through the system",
      "The bottleneck at UAT is starving everything downstream (Prod is empty)",
      "The WIP limit of 1 suggests UAT is a known constraint, yet the team isn\u2019t respecting it",
      "All work is queued at a single point \u2014 whoever does UAT is overwhelmed",
    ],
    keyInsight:
      "When WIP limits are ignored, bottlenecks become invisible. The WIP limit of 1 was set for a reason \u2014 UAT capacity is limited. The team should respect the limit and investigate why so much work accumulated here. Perhaps UAT needs more capacity, or items need to be smaller.",
  },
  {
    id: 3,
    title: "The Blocked Anti-Pattern",
    description:
      "This team added a \u2018Blocked\u2019 column to their board. It seems logical \u2014 but there\u2019s a fundamental problem with this approach.",
    columns: [
      {
        name: "Input Queue",
        items: [],
      },
      {
        name: "Discovery",
        wipLimit: 3,
        subColumns: [
          {
            name: "In Progress",
            items: [
              { id: "1", color: "orange" },
            ],
          },
          {
            name: "Complete",
            items: [
              { id: "2", color: "blue" },
            ],
          },
        ],
      },
      {
        name: "Building",
        wipLimit: 3,
        subColumns: [
          {
            name: "Doing",
            items: [
              { id: "3", color: "blue" },
            ],
          },
          {
            name: "Complete",
            items: [
              { id: "4", color: "green" },
            ],
          },
        ],
      },
      {
        name: "User Acceptance",
        wipLimit: 3,
        items: [
          { id: "5", color: "blue" },
          { id: "6", color: "green" },
        ],
      },
      {
        name: "Blocked",
        items: [
          { id: "7", color: "blue" },
          { id: "8", color: "green" },
          { id: "9", color: "orange" },
          { id: "10", color: "blue" },
        ],
      },
    ],
    analysisQuestion: "What\u2019s wrong with having \u2018Blocked\u2019 as a separate column?",
    problems: [
      "\u2018Blocked\u2019 is not a workflow state \u2014 it\u2019s a condition that can happen in ANY state",
      "Moving items to a Blocked column hides WHERE in the workflow the block occurred",
      "It makes WIP limits meaningless \u2014 blocked items leave their column, freeing WIP slots that should remain occupied",
      "The team loses the signal: \u2018Building has a blocker problem\u2019 becomes invisible",
      "Items in the Blocked column have no clear path back \u2014 which column do they return to?",
    ],
    keyInsight:
      "Blocked items should be flagged IN PLACE \u2014 with a visual indicator (red flag, overlay, border) in their current workflow state. This preserves WIP visibility, shows WHERE blocks happen, and keeps the blocker connected to the context where it needs to be resolved.",
  },
  {
    id: 4,
    title: "The Blocker Crisis",
    description:
      "This board has a serious problem. Red-bordered items are blocked. Count them up and consider what this means for flow.",
    columns: [
      {
        name: "Input Queue",
        items: [
          { id: "1", color: "orange" },
          { id: "2", color: "yellow" },
        ],
      },
      {
        name: "Discovery",
        wipLimit: 3,
        subColumns: [
          {
            name: "In Progress",
            items: [
              { id: "3", color: "orange" },
              { id: "4", color: "blue", blocked: true },
            ],
          },
          {
            name: "Complete",
            items: [
              { id: "5", color: "green", blocked: true },
            ],
          },
        ],
      },
      {
        name: "Building",
        wipLimit: 3,
        subColumns: [
          {
            name: "Doing",
            items: [
              { id: "6", color: "blue" },
              { id: "7", color: "orange", blocked: true },
            ],
          },
          {
            name: "Complete",
            items: [
              { id: "8", color: "green", blocked: true },
            ],
          },
        ],
      },
      {
        name: "User Acceptance",
        wipLimit: 3,
        items: [
          { id: "9", color: "blue" },
          { id: "10", color: "green", blocked: true },
        ],
      },
      {
        name: "Prod.",
        items: [],
      },
    ],
    analysisQuestion: "How many items are blocked, and what is the impact on flow?",
    problems: [
      "5 out of 8 active items are blocked \u2014 over 60% of WIP is not progressing",
      "Blockers exist in every stage (Discovery, Building, UAT) \u2014 this is systemic, not isolated",
      "Only 3 items can actually make progress \u2014 effective throughput is near zero",
      "Blocked items consume WIP slots, preventing new work from entering",
      "Without a blocker resolution policy, these items will age indefinitely",
    ],
    keyInsight:
      "When more than half your WIP is blocked, you don\u2019t have a flow problem \u2014 you have a dependency and coordination problem. The team needs to stop all new work and focus entirely on resolving blockers. An explicit blocker escalation policy with time limits is essential.",
  },
];

// Standard analysis quiz (per-board)
export const QUIZ = [
  {
    id: 1,
    q: "In Scenario 1 (The Left-Heavy Board), what is the root cause of nothing reaching Prod?",
    opts: [
      "The team doesn\u2019t have enough people",
      "WIP limits are being violated \u2014 the team is starting work faster than they can finish it",
      "The Prod column is broken",
      "The backlog is too large",
    ],
    ans: 1,
    exp: "The team has 5 items in Discovery (limit 3). They\u2019re pushing work into the system without finishing what\u2019s already started. Respecting WIP limits would force them to complete items before starting new ones.",
  },
  {
    id: 2,
    q: "In Scenario 2, why is having a WIP limit of 1 on User Acceptance but 5 items in it problematic?",
    opts: [
      "The WIP limit should be higher",
      "WIP limits only matter for Discovery",
      "The violated limit hides the bottleneck \u2014 the system pretends it has capacity when it doesn\u2019t",
      "Having 5 items is fine because they\u2019ll all be accepted eventually",
    ],
    ans: 2,
    exp: "A WIP limit of 1 signals UAT has very limited capacity. Ignoring it by stuffing 5 items in creates a queue that destroys predictability and hides the real constraint from the system.",
  },
  {
    id: 3,
    q: "Why should blocked items stay in their current workflow column rather than moving to a \u2018Blocked\u2019 column?",
    opts: [
      "It doesn\u2019t matter where blocked items are shown",
      "Keeping them in place preserves WIP visibility and shows where in the workflow blocks occur",
      "A Blocked column is more organised",
      "Blocked items don\u2019t count as WIP",
    ],
    ans: 1,
    exp: "If a Building item is blocked, it should show as blocked IN Building. This tells the team \u2018Building has a dependency problem\u2019 and keeps the WIP slot occupied (correctly reflecting capacity consumption).",
  },
  {
    id: 4,
    q: "In Scenario 4, 5 of 8 active items are blocked. What is the team\u2019s highest priority action?",
    opts: [
      "Start more work to keep unblocked workers busy",
      "Drop all new work and focus entirely on resolving the 5 blockers",
      "Add more columns to the board",
      "Wait for the blockers to resolve themselves",
    ],
    ans: 1,
    exp: "With 60%+ of WIP blocked, effective throughput is near zero. Starting more work would make it worse. The only way to restore flow is to swarm on resolving blockers, then create policies to prevent them recurring.",
  },
  {
    id: 5,
    q: "Across all 4 scenarios, which combination of metrics would help diagnose and track improvements?",
    opts: [
      "Just throughput",
      "Story points and velocity",
      "WIP, Work Item Age, Cycle Time, and Throughput \u2014 all four flow metrics together",
      "Lines of code per day",
    ],
    ans: 2,
    exp: "All four flow metrics work together: WIP shows how much is in progress, Work Item Age shows risk, Cycle Time shows how long items take, and Throughput shows the output rate. Together they give a complete picture of flow health.",
  },
];

// Metrics matching quiz — which metrics help each scenario
export interface MetricsScenario {
  id: number;
  scenarioTitle: string;
  scenarioSummary: string;
  correctMetrics: string[];
  explanation: string;
}

export const METRICS_SCENARIOS: MetricsScenario[] = [
  {
    id: 1,
    scenarioTitle: "Left-Heavy Board",
    scenarioSummary: "WIP limits busted, everything in early stages, nothing in Prod.",
    correctMetrics: ["WIP", "Cycle Time", "Throughput", "Work Item Age"],
    explanation:
      "All four metrics are relevant: WIP shows the violation directly, Cycle Time reveals items are taking too long, Throughput shows delivery has stalled, and Work Item Age exposes aging items stuck in early stages.",
  },
  {
    id: 2,
    scenarioTitle: "Downstream Bottleneck",
    scenarioSummary: "5 items stuck in UAT with WIP limit of 1.",
    correctMetrics: ["WIP", "Cycle Time", "Throughput", "Work Item Age"],
    explanation:
      "WIP highlights the violated limit, Cycle Time shows UAT is inflating total time, Throughput drops to near zero at the bottleneck, and Work Item Age shows items aging in the queue.",
  },
  {
    id: 3,
    scenarioTitle: "Blocked Anti-Pattern",
    scenarioSummary: "Separate \u2018Blocked\u2019 column hiding where blocks occur.",
    correctMetrics: ["WIP", "Cycle Time", "Throughput", "Work Item Age"],
    explanation:
      "WIP would be misleading (blocked items aren\u2019t counted in their real column), Cycle Time is inflated but you can\u2019t see why, Throughput drops without explanation, and Work Item Age can\u2019t be attributed to a workflow stage.",
  },
  {
    id: 4,
    scenarioTitle: "Blocker Crisis",
    scenarioSummary: "5 of 8 items blocked across all stages.",
    correctMetrics: ["WIP", "Cycle Time", "Throughput", "Work Item Age"],
    explanation:
      "WIP shows slots consumed by blocked items, Cycle Time skyrockets for blocked items, Throughput drops dramatically, and Work Item Age reveals which blocked items are most urgent to resolve.",
  },
];
