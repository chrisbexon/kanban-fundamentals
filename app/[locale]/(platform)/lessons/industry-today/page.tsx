"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const LABELS = ["Industries", "Common Patterns", "Ready?"];

interface IndustryCase {
  industry: string;
  icon: string;
  color: string;
  challenge: string;
  howKanban: string;
  result: string;
}

const CASES: IndustryCase[] = [
  {
    industry: "Healthcare",
    icon: "\u{1FA7A}",
    color: "#ef4444",
    challenge: "Emergency departments face unpredictable patient arrivals, complex handoffs between triage, treatment, and discharge, and life-or-death consequences when flow breaks down.",
    howKanban: "Hospitals visualise patient flow on boards, limit the number of patients in each stage, and use cycle time data to identify bottlenecks. NHS trusts in the UK have used Kanban to reduce A&E wait times by making the invisible queue visible.",
    result: "Reduced patient wait times, fewer handoff errors, staff can see at a glance where the pressure is building.",
  },
  {
    industry: "Software Development",
    icon: "\uD83D\uDCBB",
    color: "#3b82f6",
    challenge: "Teams juggling features, bugs, tech debt, and urgent requests. Work piles up, context switching kills productivity, and stakeholders want dates nobody can honestly give.",
    howKanban: "Visualise all work types on a single board, enforce WIP limits to prevent overload, use throughput data for Monte Carlo forecasting instead of story point estimation.",
    result: "Predictable delivery, reduced lead times, honest conversations with stakeholders based on data instead of guesses.",
  },
  {
    industry: "Marketing & Creative",
    icon: "\uD83C\uDFA8",
    color: "#f59e0b",
    challenge: "Campaign work arrives from multiple stakeholders with competing priorities. Creative teams are constantly interrupted with \u201Cquick requests\u201D that aren\u2019t quick at all.",
    howKanban: "Making all work visible \u2014 including the hidden \u201Cquick requests\u201D \u2014 shows the true demand on the team. WIP limits force prioritisation conversations that previously never happened.",
    result: "Stakeholders see the queue and self-prioritise. Teams deliver higher-quality work by focusing instead of multitasking.",
  },
  {
    industry: "Legal",
    icon: "\u2696\uFE0F",
    color: "#8b5cf6",
    challenge: "Cases progress through research, drafting, review, and filing \u2014 each with different specialists. Work gets stuck in queues between stages, and nobody knows the status without asking.",
    howKanban: "Visualising case flow exposes the waiting stages. Aging metrics highlight cases that are falling behind. Explicit policies make handoff criteria clear.",
    result: "Faster case resolution, fewer missed deadlines, better client communication about progress.",
  },
  {
    industry: "Construction & Engineering",
    icon: "\uD83C\uDFD7\uFE0F",
    color: "#22c55e",
    challenge: "Complex projects with dependencies between trades, weather delays, supply chain variability, and strict regulatory milestones.",
    howKanban: "Visual scheduling boards at the site, pull-based task management where the next trade starts only when the prerequisite work is verified complete, daily stand-ups at the board.",
    result: "Fewer rework cycles, better coordination between trades, earlier identification of blockers.",
  },
  {
    industry: "Education",
    icon: "\uD83C\uDF93",
    color: "#f59e0b",
    challenge: "Course development involves subject matter experts, instructional designers, reviewers, and technical teams. Content gets stuck in approval loops for weeks.",
    howKanban: "Visualising the content pipeline reveals where bottlenecks form. WIP limits on the review stage prevent the \u201Capproval backlog\u201D from growing unchecked.",
    result: "Faster course releases, clearer ownership at each stage, better visibility for stakeholders.",
  },
];

const PATTERNS = [
  {
    title: "Make work visible",
    desc: "In every industry, the first step is the same: put all work on a board so everyone can see it. Hidden work is unmanaged work. You can\u2019t improve what you can\u2019t see.",
    icon: "\uD83D\uDC41\uFE0F",
    color: "#3b82f6",
  },
  {
    title: "Limit work in progress",
    desc: "Every successful Kanban implementation involves saying \u201Cnot yet\u201D to some work so that active work can finish faster. This is counterintuitive but universally effective.",
    icon: "\u{1F6A7}",
    color: "#8b5cf6",
  },
  {
    title: "Manage flow, not people",
    desc: "Kanban focuses on how work moves through the system, not on keeping individuals busy. The goal is smooth, predictable flow \u2014 not 100% utilisation of every person.",
    icon: "\uD83C\uDF0A",
    color: "#22c55e",
  },
  {
    title: "Use data for decisions",
    desc: "Cycle time, throughput, WIP \u2014 these metrics replace gut feelings and status meetings. Teams that measure their flow make better decisions and have more productive conversations.",
    icon: "\uD83D\uDCCA",
    color: "#f59e0b",
  },
  {
    title: "Improve incrementally",
    desc: "Kanban doesn\u2019t ask you to blow up your current process and start over. It starts with what you do now and helps you evolve through small, safe-to-fail experiments.",
    icon: "\uD83D\uDD04",
    color: "#ef4444",
  },
];

function IndustriesStep({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fade-up max-w-[780px]">
      <StepHeader
        tag="Lesson 1.4"
        tagColor="#22c55e"
        title="Kanban in Industry Today"
        desc="Kanban works wherever work flows through stages. Tap an industry to see how."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CASES.map((c, i) => (
          <button
            key={c.industry}
            onClick={() => setSelected(selected === i ? null : i)}
            className="rounded-xl p-4 text-center border-none cursor-pointer transition-all"
            style={{
              background: selected === i ? `${c.color}10` : "var(--bg-surface)",
              border: selected === i ? `1px solid ${c.color}30` : "1px solid var(--border-faint)",
            }}
          >
            <div className="text-2xl mb-1.5">{c.icon}</div>
            <div className="text-[12px] font-bold" style={{ color: selected === i ? c.color : "var(--text-primary)" }}>
              {c.industry}
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="mt-4 fade-up">
          <div
            className="rounded-xl p-5"
            style={{ background: `${CASES[selected].color}05`, border: `1px solid ${CASES[selected].color}15` }}
          >
            <div className="text-sm font-bold mb-3" style={{ color: CASES[selected].color }}>
              {CASES[selected].icon} {CASES[selected].industry}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  The Challenge
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {CASES[selected].challenge}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  How Kanban Helps
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {CASES[selected].howKanban}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  The Result
                </div>
                <div className="text-[12px] leading-relaxed font-medium" style={{ color: CASES[selected].color }}>
                  {CASES[selected].result}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>Common Patterns &rarr;</Btn>
      </div>
    </div>
  );
}

function PatternsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Common Patterns"
        tagColor="#22c55e"
        title="What Every Industry Has in Common"
        desc="Regardless of the domain, successful Kanban implementations share these five patterns."
      />

      <div className="flex flex-col gap-3">
        {PATTERNS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl p-4 flex gap-3 items-start"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${p.color}10`, border: `1px solid ${p.color}20` }}
            >
              {p.icon}
            </div>
            <div>
              <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                {p.title}
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {p.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>Wrap Up &rarr;</Btn>
      </div>
    </div>
  );
}

function ReadyStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Section Complete"
        tagColor="#22c55e"
        title="Introduction Complete!"
        desc="You've got the context. Now let's build the understanding."
      />

      <Card accent="34,197,94">
        <div className="text-sm font-bold mb-2" style={{ color: "#4ade80" }}>Section 1 Badge Earned</div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          You&apos;ve completed the Introduction section. You now understand why Kanban exists, where it came
          from, and how it&apos;s being used across industries today. This context will make everything
          in the coming sections click into place.
        </div>
      </Card>

      <div className="mt-5 text-sm leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          <strong style={{ color: "var(--text-primary)" }}>Next up: Section 2 &mdash; Theory &amp; Principles.</strong>{" "}
          This is where it gets hands-on. You&apos;ll start with the Kanban definition, goals, and
          the Toyota Production System. Then you&apos;ll run the Penny Game simulation and step into a
          drive-through to see Little&apos;s Law in action.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <Link href="/lessons/kanban-principles" className="no-underline">
          <div
            className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider mb-1" style={{ color: "#3b82f6" }}>
              Lesson 2.1
            </div>
            <div className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Kanban Principles &amp; Strategy
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Definition, goals &amp; the three practices
            </div>
          </div>
        </Link>
        <Link href="/lessons/penny-game" className="no-underline">
          <div
            className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider mb-1" style={{ color: "#3b82f6" }}>
              Lesson 2.2
            </div>
            <div className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Batch Size &amp; Flow
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              The Penny Game simulation
            </div>
          </div>
        </Link>
      </div>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Link href="/dashboard" className="no-underline">
          <Btn primary>Back to Dashboard</Btn>
        </Link>
      </div>
    </div>
  );
}

export default function IndustryTodayLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <IndustriesStep onNext={() => setStep(1)} />}
      {step === 1 && <PatternsStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ReadyStep onBack={() => setStep(1)} />}
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
          Kanban in Industry Today
        </h1>
      </div>
    </div>
  );
}
