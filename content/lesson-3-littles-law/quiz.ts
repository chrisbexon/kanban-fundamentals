import type { LittlesLawQuizQuestion } from "@/types/littles-law";

export const LITTLES_LAW_QUIZ: LittlesLawQuizQuestion[] = [
  {
    id: 1,
    q: "Little's Law states that Avg Cycle Time equals:",
    opts: [
      "Avg WIP \u00d7 Avg Throughput",
      "Avg WIP \u00f7 Avg Throughput",
      "Avg Throughput \u00f7 Avg WIP",
      "Avg WIP + Avg Throughput",
    ],
    ans: 1,
    exp: "Little's Law: Avg Cycle Time = Avg WIP \u00f7 Avg Throughput. If you have 10 items in progress and complete 2 per day, each item takes about 5 days on average.",
  },
  {
    id: 2,
    q: "A team has 12 items in progress and completes 3 per week. What is the average cycle time?",
    opts: ["3 weeks", "4 weeks", "6 weeks", "12 weeks"],
    ans: 1,
    exp: "Cycle Time = WIP \u00f7 Throughput = 12 \u00f7 3 = 4 weeks. Reducing WIP to 6 would cut cycle time to 2 weeks.",
  },
  {
    id: 3,
    q: "In the drive-through simulation, what happened when arrivals consistently exceeded throughput?",
    opts: [
      "Cycle time stayed the same",
      "WIP grew and cycle times increased",
      "Throughput automatically increased to match",
      "Cars got faster",
    ],
    ans: 1,
    exp: "When arrivals exceed throughput, WIP accumulates. By Little's Law, more WIP with the same throughput means longer cycle times. This is exactly what happens in any system \u2014 including your team's Kanban board.",
  },
  {
    id: 4,
    q: "Which is usually the easiest lever for reducing cycle time?",
    opts: [
      "Hire more people to increase throughput",
      "Make people work faster",
      "Reduce work in progress (WIP)",
      "Work longer hours",
    ],
    ans: 2,
    exp: "Reducing WIP is the easiest lever. You don't need to hire anyone or change processes \u2014 just start fewer things at once. Little's Law guarantees that lower WIP means shorter cycle times at the same throughput.",
  },
  {
    id: 5,
    q: "In the drive-through, adding a second order window helped most when:",
    opts: [
      "The kitchen was the bottleneck",
      "The order queue was building up faster than cars could be served",
      "Payment was slow",
      "There were very few cars arriving",
    ],
    ans: 1,
    exp: "A second order window only helps if ordering is the bottleneck \u2014 when the queue is growing because cars can't order fast enough. If the kitchen is the constraint, adding order windows just pushes cars faster into a queue at the kitchen, increasing WIP without improving throughput.",
  },
];
