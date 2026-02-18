import Link from "next/link";

const lessons = [
  {
    id: "penny-game",
    title: "The Penny Game",
    subtitle: "Batch Size & Flow",
    description: "Discover how batch size affects lead time, throughput, and flow through an interactive coin workshop simulation.",
    status: "available" as const,
    href: "/lessons/penny-game",
    color: "#3b82f6",
    icon: "\u{1FA99}",
  },
  {
    id: "wip-limits",
    title: "WIP Limits",
    subtitle: "Work Item Age & Bottlenecks",
    description: "Learn why limiting work in progress is the core Kanban practice and how it exposes system bottlenecks.",
    status: "available" as const,
    href: "/lessons/wip-limits",
    color: "#8b5cf6",
    icon: "\u{1F6A7}",
  },
  {
    id: "littles-law",
    title: "Little's Law",
    subtitle: "The Mathematics of Flow",
    description: "Explore the fundamental relationship: Lead Time = WIP \u00F7 Throughput through interactive experiments.",
    status: "coming-soon" as const,
    href: "#",
    color: "#10b981",
    icon: "\u{1F4D0}",
  },
  {
    id: "pull-vs-push",
    title: "Pull vs Push",
    subtitle: "System Design Patterns",
    description: "Compare push and pull systems side by side and see how pull creates natural self-regulation.",
    status: "coming-soon" as const,
    href: "#",
    color: "#f59e0b",
    icon: "\u{1F504}",
  },
  {
    id: "flow-metrics",
    title: "Flow Metrics Dashboard",
    subtitle: "Reading the Signals",
    description: "Build and interpret real Kanban flow metrics: CFD, throughput run charts, and cycle time scatterplots.",
    status: "coming-soon" as const,
    href: "#",
    color: "#ef4444",
    icon: "\u{1F4CA}",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="fade-up mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[3px] mb-1" style={{ color: "var(--text-dimmer)" }}>
          Training Platform
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
          Master the core principles of Kanban through interactive simulations.
          Complete each lesson in order to build a solid foundation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson, i) => {
          const available = lesson.status === "available";
          const Wrapper = available ? Link : "div";
          return (
            <Wrapper
              key={lesson.id}
              href={lesson.href}
              className="slide-in block rounded-[14px] p-5 transition-all duration-300 no-underline group"
              style={{
                background: "var(--bg-surface)",
                border: available
                  ? `1px solid ${lesson.color}25`
                  : "1px solid var(--border-faint)",
                animationDelay: `${i * 100}ms`,
                opacity: available ? 1 : 0.5,
                cursor: available ? "pointer" : "default",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${lesson.color}15`, border: `1px solid ${lesson.color}25` }}
                >
                  {lesson.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: lesson.color }}>
                    {lesson.subtitle}
                  </div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{lesson.title}</div>
                </div>
              </div>
              <p className="text-xs m-0 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{lesson.description}</p>
              <div className="mt-3">
                {available ? (
                  <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                    Start Lesson &rarr;
                  </span>
                ) : (
                  <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Coming Soon</span>
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
