import type { QuizQuestion } from "@/types/penny-game";

export const LESSON_META = {
  id: "penny-game",
  title: "The Penny Game: Batch Size & Flow",
  subtitle: "Kanban Training \u00B7 Lesson 1",
  steps: ["Intro", "Simulation", "Debrief", "Quiz"],
};

export const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    q: "In the simulation, what happened when you used a batch size of 20?",
    opts: [
      "Items flowed through quickly with minimal waiting",
      "Each coin waited for all 19 others before the batch could move forward",
      "The system automatically optimised itself",
      "All stages processed coins simultaneously",
    ],
    ans: 1,
    exp: "With a batch of 20, every coin \u2014 even the first one flipped \u2014 had to wait for all others to complete before moving. This creates enormous wait time.",
  },
  {
    id: 2,
    q: "Why did some stages become bottlenecks?",
    opts: [
      "Because the simulation was broken",
      "Because work always takes the same time",
      "Because each coin takes a random amount of time, creating natural variability",
      "Because there were too many stages",
    ],
    ans: 2,
    exp: "Variability is inherent in real work. Each coin took 1\u20134 ticks at each stage, so some stages naturally accumulated more work.",
  },
  {
    id: 3,
    q: "What does \u2018pull system\u2019 mean based on what you observed?",
    opts: [
      "Workers pull coins out of a hat",
      "Each stage pushes work forward as fast as possible",
      "Work moves to the next stage only when that stage has capacity",
      "The backlog pushes all items in at once",
    ],
    ans: 2,
    exp: "In a pull system, work moves forward only when the next stage is ready. This prevents overloading and lets each stage maintain quality.",
  },
  {
    id: 4,
    q: "Looking at the throughput chart, what pattern did you notice with smaller batch sizes?",
    opts: [
      "Items completed in big jumps at the end",
      "Items completed earlier and more steadily throughout",
      "No items completed at all",
      "The chart was identical regardless of batch size",
    ],
    ans: 1,
    exp: "With smaller batches, items start completing earlier and the throughput line rises gradually. Steady, early throughput is a sign of healthy flow.",
  },
  {
    id: 5,
    q: "Why do we limit Work in Progress (WIP) in Kanban?",
    opts: [
      "To make workers do less",
      "To reduce lead times, expose bottlenecks, and create smooth pull-based flow",
      "Because there aren\u2019t enough workers",
      "WIP limits don\u2019t affect flow",
    ],
    ans: 1,
    exp: "Limiting WIP is the core Kanban principle. Smaller batches (lower WIP) = faster lead times, less waiting, natural adaptation to bottlenecks.",
  },
];
