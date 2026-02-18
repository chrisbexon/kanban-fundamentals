import type { WipQuizQuestion } from "@/types/wip-game";

export const LESSON_META = {
  id: "wip-limits",
  title: "WIP Limits & Work Item Age",
  subtitle: "Kanban Training \u00B7 Lesson 2",
  steps: ["Intro", "Simulation", "Debrief", "Quiz"],
};

export const QUIZ: WipQuizQuestion[] = [
  {
    id: 1,
    q: "What happened when items accumulated in the Blue Active column with no WIP limit?",
    opts: [
      "Items flowed faster because workers stayed busy",
      "Items aged rapidly, increasing cycle times and reducing predictability",
      "Throughput doubled because there was more work available",
      "Nothing changed \u2014 WIP limits don\u2019t affect flow",
    ],
    ans: 1,
    exp: "Without WIP limits, items pile up in columns. Each item waits longer, increasing age and cycle time. The system becomes unpredictable \u2014 exactly what WIP limits prevent.",
  },
  {
    id: 2,
    q: "Why did assigning a cross-trained worker (e.g., Red worker on Blue items) produce less work?",
    opts: [
      "Cross-trained workers are penalised for being in the wrong column",
      "Cross-trained workers roll 1\u20133 instead of 1\u20136, reflecting reduced expertise outside their specialty",
      "It\u2019s a bug in the simulation",
      "Cross-trained workers can only work on blocked items",
    ],
    ans: 1,
    exp: "Cross-trained workers roll 1\u20133 (vs 1\u20136 for own-colour). This models reality: generalists help unblock flow but are less efficient than specialists at a given task.",
  },
  {
    id: 3,
    q: "Looking at the Cumulative Flow Diagram (CFD), what does a widening band between two stages indicate?",
    opts: [
      "Items are flowing smoothly through the system",
      "Work is accumulating between those stages \u2014 a bottleneck is forming",
      "Throughput is increasing",
      "The backlog is empty",
    ],
    ans: 1,
    exp: "In a CFD, widening bands mean WIP is growing between stages. This reveals bottlenecks \u2014 work enters faster than it leaves. Healthy flow shows roughly parallel bands.",
  },
  {
    id: 4,
    q: "What does the Aging WIP chart tell you that the Kanban board alone does not?",
    opts: [
      "Which items are blocked",
      "How long each in-progress item has been in the system, compared to the Service Level Expectation",
      "How many items are in each column",
      "Which workers are assigned to which items",
    ],
    ans: 1,
    exp: "Aging WIP shows the age of every active item against the SLE. Items approaching or exceeding the SLE need attention \u2014 this is invisible on a standard board without age tracking.",
  },
  {
    id: 5,
    q: "Based on what you observed, what is the primary benefit of limiting WIP?",
    opts: [
      "It keeps workers idle, which reduces costs",
      "It shortens cycle times by reducing queue wait, making delivery more predictable",
      "It prevents new work from entering the backlog",
      "It automatically resolves blockers",
    ],
    ans: 1,
    exp: "WIP limits constrain the amount of work in the system. Less WIP means shorter queues, less waiting, faster cycle times, and more predictable delivery \u2014 the foundation of Kanban flow.",
  },
];
