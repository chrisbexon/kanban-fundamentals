export const LESSON_META = {
  id: "workflow-improvements",
  title: "Workflow Improvements",
  subtitle: "Improving the Workflow · Lesson 5.4",
  steps: ["Intro", "Exercise", "Review", "Quiz"],
};

export interface MatchItem {
  id: number;
  metric: string;
  metricDescription: string;
  workflowElement: string;
  explanation: string;
}

export const MATCH_EXERCISE: MatchItem[] = [
  {
    id: 1,
    metric: "Cycle time is increasing over time",
    metricDescription: "The scatterplot shows an upward trend — items are taking longer to complete.",
    workflowElement: "WIP Limits",
    explanation: "Rising cycle time usually indicates growing WIP. Tightening WIP limits is the most direct lever — per Little's Law, reducing WIP reduces cycle time.",
  },
  {
    id: 2,
    metric: "Throughput is unpredictable (high variance)",
    metricDescription: "The throughput run chart swings wildly — some weeks 8 items, others 1 item.",
    workflowElement: "Explicit Policies",
    explanation: "Inconsistent throughput often comes from inconsistent practices. Explicit policies (definition of done, pull criteria, work item types) standardise how work flows and reduce variability.",
  },
  {
    id: 3,
    metric: "Items age excessively in one column",
    metricDescription: "The aging WIP chart shows items sitting in 'QA Review' for 10+ days.",
    workflowElement: "Active Item Selection & Service Level Expectation",
    explanation: "When items age in a specific column, the team needs an SLE for that stage and an active item selection policy that prioritises aging items over new starts.",
  },
  {
    id: 4,
    metric: "Work keeps arriving faster than it's finished",
    metricDescription: "The CFD shows the 'Committed' band widening — more items enter than leave.",
    workflowElement: "Definition of Workflow (Input Rate)",
    explanation: "When arrival rate exceeds departure rate, the system is unstable. The workflow definition must include intake cadence, commitment point criteria, and a mechanism to slow input (e.g., replenishment meetings).",
  },
  {
    id: 5,
    metric: "Blocked items sit unresolved for days",
    metricDescription: "Multiple items show blocker flags but no one is actively resolving them.",
    workflowElement: "Explicit Policies (Blocker Resolution)",
    explanation: "A blocker policy should specify: who is responsible, escalation timelines, and what happens to blocked items' WIP slots. Without this policy, blockers silently consume capacity.",
  },
  {
    id: 6,
    metric: "Large items cause delivery date misses",
    metricDescription: "A few large items skew the cycle time distribution, making forecasts unreliable.",
    workflowElement: "Right-Sizing (Pull-Time Check)",
    explanation: "Items should be right-sized at the commitment point: 'Can we finish this within our SLE?' If not, break it down. This is a pull-time policy, not an estimation exercise.",
  },
];

export const WORKFLOW_ELEMENTS = [
  "WIP Limits",
  "Explicit Policies",
  "Active Item Selection & Service Level Expectation",
  "Definition of Workflow (Input Rate)",
  "Explicit Policies (Blocker Resolution)",
  "Right-Sizing (Pull-Time Check)",
];

export const QUIZ = [
  {
    id: 1,
    q: "Cycle time is trending upward. Which workflow element should you examine first?",
    opts: [
      "The colour scheme of the board",
      "WIP limits — are they being respected?",
      "The sprint length",
      "The number of team meetings",
    ],
    ans: 1,
    exp: "Rising cycle time is a direct signal from Little's Law that WIP may be growing. Check whether WIP limits exist and are being respected before investigating other causes.",
  },
  {
    id: 2,
    q: "What is the purpose of a Service Level Expectation (SLE)?",
    opts: [
      "To punish teams that miss deadlines",
      "To set a target that 85% of items should complete within a certain time",
      "To eliminate all variation in cycle time",
      "To estimate how many story points a team can handle",
    ],
    ans: 1,
    exp: "The SLE (typically the 85th percentile of cycle time) sets a customer expectation and an internal benchmark. It's used for right-sizing work, monitoring aging items, and probabilistic forecasting.",
  },
  {
    id: 3,
    q: "A team's throughput is highly variable. Which improvement would most likely help?",
    opts: [
      "Adding more columns to the board",
      "Establishing explicit policies for how work is pulled, prioritised, and completed",
      "Removing all WIP limits to increase flexibility",
      "Assigning all work to the most senior team member",
    ],
    ans: 1,
    exp: "Throughput variability often stems from inconsistent practices. Explicit policies (pull criteria, definition of done, handling expedites) create a more consistent and therefore predictable workflow.",
  },
  {
    id: 4,
    q: "Items keep arriving faster than they're completed. What concept from the Kanban Guide addresses this?",
    opts: [
      "Velocity tracking",
      "Definition of Workflow — specifically controlling the input rate at the commitment point",
      "Adding more WIP to keep everyone busy",
      "Using a burndown chart",
    ],
    ans: 1,
    exp: "The Definition of Workflow includes how items enter the system. A replenishment meeting or intake cadence ensures the team only pulls work they have capacity for, maintaining system stability.",
  },
  {
    id: 5,
    q: "What is 'right-sizing' in Kanban?",
    opts: [
      "Making all items exactly the same size using story points",
      "Breaking items down at pull time so each can be completed within the SLE",
      "Estimating every item in hours before starting",
      "Grouping small items together into larger batches",
    ],
    ans: 1,
    exp: "Right-sizing is a pull-time check: 'Can we complete this item within our SLE?' If not, break it down. It replaces estimation with a simple size threshold based on actual cycle time data.",
  },
];
