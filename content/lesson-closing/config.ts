export const LESSON_META = {
  id: "closing",
  title: "Course Wrap-Up",
  subtitle: "Closing · Certification",
  steps: ["Myth or Fact", "Reflection", "Feedback", "Certificate"],
};

export interface MythFactItem {
  id: number;
  statement: string;
  answer: "fact" | "myth";
  explanation: string;
}

export const MYTH_FACT_QUIZ: MythFactItem[] = [
  {
    id: 1,
    statement: "Optimizing flow is a balance between effectiveness, predictability, and efficiency",
    answer: "fact",
    explanation:
      "The Kanban Guide states that the goal of a Kanban strategy is to optimise the flow of value by being effective (delivering the right things), predictable (forecasting reliably), and efficient (minimising waste).",
  },
  {
    id: 2,
    statement: "Kanban system members are expected to continuously improve their workflow",
    answer: "fact",
    explanation:
      "Continuous improvement is a core expectation. The Kanban Guide states that all members actively manage flow, review results, and evolve their workflow based on evidence.",
  },
  {
    id: 3,
    statement: "Limiting WIP is the only way to decrease cycle time",
    answer: "myth",
    explanation:
      "While limiting WIP is the most powerful lever (Little's Law), cycle time can also be reduced by removing blockers, improving policies, right-sizing work items, reducing wait times, and eliminating rework.",
  },
  {
    id: 4,
    statement: "Creating an expedite lane or classes of service for urgent work items is forbidden in Kanban",
    answer: "myth",
    explanation:
      "Classes of service (including expedite) are a standard Kanban practice. They allow teams to handle different types of work appropriately — expedite items bypass normal queue ordering but should be rare.",
  },
  {
    id: 5,
    statement: "Lead time and cycle time are the same thing",
    answer: "fact",
    explanation:
      "In the Kanban Guide, cycle time is defined as the elapsed time from when a work item enters the 'started' state to when it reaches a 'finished' state. This is also commonly called lead time. The guide uses them synonymously.",
  },
  {
    id: 6,
    statement: "A Kanban board must have exactly three columns: To Do, In Progress, and Done",
    answer: "myth",
    explanation:
      "A Kanban board should reflect your actual workflow. Teams design columns to match their real process stages — this might be 4, 6, or 10 columns. The board visualises reality, it doesn't prescribe a structure.",
  },
  {
    id: 7,
    statement: "You can use Kanban alongside other frameworks like Scrum",
    answer: "fact",
    explanation:
      "Kanban is a strategy that can overlay any existing process. Many teams use Kanban with Scrum (sometimes called Scrumban), adding WIP limits and flow metrics to their sprint-based workflow.",
  },
  {
    id: 8,
    statement: "Kanban requires teams to estimate all work items before starting them",
    answer: "myth",
    explanation:
      "Kanban does not require estimation. Instead, it uses historical throughput data and Monte Carlo simulation for forecasting. Items need to be right-sized (small enough to finish within the SLE), not estimated in hours or points.",
  },
  {
    id: 9,
    statement: "Flow efficiency below 100% means there is waste in the process",
    answer: "fact",
    explanation:
      "Flow efficiency is the ratio of active work time to total cycle time. Most teams operate at 15-40% flow efficiency, meaning items spend 60-85% of their time waiting in queues. This waiting time is a form of waste that can be reduced.",
  },
  {
    id: 10,
    statement: "The purpose of WIP limits is to keep team members busy at all times",
    answer: "myth",
    explanation:
      "WIP limits optimise for flow, not utilisation. When a WIP limit prevents starting new work, the right response is to help finish existing work (swarming), not to find busy work. High utilisation actually increases cycle time.",
  },
];

export interface ReflectionCategory {
  id: string;
  label: string;
  placeholder: string;
  icon: string;
}

export const REFLECTION_CATEGORIES: ReflectionCategory[] = [
  {
    id: "facts",
    label: "Information & Facts",
    placeholder: "What key facts or data points stuck with you? (e.g., Little's Law formula, flow efficiency percentages...)",
    icon: "\uD83D\uDCDA",
  },
  {
    id: "tools",
    label: "Tools & Techniques",
    placeholder: "What tools or techniques will you take back to your team? (e.g., WIP limits, Monte Carlo, aging WIP charts...)",
    icon: "\uD83D\uDEE0\uFE0F",
  },
  {
    id: "surprises",
    label: "Surprises",
    placeholder: "What surprised you? What challenged your assumptions? (e.g., estimation isn't needed for forecasting...)",
    icon: "\uD83D\uDE2E",
  },
  {
    id: "aha",
    label: "A-ha Moments",
    placeholder: "What 'clicked' for you? What connections did you make? (e.g., the link between WIP and cycle time...)",
    icon: "\uD83D\uDCA1",
  },
  {
    id: "insights",
    label: "New Insights",
    placeholder: "What new ideas or perspectives will you explore further? (e.g., applying flow metrics to my team's board...)",
    icon: "\uD83D\uDD2D",
  },
];

export const FEEDBACK_QUESTIONS = [
  {
    id: "overall",
    label: "How would you rate this course overall?",
    type: "rating" as const,
  },
  {
    id: "simulations",
    label: "How useful were the interactive simulations?",
    type: "rating" as const,
  },
  {
    id: "best",
    label: "What was the most valuable part of the course?",
    type: "text" as const,
  },
  {
    id: "improve",
    label: "What could be improved?",
    type: "text" as const,
  },
  {
    id: "recommend",
    label: "Would you recommend this course to a colleague?",
    type: "rating" as const,
  },
];
