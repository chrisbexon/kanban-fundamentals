export interface PullPushQuizQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export const LESSON_META = {
  id: "pull-vs-push",
  title: "Pull vs Push Systems",
  subtitle: "Kanban Training · Lesson 3.2",
  steps: ["Intro", "Comparison", "Key Insights", "Quiz"],
};

export const QUIZ: PullPushQuizQuestion[] = [
  {
    id: 1,
    q: "In a push system, what determines when work moves to the next stage?",
    opts: [
      "The downstream stage signals it has capacity",
      "The upstream stage finishes and pushes it forward immediately",
      "A manager decides which items to move",
      "Items are moved at fixed time intervals",
    ],
    ans: 1,
    exp: "In a push system, work is moved forward as soon as it is finished upstream — regardless of whether the next stage has capacity. This creates queues between stages and leads to overburdened workers downstream.",
  },
  {
    id: 2,
    q: "Why does quality tend to be higher in a pull system?",
    opts: [
      "Pull systems use better tools",
      "Workers are more skilled in pull systems",
      "Work cannot move forward until the downstream stage is ready to accept it, creating a natural quality gate",
      "Pull systems have dedicated QA teams",
    ],
    ans: 2,
    exp: "In a pull system, the downstream stage actively decides to pull work in. This creates a natural quality gate — if the work isn't ready or doesn't meet standards, it won't be pulled. Push systems move work forward regardless of quality, often discovering defects much later.",
  },
  {
    id: 3,
    q: "When a bottleneck appears in a pull system, what happens?",
    opts: [
      "Work piles up everywhere in the system",
      "Upstream workers sit idle until downstream clears — then collaborate to clear the blockage",
      "The system crashes and needs a restart",
      "Managers add more staff to every stage",
    ],
    ans: 1,
    exp: "In a pull system with WIP limits, when downstream is blocked, upstream workers cannot push more work in. Instead of creating more WIP, they become available to help clear the bottleneck — swarming on blocked items. This is the 'stop starting, start finishing' principle in action.",
  },
  {
    id: 4,
    q: "What is the primary difference between how push and pull systems handle demand?",
    opts: [
      "Push systems produce more output",
      "Pull systems produce to a forecast; push systems produce to actual demand",
      "Push systems produce based on forecasts and plans; pull systems match production to actual demand",
      "There is no difference in how they handle demand",
    ],
    ans: 2,
    exp: "Push systems are driven by forecasts and schedules — 'produce X units by date Y' regardless of actual demand. Pull systems are demand-driven — work only enters the system when there is actual need and capacity. This is why pull systems have less waste from overproduction.",
  },
  {
    id: 5,
    q: "A team adopts WIP limits and the 'work right to left' principle. What are they most likely to experience?",
    opts: [
      "Individual utilisation goes up because everyone is always busy",
      "More items are started each week",
      "Fewer items are started, but more are finished — cycle time drops",
      "Quality decreases because of less individual focus",
    ],
    ans: 2,
    exp: "WIP limits and working right to left means the team prioritises finishing over starting. Fewer items are in progress at once, so each gets more focused attention. Items flow through faster (lower cycle time), and throughput often increases despite fewer concurrent starts.",
  },
];
