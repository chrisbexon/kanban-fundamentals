import Link from "next/link";

interface Lesson {
  id: string;
  num: string;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  href: string;
  icon: string;
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  lessons: Lesson[];
}

const sections: Section[] = [
  {
    id: "introduction",
    title: "Introduction",
    subtitle: "Context & foundations",
    color: "#22c55e",
    lessons: [
      {
        id: "welcome",
        num: "1.1",
        title: "Welcome & Learning Objectives",
        description: "Course overview, how the platform works, and what you'll achieve by the end.",
        status: "available",
        href: "/lessons/welcome",
        icon: "\uD83D\uDC4B",
      },
      {
        id: "why-kanban",
        num: "1.2",
        title: "Why Kanban?",
        description: "Tell us about your role and goals. Your answers help us tailor the experience.",
        status: "available",
        href: "/lessons/why-kanban",
        icon: "\uD83D\uDCDD",
      },
      {
        id: "history",
        num: "1.3",
        title: "A Brief History",
        description: "From queuing theory and Toyota to modern knowledge work \u2014 how we got here.",
        status: "available",
        href: "/lessons/history",
        icon: "\uD83D\uDCDC",
      },
      {
        id: "industry-today",
        num: "1.4",
        title: "Kanban in Industry Today",
        description: "Real-world applications across software, healthcare, marketing, and beyond.",
        status: "available",
        href: "/lessons/industry-today",
        icon: "\uD83C\uDF0D",
      },
    ],
  },
  {
    id: "theory",
    title: "Theory & Principles",
    subtitle: "Core concepts through simulation",
    color: "#3b82f6",
    lessons: [
      {
        id: "kanban-principles",
        num: "2.1",
        title: "Kanban Principles & Strategy",
        description: "The definition, the goal (effective, predictable, efficient), the Toyota Production System, and the three core practices.",
        status: "available",
        href: "/lessons/kanban-principles",
        icon: "\u{1F9ED}",
      },
      {
        id: "penny-game",
        num: "2.2",
        title: "Batch Size & Flow",
        description: "The Penny Game \u2014 discover how batch size affects lead time, throughput, and flow.",
        status: "available",
        href: "/lessons/penny-game",
        icon: "\u{1FA99}",
      },
      {
        id: "littles-law",
        num: "2.3",
        title: "Little\u2019s Law",
        description: "Run a drive-through simulation and see why Cycle Time = WIP \u00F7 Throughput changes everything.",
        status: "available",
        href: "/lessons/littles-law",
        icon: "\uD83C\uDF54",
      },
    ],
  },
  {
    id: "practice",
    title: "Kanban in Practice",
    subtitle: "Applying what you\u2019ve learned",
    color: "#8b5cf6",
    lessons: [
      {
        id: "kanban-game",
        num: "3.1",
        title: "The Kanban Game",
        description: "Three rounds on a full Kanban board \u2014 WIP limits, work item age, and flow analysis across rounds.",
        status: "available",
        href: "/lessons/wip-limits",
        icon: "\u{1F3AE}",
      },
      {
        id: "pull-vs-push",
        num: "3.2",
        title: "Pull vs Push Systems",
        description: "Compare push and pull systems side by side and see how pull creates natural self-regulation.",
        status: "coming-soon",
        href: "#",
        icon: "\u{1F504}",
      },
      {
        id: "flow-metrics",
        num: "3.3",
        title: "Flow Metrics & Forecasting",
        description: "Monte Carlo simulation, throughput analysis, right-sizing, and probability-based forecasting with real data.",
        status: "available",
        href: "/lessons/flow-metrics",
        icon: "\u{1F4CA}",
      },
    ],
  },
  {
    id: "visualisation",
    title: "Workflow Visualisation",
    subtitle: "Designing your board",
    color: "#f59e0b",
    lessons: [
      {
        id: "workflow-definition",
        num: "4.1",
        title: "Defining the Workflow",
        description: "The six minimum elements every Kanban system needs. Identify them on the Kanban Game board.",
        status: "available",
        href: "/lessons/workflow-definition",
        icon: "\u{1F4CB}",
      },
      {
        id: "workflow-scenarios",
        num: "4.2",
        title: "Identifying Workflows",
        description: "Spot workflow elements in real-world systems: drive-throughs, software teams, and more.",
        status: "available",
        href: "/lessons/workflow-scenarios",
        icon: "\u{1F50D}",
      },
      {
        id: "board-designer",
        num: "4.3",
        title: "Design Your Board",
        description: "Build a fully customised Kanban board with columns, swimlanes, WIP limits, and explicit policies.",
        status: "coming-soon",
        href: "#",
        icon: "\u{1F3A8}",
      },
    ],
  },
  {
    id: "improving",
    title: "Improving the Workflow",
    subtitle: "Continuous improvement",
    color: "#ef4444",
    lessons: [
      {
        id: "improve-placeholder",
        num: "5.1",
        title: "Coming Soon",
        description: "Lessons on identifying and acting on improvement opportunities are being prepared.",
        status: "coming-soon",
        href: "#",
        icon: "\u{1F680}",
      },
    ],
  },
];

function SectionProgress({ lessons }: { lessons: Lesson[] }) {
  const total = lessons.length;
  const available = lessons.filter((l) => l.status === "available").length;
  // For now, "available" = built. Later this will track actual completion.
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-faint)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "rgba(34,197,94,0.6)" }}
        />
      </div>
      <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
        {available}/{total}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="fade-up mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[3px] mb-1" style={{ color: "var(--text-dimmer)" }}>
          Genius Teams &middot; Training Platform
        </div>
        <h1
          className="text-[clamp(22px,4vw,30px)] font-extrabold m-0 mb-2"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Kanban Fundamentals
        </h1>
        <p className="text-sm m-0 max-w-[600px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Master Kanban principles through interactive simulations, real data, and hands-on practice.
          Work through each section to earn badges and a certificate of completion.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((section, si) => {
          const hasAvailable = section.lessons.some((l) => l.status === "available");
          return (
            <div key={section.id} className="slide-in" style={{ animationDelay: `${si * 80}ms` }}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: section.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-base font-extrabold m-0" style={{ color: "var(--text-primary)" }}>
                      {section.title}
                    </h2>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {section.subtitle}
                    </span>
                  </div>
                  <SectionProgress lessons={section.lessons} />
                </div>
              </div>

              {/* Lesson cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
                {section.lessons.map((lesson) => {
                  const available = lesson.status === "available";
                  const Wrapper = available ? Link : "div";
                  return (
                    <Wrapper
                      key={lesson.id}
                      href={lesson.href}
                      className="block rounded-[12px] p-4 transition-all duration-300 no-underline group"
                      style={{
                        background: "var(--bg-surface)",
                        border: available
                          ? `1px solid ${section.color}20`
                          : "1px solid var(--border-faint)",
                        opacity: available ? 1 : 0.45,
                        cursor: available ? "pointer" : "default",
                      }}
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${section.color}10`, border: `1px solid ${section.color}20` }}
                        >
                          {lesson.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold font-mono uppercase tracking-wider" style={{ color: section.color }}>
                            Lesson {lesson.num}
                          </div>
                          <div className="text-[13px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] m-0 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                        {lesson.description}
                      </p>
                      <div className="mt-2.5">
                        {available ? (
                          <span
                            className="text-[10px] font-bold transition-colors"
                            style={{ color: section.color }}
                          >
                            Start Lesson &rarr;
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
