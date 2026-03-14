export const LESSON_META = {
  id: "littles-law-applied",
  title: "Applying Little's Law",
  subtitle: "Improving the Workflow · Lesson 5.1",
  steps: ["Intro", "Calculator", "Scenarios", "Quiz"],
};

export interface Scenario {
  id: number;
  title: string;
  description: string;
  wip: number;
  throughput: number;
  targetItems: number;
  targetDays: number;
  hint: string;
  analysis: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "The Impossible Release",
    description:
      "A team promises to deliver 50 features in 10 working days. They currently have 25 items in progress and complete about 3 items per day.",
    wip: 25,
    throughput: 3,
    targetItems: 50,
    targetDays: 10,
    hint: "Use Little's Law: Cycle Time = WIP \u00F7 Throughput. Then think about how many items can actually finish in the target window.",
    analysis:
      "With WIP=25 and Throughput=3/day, Little's Law gives Cycle Time = 25\u00F73 \u2248 8.3 days per item. In 10 days at 3/day throughput, only ~30 items can be delivered \u2014 not 50. The promise is mathematically impossible without reducing WIP or increasing throughput.",
  },
  {
    id: 2,
    title: "The WIP Explosion",
    description:
      "Management asks the team to start 15 new items immediately to \u2018show progress\u2019. Current WIP is 6, throughput is 4 items/day. What happens to cycle time?",
    wip: 6,
    throughput: 4,
    targetItems: 15,
    targetDays: 5,
    hint: "Calculate cycle time before and after the WIP increase. Remember: throughput rarely increases when WIP goes up \u2014 it often decreases.",
    analysis:
      "Before: CT = 6\u00F74 = 1.5 days. After adding 15: WIP=21, and throughput likely drops (say to 3/day due to context switching). New CT = 21\u00F73 = 7 days. Items take 4.7\u00D7 longer! Starting more work doesn't mean finishing more work.",
  },
  {
    id: 3,
    title: "The Predictability Problem",
    description:
      "A client asks: \u2018When will my feature be done?\u2019 The team has 12 items in progress, completes 2 per day, and the client's item just entered the backlog at position #8.",
    wip: 12,
    throughput: 2,
    targetItems: 8,
    targetDays: 0,
    hint: "The client's item needs to wait for items ahead of it, then go through the full cycle time. Consider both queue time and work time.",
    analysis:
      "Current CT = 12\u00F72 = 6 days. The client's item is 8th in queue, so it needs to wait for ~4 days (8\u00F72) before entering WIP, then another 6 days of cycle time. Estimated delivery: ~10 days. If WIP were reduced to 6, CT drops to 3 days, and total time would be ~7 days.",
  },
  {
    id: 4,
    title: "The Staffing Question",
    description:
      "A VP wants to hire 3 more developers to \u2018go faster\u2019. Current team: 8 people, WIP=16, throughput=5/day. Will adding people help?",
    wip: 16,
    throughput: 5,
    targetItems: 0,
    targetDays: 0,
    hint: "More people often means more WIP (each person starts something). What does Little's Law predict if WIP increases proportionally?",
    analysis:
      "Current: CT = 16\u00F75 = 3.2 days. If 3 new hires each start 2 items: WIP=22. Even if throughput increases to 6/day (optimistic \u2014 onboarding takes time), CT = 22\u00F76 = 3.7 days. Cycle time gets WORSE. The better move: keep WIP at 16 and let throughput naturally increase as the team grows.",
  },
];

export const QUIZ = [
  {
    id: 1,
    q: "A team has WIP=10 and throughput=2 items/day. What is their average cycle time?",
    opts: ["2 days", "5 days", "10 days", "20 days"],
    ans: 1,
    exp: "Little's Law: Cycle Time = WIP \u00F7 Throughput = 10 \u00F7 2 = 5 days.",
  },
  {
    id: 2,
    q: "If a team doubles their WIP without changing throughput, what happens to cycle time?",
    opts: [
      "It halves",
      "It stays the same",
      "It doubles",
      "It depends on the team size",
    ],
    ans: 2,
    exp: "CT = WIP \u00F7 TH. If WIP doubles and TH stays constant, CT doubles. Starting more work means each item takes longer.",
  },
  {
    id: 3,
    q: "A manager says 'We need to deliver 40 items in 2 weeks (10 days). Our throughput is 3/day.' Is this achievable?",
    opts: [
      "Yes, if everyone works harder",
      "Yes, if we start all 40 items immediately",
      "No \u2014 at 3/day throughput, only 30 items can finish in 10 days",
      "It depends on the batch size",
    ],
    ans: 2,
    exp: "At 3 items/day for 10 days, maximum delivery is 30 items. No amount of effort changes the throughput constraint. The promise needs to be renegotiated.",
  },
  {
    id: 4,
    q: "What is the most effective way to reduce cycle time according to Little's Law?",
    opts: [
      "Add more people to the team",
      "Work longer hours",
      "Reduce WIP",
      "Use a different project management tool",
    ],
    ans: 2,
    exp: "CT = WIP \u00F7 TH. Reducing WIP is the direct lever. Adding people often increases WIP proportionally, and longer hours don't sustainably increase throughput.",
  },
  {
    id: 5,
    q: "Little's Law assumes the system is stable. What does 'stable' mean in this context?",
    opts: [
      "Nobody is on vacation",
      "The average arrival rate roughly equals the average departure rate",
      "All work items are the same size",
      "The team has been together for at least 6 months",
    ],
    ans: 1,
    exp: "Stability means items enter and leave the system at roughly the same average rate. When arrival exceeds departure, WIP grows unbounded and Little's Law predictions become unreliable.",
  },
];
