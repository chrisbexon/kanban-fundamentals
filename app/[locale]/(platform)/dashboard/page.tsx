import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface LessonDef {
  id: string;
  num: string;
  status: "available" | "coming-soon";
  href: string;
  icon: string;
}

interface SectionDef {
  id: string;
  color: string;
  lessons: LessonDef[];
}

const sectionDefs: SectionDef[] = [
  {
    id: "introduction",
    color: "#22c55e",
    lessons: [
      { id: "welcome", num: "1.1", status: "available", href: "/lessons/welcome", icon: "\uD83D\uDC4B" },
      { id: "why-kanban", num: "1.2", status: "available", href: "/lessons/why-kanban", icon: "\uD83D\uDCDD" },
      { id: "history", num: "1.3", status: "available", href: "/lessons/history", icon: "\uD83D\uDCDC" },
      { id: "industry-today", num: "1.4", status: "available", href: "/lessons/industry-today", icon: "\uD83C\uDF0D" },
    ],
  },
  {
    id: "theory",
    color: "#3b82f6",
    lessons: [
      { id: "kanban-principles", num: "2.1", status: "available", href: "/lessons/kanban-principles", icon: "\u{1F9ED}" },
      { id: "penny-game", num: "2.2", status: "available", href: "/lessons/penny-game", icon: "\u{1FA99}" },
      { id: "littles-law", num: "2.3", status: "available", href: "/lessons/littles-law", icon: "\uD83C\uDF54" },
    ],
  },
  {
    id: "practice",
    color: "#8b5cf6",
    lessons: [
      { id: "kanban-game", num: "3.1", status: "available", href: "/lessons/wip-limits", icon: "\u{1F3AE}" },
      { id: "pull-vs-push", num: "3.2", status: "available", href: "/lessons/pull-vs-push", icon: "\u{1F504}" },
      { id: "flow-metrics", num: "3.3", status: "available", href: "/lessons/flow-metrics", icon: "\u{1F4CA}" },
    ],
  },
  {
    id: "visualisation",
    color: "#f59e0b",
    lessons: [
      { id: "workflow-definition", num: "4.1", status: "available", href: "/lessons/workflow-definition", icon: "\u{1F4CB}" },
      { id: "workflow-scenarios", num: "4.2", status: "available", href: "/lessons/workflow-scenarios", icon: "\u{1F50D}" },
      { id: "board-designer", num: "4.3", status: "available", href: "/lessons/board-designer", icon: "\u{1F3A8}" },
    ],
  },
  {
    id: "improving",
    color: "#ef4444",
    lessons: [
      { id: "littles-law-applied", num: "5.1", status: "available", href: "/lessons/littles-law-applied", icon: "\u{1F9EE}" },
      { id: "flow-metrics-deep-dive", num: "5.2", status: "available", href: "/lessons/flow-metrics-deep-dive", icon: "\u{1F4C8}" },
      { id: "board-analysis", num: "5.3", status: "available", href: "/lessons/board-analysis", icon: "\u{1F50E}" },
      { id: "workflow-improvements", num: "5.4", status: "available", href: "/lessons/workflow-improvements", icon: "\u{1F527}" },
    ],
  },
  {
    id: "closing",
    color: "#f59e0b",
    lessons: [
      { id: "closing", num: "6.1", status: "available", href: "/lessons/closing", icon: "\u{1F3C6}" },
    ],
  },
];

export default async function DashboardPage() {
  const [tDashboard, tSections, tLessons, tCommon] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("sections"),
    getTranslations("lessons"),
    getTranslations("common"),
  ]);

  return (
    <div>
      <div className="fade-up mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[3px] mb-1" style={{ color: "var(--text-dimmer)" }}>
          {tDashboard("tagline")}
        </div>
        <h1
          className="text-[clamp(22px,4vw,30px)] font-extrabold m-0 mb-2"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {tDashboard("title")}
        </h1>
        <p className="text-sm m-0 max-w-[600px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          {tDashboard("subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {sectionDefs.map((section, si) => {
          const sectionTitle = tSections(`${section.id}.title` as any);
          const sectionSubtitle = tSections(`${section.id}.subtitle` as any);
          const total = section.lessons.length;
          const available = section.lessons.filter((l) => l.status === "available").length;

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
                      {sectionTitle}
                    </h2>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {sectionSubtitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {tCommon("lessonsAvailable", { available, total })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lesson cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
                {section.lessons.map((lesson) => {
                  const isAvailable = lesson.status === "available";
                  const lessonTitle = tLessons(`${lesson.id}.title` as any);
                  const lessonDescription = tLessons(`${lesson.id}.description` as any);
                  const Wrapper = isAvailable ? Link : "div";
                  return (
                    <Wrapper
                      key={lesson.id}
                      href={lesson.href}
                      className="block rounded-[12px] p-4 transition-all duration-300 no-underline group"
                      style={{
                        background: "var(--bg-surface)",
                        border: isAvailable
                          ? `1px solid ${section.color}20`
                          : "1px solid var(--border-faint)",
                        opacity: isAvailable ? 1 : 0.45,
                        cursor: isAvailable ? "pointer" : "default",
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
                            {tCommon("lesson")} {lesson.num}
                          </div>
                          <div className="text-[13px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                            {lessonTitle}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] m-0 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                        {lessonDescription}
                      </p>
                      <div className="mt-2.5">
                        {isAvailable ? (
                          <span
                            className="text-[10px] font-bold transition-colors"
                            style={{ color: section.color }}
                          >
                            {tCommon("startLesson")} &rarr;
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                            {tCommon("comingSoon")}
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
