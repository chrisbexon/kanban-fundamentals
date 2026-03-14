export const LESSON_META = {
  id: "flow-metrics-deep-dive",
  title: "Flow Metrics Deep Dive",
  subtitle: "Improving the Workflow · Lesson 5.2",
  steps: ["Intro", "Charts", "Analysis", "Quiz"],
};

// ── Sample Round 3 data (represents end-of-game state after 60 days) ──
// In the persisted version, this would come from actual Kanban Game saves.

export interface CycleTimePoint {
  itemId: string;
  cycleTime: number;
  dayDone: number;
}

export interface ThroughputDay {
  day: number;
  count: number;
  rollingAvg: number;
}

export interface AgingWipItem {
  itemId: string;
  location: string;
  locationLabel: string;
  age: number;
  percentComplete: number;
}

export interface BoardEndState {
  location: string;
  label: string;
  color: string;
  items: { id: string; age: number; blocked: boolean; percentComplete: number }[];
}

// Cycle Time Scatterplot — Round 3 completions showing tight distribution
export const CYCLE_TIME_DATA: CycleTimePoint[] = [
  { itemId: "W-01", cycleTime: 6, dayDone: 8 },
  { itemId: "W-02", cycleTime: 7, dayDone: 10 },
  { itemId: "W-03", cycleTime: 5, dayDone: 11 },
  { itemId: "W-04", cycleTime: 8, dayDone: 14 },
  { itemId: "W-05", cycleTime: 6, dayDone: 15 },
  { itemId: "W-06", cycleTime: 7, dayDone: 17 },
  { itemId: "W-07", cycleTime: 5, dayDone: 18 },
  { itemId: "W-08", cycleTime: 9, dayDone: 21 },
  { itemId: "W-09", cycleTime: 6, dayDone: 22 },
  { itemId: "W-10", cycleTime: 7, dayDone: 24 },
  { itemId: "W-11", cycleTime: 5, dayDone: 25 },
  { itemId: "W-12", cycleTime: 14, dayDone: 28 }, // outlier — was blocked
  { itemId: "W-13", cycleTime: 6, dayDone: 29 },
  { itemId: "W-14", cycleTime: 7, dayDone: 31 },
  { itemId: "W-15", cycleTime: 5, dayDone: 32 },
  { itemId: "W-16", cycleTime: 8, dayDone: 35 },
  { itemId: "W-17", cycleTime: 6, dayDone: 36 },
  { itemId: "W-18", cycleTime: 7, dayDone: 38 },
  { itemId: "W-19", cycleTime: 5, dayDone: 39 },
  { itemId: "W-20", cycleTime: 6, dayDone: 41 },
  { itemId: "W-21", cycleTime: 7, dayDone: 43 },
  { itemId: "W-22", cycleTime: 18, dayDone: 46 }, // outlier — blocker + rework
  { itemId: "W-23", cycleTime: 6, dayDone: 47 },
  { itemId: "W-24", cycleTime: 5, dayDone: 49 },
  { itemId: "W-25", cycleTime: 7, dayDone: 51 },
  { itemId: "W-26", cycleTime: 6, dayDone: 53 },
  { itemId: "W-27", cycleTime: 5, dayDone: 54 },
  { itemId: "W-28", cycleTime: 7, dayDone: 56 },
  { itemId: "W-29", cycleTime: 6, dayDone: 58 },
  { itemId: "W-30", cycleTime: 5, dayDone: 60 },
];

// SLE and percentile values
export const SLE_DAYS = 10;
export const P50 = 6;
export const P85 = 8;
export const P95 = 14;

// Throughput — items completed per day with 5-day rolling average
export const THROUGHPUT_DATA: ThroughputDay[] = [
  { day: 5, count: 0, rollingAvg: 0 },
  { day: 8, count: 1, rollingAvg: 0.2 },
  { day: 10, count: 1, rollingAvg: 0.3 },
  { day: 11, count: 1, rollingAvg: 0.4 },
  { day: 14, count: 1, rollingAvg: 0.4 },
  { day: 15, count: 1, rollingAvg: 0.5 },
  { day: 17, count: 1, rollingAvg: 0.5 },
  { day: 18, count: 1, rollingAvg: 0.5 },
  { day: 21, count: 1, rollingAvg: 0.5 },
  { day: 22, count: 1, rollingAvg: 0.5 },
  { day: 24, count: 1, rollingAvg: 0.5 },
  { day: 25, count: 1, rollingAvg: 0.5 },
  { day: 28, count: 1, rollingAvg: 0.5 },
  { day: 29, count: 1, rollingAvg: 0.5 },
  { day: 31, count: 1, rollingAvg: 0.5 },
  { day: 32, count: 1, rollingAvg: 0.5 },
  { day: 35, count: 1, rollingAvg: 0.5 },
  { day: 36, count: 1, rollingAvg: 0.5 },
  { day: 38, count: 1, rollingAvg: 0.5 },
  { day: 39, count: 1, rollingAvg: 0.5 },
  { day: 41, count: 1, rollingAvg: 0.5 },
  { day: 43, count: 1, rollingAvg: 0.5 },
  { day: 46, count: 1, rollingAvg: 0.5 },
  { day: 47, count: 1, rollingAvg: 0.5 },
  { day: 49, count: 1, rollingAvg: 0.5 },
  { day: 51, count: 1, rollingAvg: 0.5 },
  { day: 53, count: 1, rollingAvg: 0.5 },
  { day: 54, count: 1, rollingAvg: 0.5 },
  { day: 56, count: 1, rollingAvg: 0.5 },
  { day: 58, count: 1, rollingAvg: 0.5 },
  { day: 60, count: 1, rollingAvg: 0.5 },
];

// Board end state after Round 3 Day 60
export const BOARD_END_STATE: BoardEndState[] = [
  {
    location: "backlog",
    label: "Backlog",
    color: "#64748b",
    items: [
      { id: "W-39", age: 0, blocked: false, percentComplete: 0 },
      { id: "W-40", age: 0, blocked: false, percentComplete: 0 },
    ],
  },
  {
    location: "red-active",
    label: "Red Active",
    color: "#ef4444",
    items: [
      { id: "W-34", age: 4, blocked: false, percentComplete: 60 },
      { id: "W-35", age: 3, blocked: false, percentComplete: 40 },
    ],
  },
  {
    location: "red-finished",
    label: "Red Done",
    color: "#f87171",
    items: [
      { id: "W-33", age: 5, blocked: false, percentComplete: 100 },
    ],
  },
  {
    location: "blue-active",
    label: "Blue Active",
    color: "#3b82f6",
    items: [
      { id: "W-32", age: 6, blocked: false, percentComplete: 50 },
      { id: "W-31", age: 7, blocked: true, percentComplete: 30 },
    ],
  },
  {
    location: "blue-finished",
    label: "Blue Done",
    color: "#60a5fa",
    items: [],
  },
  {
    location: "green",
    label: "Green",
    color: "#22c55e",
    items: [
      { id: "W-36", age: 4, blocked: false, percentComplete: 70 },
    ],
  },
  {
    location: "done",
    label: "Done",
    color: "#a3e635",
    items: Array.from({ length: 30 }, (_, i) => ({
      id: `W-${String(i + 1).padStart(2, "0")}`,
      age: 0,
      blocked: false,
      percentComplete: 100,
    })),
  },
];

// Aging WIP at day 60 — items still in progress
export const AGING_WIP_DATA: AgingWipItem[] = [
  { itemId: "W-31", location: "blue-active", locationLabel: "Blue Active", age: 7, percentComplete: 30 },
  { itemId: "W-32", location: "blue-active", locationLabel: "Blue Active", age: 6, percentComplete: 50 },
  { itemId: "W-33", location: "red-finished", locationLabel: "Red Done", age: 5, percentComplete: 100 },
  { itemId: "W-34", location: "red-active", locationLabel: "Red Active", age: 4, percentComplete: 60 },
  { itemId: "W-36", location: "green", locationLabel: "Green", age: 4, percentComplete: 70 },
  { itemId: "W-35", location: "red-active", locationLabel: "Red Active", age: 3, percentComplete: 40 },
];

// Chart analysis content
export const CHART_ANALYSES = {
  cycleTime: {
    title: "Cycle Time Scatterplot",
    question: "What does the Cycle Time Scatterplot help make visible?",
    insights: [
      {
        label: "Tight Clustering",
        text: "Most items complete between 5-8 days. This tight vertical grouping means the system is predictable \u2014 we can reliably forecast when items will be done.",
      },
      {
        label: "Outliers",
        text: "W-12 (14 days) and W-22 (18 days) stand out clearly. These were blocked by dependencies and required rework. Outliers reveal systemic issues worth investigating.",
      },
      {
        label: "SLE Line",
        text: "The Service Level Expectation (10 days) shows that 93% of items complete within the SLE. Only the two outliers breach it. This is a strong predictability signal.",
      },
      {
        label: "Predictability",
        text: "The tighter the distribution, the more predictable the forecasting. Compare this to Round 1 where cycle times ranged from 8-25 days \u2014 WIP limits made the difference.",
      },
    ],
  },
  throughput: {
    title: "Throughput Run Chart",
    question: "What is good throughput?",
    insights: [
      {
        label: "Consistency Over Speed",
        text: "Good throughput isn\u2019t about maximising speed \u2014 it\u2019s about consistency. A steady 0.5 items/day is more valuable than swinging between 0 and 3.",
      },
      {
        label: "Rolling Average",
        text: "The 5-day rolling average (amber line) smooths daily variation and reveals the true trend. A flat line means stable flow. An upward trend means improving throughput.",
      },
      {
        label: "Forecasting Power",
        text: "With a known throughput rate, you can answer: \u2018How many items in the next 2 weeks?\u2019 At 0.5/day, that\u2019s ~7 items. Monte Carlo refines this with probability bands.",
      },
    ],
  },
  boardState: {
    title: "Current Board State",
    question: "What does the board tell us at Day 60?",
    insights: [
      {
        label: "Low WIP",
        text: "Only 6 items are in active work stages. The WIP limits are being respected, which is why cycle times are low and predictable.",
      },
      {
        label: "Blocked Item",
        text: "W-31 in Blue Active is blocked (7 days old). This is the oldest item and should be the team\u2019s top priority. Unblocking it prevents it from becoming an outlier.",
      },
      {
        label: "Healthy Flow",
        text: "30 items in Done vs 6 in progress \u2014 a 5:1 ratio. Items are flowing through the system rather than accumulating. This is what a pull system looks like.",
      },
    ],
  },
  agingWip: {
    title: "Aging Work in Progress",
    question: "How have we made work item age visible, and why does it matter?",
    insights: [
      {
        label: "Colour-Coded Age Badges",
        text: "In the Kanban Game, each item shows its age in days with colour coding: green (healthy), amber (approaching SLE), red (breaching SLE). This makes risk visible at a glance.",
      },
      {
        label: "Sorted by Age",
        text: "The chart sorts items oldest-first. The team should work from the top down \u2014 the oldest items are the highest risk and should be prioritised for completion.",
      },
      {
        label: "SLE Reference Line",
        text: "The vertical SLE line (10 days) divides the chart into safe and at-risk zones. No items have breached SLE yet, but W-31 at 7 days needs attention.",
      },
      {
        label: "Experimentation Signal",
        text: "These metrics reflect the health of your workflow system. Making a change \u2014 adjusting WIP limits, adding an explicit policy, changing how blockers are handled \u2014 will show up in these charts. They are your feedback loop for continuous improvement.",
      },
    ],
  },
};

export const QUIZ = [
  {
    id: 1,
    q: "On the cycle time scatterplot, two items took 14 and 18 days while most took 5-8 days. What should the team investigate?",
    opts: [
      "Nothing \u2014 variation is normal",
      "Whether those items were blocked, had rework, or violated the SLE \u2014 outliers reveal systemic issues",
      "Whether to remove those items from the data",
      "Whether to increase WIP limits to handle such items faster",
    ],
    ans: 1,
    exp: "Outliers on a cycle time scatterplot are not noise \u2014 they\u2019re signals. Investigating them reveals blockers, policy gaps, or items that weren\u2019t right-sized. This is how you drive improvement.",
  },
  {
    id: 2,
    q: "The throughput run chart shows a steady rolling average of 0.5 items/day. A manager asks \u2018Can we deliver 20 items in 2 weeks (10 days)?\u2019 What\u2019s the evidence-based answer?",
    opts: [
      "Yes, if the team works harder",
      "No \u2014 at 0.5/day, the expected throughput is ~5 items in 10 days, not 20",
      "It depends on the batch size",
      "Yes, if we remove WIP limits",
    ],
    ans: 1,
    exp: "The throughput run chart gives you real data: 0.5 items/day. In 10 days, that\u2019s ~5 items. Promising 20 is 4x the proven capacity \u2014 Little\u2019s Law exposes this as impossible without fundamental changes.",
  },
  {
    id: 3,
    q: "The board shows 30 items Done and 6 in progress with WIP limits respected. What does this tell you?",
    opts: [
      "The team is going too slow",
      "The team needs more WIP to keep busy",
      "The system has healthy flow \u2014 items complete rather than accumulate",
      "The backlog is too empty",
    ],
    ans: 2,
    exp: "A high Done-to-WIP ratio (5:1 here) is a sign of healthy flow. Items are being completed, not just started. This is the result of disciplined WIP management.",
  },
  {
    id: 4,
    q: "An item has been in Blue Active for 7 days and is blocked. The SLE is 10 days. What should the team do?",
    opts: [
      "Wait until it breaches the SLE to take action",
      "Start new work instead",
      "Prioritise unblocking it immediately \u2014 it\u2019s approaching the SLE and aging rapidly",
      "Move it to the backlog",
    ],
    ans: 2,
    exp: "At 7 days out of a 10-day SLE, this item is at 70% of its time budget and blocked. The team should swarm on it \u2014 investigate the blocker, escalate if needed, and prioritise completion over starting new work.",
  },
  {
    id: 5,
    q: "Why are these 4 flow metrics (cycle time, throughput, WIP, work item age) called a \u2018feedback loop\u2019 for improvement?",
    opts: [
      "Because they automatically fix problems",
      "Because changes to the workflow system are reflected in these metrics, showing whether an experiment helped or hurt",
      "Because they replace the need for team meetings",
      "Because they\u2019re required by the Kanban Guide",
    ],
    ans: 1,
    exp: "When you change a workflow element (WIP limit, policy, board design), the impact shows up in these metrics. They tell you whether your experiment improved flow or made it worse. This is the scientific method applied to workflow management.",
  },
];
