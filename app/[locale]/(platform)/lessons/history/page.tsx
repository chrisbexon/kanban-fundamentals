"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const LABELS = ["Timeline", "Key Takeaways"];

interface Milestone {
  year: string;
  title: string;
  person: string;
  detail: string;
  significance: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "1909",
    title: "The Mathematics of Waiting",
    person: "Agner Krarup Erlang",
    detail: "A Danish mathematician working at the Copenhagen Telephone Exchange published the first queuing theory paper. He modelled how calls arriving randomly created wait times \u2014 and proved mathematically that you could predict congestion from arrival rates and service times.",
    significance: "This is the mathematical foundation of everything in this course. Every time we talk about throughput, cycle time, or arrival rate, we\u2019re standing on Erlang\u2019s shoulders.",
    color: "#3b82f6",
  },
  {
    year: "1924",
    title: "Measuring Variation",
    person: "Walter Shewhart, Bell Labs",
    detail: "Shewhart invented the control chart \u2014 a visual tool for distinguishing normal variation from special-cause variation in a process. He showed that trying to react to every fluctuation actually makes systems worse.",
    significance: "Control charts taught us to manage by understanding variation, not by chasing every number. This thinking underpins the flow metrics you\u2019ll learn to read in this course.",
    color: "#6366f1",
  },
  {
    year: "1950s",
    title: "The Quality Revolution",
    person: "W. Edwards Deming",
    detail: "Deming brought statistical quality thinking to post-war Japan, where manufacturers eagerly adopted his methods. His Plan-Do-Check-Act cycle became the engine of continuous improvement. Japanese industry went from a reputation for cheap copies to world-leading quality in two decades.",
    significance: "Deming proved that improving the system \u2014 not blaming individuals \u2014 is how you improve results. This systems-thinking approach is central to Kanban.",
    color: "#8b5cf6",
  },
  {
    year: "1953",
    title: "The Kanban Card Is Born",
    person: "Taiichi Ohno, Toyota",
    detail: "Ohno, inspired by American supermarkets where shelves were restocked only when items were taken, created the kanban (signboard) card system at Toyota. When a downstream station consumed a part, a card signalled upstream to produce a replacement \u2014 nothing more. This was the birth of just-in-time and pull-based production.",
    significance: "The original kanban was a physical signal to limit overproduction. The core principle \u2014 only start new work when there\u2019s capacity \u2014 is exactly what WIP limits enforce on a Kanban board today.",
    color: "#ef4444",
  },
  {
    year: "1961",
    title: "Little\u2019s Law",
    person: "John Little, MIT",
    detail: "Little proved a deceptively simple formula: L = \u03BBW (the long-term average number of items in a system equals the average arrival rate multiplied by the average time each item spends in the system). The beauty is that it holds for virtually any queuing system, regardless of how complex the internal process is.",
    significance: "This is the equation you\u2019ll explore in the drive-through simulation. It connects WIP, throughput, and cycle time \u2014 and tells you that the fastest way to reduce lead time is to reduce WIP.",
    color: "#f59e0b",
  },
  {
    year: "1984",
    title: "The Theory of Constraints",
    person: "Eliyahu Goldratt",
    detail: "Goldratt published \u201CThe Goal\u201D \u2014 a novel about a factory manager who discovers that optimising every station independently makes the whole system worse. The bottleneck dictates the throughput of the entire system, and the only improvements that matter are those that address the bottleneck.",
    significance: "This is why Kanban focuses on the system, not individual productivity. A developer working at 100% utilisation doesn\u2019t help if work is stuck waiting in a queue downstream.",
    color: "#22c55e",
  },
  {
    year: "1988",
    title: "Lean Gets Its Name",
    person: "John Krafcik, MIT",
    detail: "Krafcik coined the term \u201Clean production\u201D in his MIT master\u2019s thesis, describing Toyota\u2019s system. Womack, Jones, and Roos popularised it globally in \u201CThe Machine That Changed the World\u201D (1990), and \u201CLean Thinking\u201D (1996) distilled the principles: identify value, map the value stream, create flow, establish pull, pursue perfection.",
    significance: "Lean gave the world a vocabulary and framework for thinking about flow. Kanban inherits all five lean principles \u2014 especially flow and pull.",
    color: "#3b82f6",
  },
  {
    year: "2004",
    title: "Kanban Meets Knowledge Work",
    person: "David J. Anderson",
    detail: "Anderson, working at Microsoft\u2019s XIT Sustained Engineering team, applied Toyota\u2019s kanban concepts to software development \u2014 visualising work on a board, limiting WIP, and measuring flow. He refined the approach at Corbis (2006\u20132007) and published \u201CKanban: Successful Evolutionary Change for Your Technology Business\u201D in 2010.",
    significance: "Anderson didn\u2019t just translate factory kanban to software. He created a change management method: start with what you do now, agree to pursue incremental change, and let the data guide you. This is the Kanban Method.",
    color: "#8b5cf6",
  },
  {
    year: "2015",
    title: "Actionable Flow Metrics",
    person: "Daniel Vacanti",
    detail: "Vacanti published \u201CActionable Agile Metrics for Predictability\u201D, making flow metrics practical and accessible. He popularised the cycle time scatterplot, formalised Service Level Expectations (SLEs), and showed teams how to use their own data for forecasting instead of estimates.",
    significance: "Vacanti turned metrics from a management reporting exercise into a team decision-making tool. The scatterplots and SLEs you\u2019ll use in this course come directly from his work.",
    color: "#ef4444",
  },
  {
    year: "2015+",
    title: "Probabilistic Forecasting",
    person: "Troy Magennis",
    detail: "Magennis pioneered the use of Monte Carlo simulation for software delivery forecasting, building tools like the Throughput Forecaster that let teams answer \u201Cwhen\u201D and \u201Chow many\u201D questions using only historical throughput data \u2014 no story points, no estimation sessions.",
    significance: "This is exactly what you\u2019ll do in Lesson 3.3. Monte Carlo replaces the fiction of single-point estimates with honest probability distributions.",
    color: "#f59e0b",
  },
  {
    year: "Today",
    title: "Kanban Everywhere",
    person: "Global community",
    detail: "Kanban has spread far beyond software. Hospitals use it to manage patient flow and reduce wait times. Marketing teams use it to manage campaigns. Law firms track cases through stages. Construction companies visualise project workflows. The Kanban Guide (ProKanban.org) provides a lightweight, industry-agnostic framework, and the community continues to evolve practices.",
    significance: "Kanban works wherever work flows through stages and people need visibility, predictability, and a way to improve. That\u2019s why you\u2019re here.",
    color: "#22c55e",
  },
];

function TimelineStep({ onNext }: { onNext: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fade-up max-w-[780px]">
      <StepHeader
        tag="Lesson 1.3"
        tagColor="#22c55e"
        title="A Brief History of Flow"
        desc="Over a century of ideas led to the Kanban you'll learn in this course. Tap any milestone to learn more."
      />

      <div className="relative ml-4">
        {/* Vertical line */}
        <div
          className="absolute left-3 top-0 bottom-0 w-px"
          style={{ background: "var(--border-faint)" }}
        />

        {MILESTONES.map((m, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className="relative pl-10 pb-6">
              {/* Dot */}
              <div
                className="absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-extrabold font-mono z-10 cursor-pointer transition-all"
                style={{
                  background: isOpen ? m.color : `${m.color}20`,
                  color: isOpen ? "#fff" : m.color,
                  border: `2px solid ${m.color}`,
                }}
                onClick={() => setExpanded(isOpen ? null : i)}
              />

              {/* Content */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full text-left border-none cursor-pointer p-0 bg-transparent"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[13px] font-extrabold font-mono" style={{ color: m.color }}>
                    {m.year}
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {m.title}
                  </span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {m.person}
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 fade-up">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: `${m.color}06`, border: `1px solid ${m.color}15` }}
                  >
                    <div className="text-[12px] leading-[1.75] mb-3" style={{ color: "var(--text-secondary)" }}>
                      {m.detail}
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                      style={{ background: `${m.color}08`, border: `1px solid ${m.color}15`, color: m.color }}
                    >
                      <strong>Why it matters:</strong> {m.significance}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-5">
        <Btn primary onClick={onNext}>Key Takeaways &rarr;</Btn>
      </div>
    </div>
  );
}

function TakeawaysStep({ onBack }: { onBack: () => void }) {
  const takeaways = [
    {
      title: "Flow thinking is over 100 years old",
      desc: "Kanban didn\u2019t appear from nowhere. It builds on a century of queuing theory, statistical thinking, and manufacturing science. The maths works.",
      color: "#3b82f6",
    },
    {
      title: "Pull beats push",
      desc: "From Toyota\u2019s factory floor to your digital board, the principle is the same: only start new work when there\u2019s capacity. Overloading the system makes everything slower.",
      color: "#8b5cf6",
    },
    {
      title: "Improve the system, not the individual",
      desc: "Deming, Goldratt, and Ohno all reached the same conclusion: the performance of a system is determined by how the parts interact, not how hard each part works.",
      color: "#ef4444",
    },
    {
      title: "Measure, don\u2019t estimate",
      desc: "From Shewhart\u2019s control charts to Vacanti\u2019s scatterplots to Magennis\u2019s Monte Carlo simulations, the trend is clear: empirical data beats expert opinion every time.",
      color: "#f59e0b",
    },
    {
      title: "Kanban is not just for software",
      desc: "The principles apply wherever work flows through stages. Healthcare, legal, marketing, construction, education \u2014 the method is industry-agnostic.",
      color: "#22c55e",
    },
  ];

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Key Takeaways"
        tagColor="#22c55e"
        title="What History Teaches Us"
        desc="Five ideas that connect the past to everything you'll learn in this course."
      />

      <div className="flex flex-col gap-3">
        {takeaways.map((t) => (
          <div
            key={t.title}
            className="rounded-xl p-4 flex gap-3 items-start"
            style={{ background: `${t.color}05`, border: `1px solid ${t.color}12` }}
          >
            <div
              className="w-2 h-8 rounded-full flex-shrink-0 mt-0.5"
              style={{ background: t.color }}
            />
            <div>
              <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                {t.title}
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {t.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 rounded-xl p-5 text-center"
        style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
      >
        <div className="text-sm font-bold mb-2" style={{ color: "#4ade80" }}>Up Next</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          See how these ideas are being applied across industries right now.
        </div>
        <Link href="/lessons/industry-today" className="no-underline">
          <Btn primary>Lesson 1.4: Kanban in Industry Today &rarr;</Btn>
        </Link>
      </div>

      <div className="flex justify-start mt-5">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}

export default function HistoryLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <TimelineStep onNext={() => setStep(1)} />}
      {step === 1 && <TakeawaysStep onBack={() => setStep(0)} />}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div className="w-2 h-10 rounded flex-shrink-0" style={{ background: "#22c55e" }} />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Section 1 &middot; Introduction
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          A Brief History
        </h1>
      </div>
    </div>
  );
}
