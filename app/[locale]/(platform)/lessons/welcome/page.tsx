"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const LABELS = ["Welcome", "What You\u2019ll Learn", "How It Works"];

const OBJECTIVES = [
  {
    section: "Theory & Principles",
    color: "#3b82f6",
    items: [
      "Understand why batch size is the hidden driver of flow",
      "Apply Little\u2019s Law to predict delivery timelines",
    ],
  },
  {
    section: "Kanban in Practice",
    color: "#8b5cf6",
    items: [
      "Set effective WIP limits and manage work item age",
      "Use Monte Carlo simulation to forecast with confidence levels, not guesses",
      "Know the difference between right-sizing and same-sizing",
    ],
  },
  {
    section: "Workflow Visualisation",
    color: "#f59e0b",
    items: [
      "Design a Kanban board that reflects how work actually flows",
      "Identify and make policies explicit",
    ],
  },
  {
    section: "Improving the Workflow",
    color: "#ef4444",
    items: [
      "Read flow metrics to find improvement opportunities",
      "Run experiments and measure their impact",
    ],
  },
];

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader tag="Lesson 1.1" tagColor="#22c55e" title="Welcome to Kanban Fundamentals" />

      <div
        className="w-full aspect-video rounded-[14px] flex flex-col items-center justify-center mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05))",
          border: "1px solid rgba(34,197,94,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(34,197,94,0.06) 0%, transparent 60%)" }} />
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[22px] mb-2.5"
          style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}
        >
          &#9654;
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-tertiary)" }}>Video: Welcome to the Course</span>
        <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>3:00</span>
      </div>

      <div className="text-sm leading-[1.8] flex flex-col gap-3.5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          Welcome! This course will change how you think about work. Not by adding more process,
          but by helping you <strong style={{ color: "var(--text-primary)" }}>see the invisible forces</strong> that
          determine whether work flows smoothly or grinds to a halt.
        </p>
        <p className="m-0">
          Kanban is not a framework you install on Monday morning. It&apos;s a <strong style={{ color: "var(--text-primary)" }}>lens
          for understanding flow</strong> &mdash; grounded in decades of mathematics, manufacturing
          science, and real-world practice. You&apos;ll learn the theory, experience it through
          interactive simulations, and leave with practical skills you can apply immediately.
        </p>
        <p className="m-0">
          Every lesson in this course is built around <strong className="text-green-400">learning by doing</strong>.
          You won&apos;t just read about batch size &mdash; you&apos;ll run a coin game and watch the
          impact unfold. You won&apos;t just hear about WIP limits &mdash; you&apos;ll manage a
          Kanban board and see what happens when you change them.
        </p>
      </div>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>What You&apos;ll Learn &rarr;</Btn>
      </div>
    </div>
  );
}

function ObjectivesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Learning Objectives"
        tagColor="#22c55e"
        title="What you'll be able to do"
        desc="By the end of this course, you will be able to:"
      />

      <div className="flex flex-col gap-4">
        {OBJECTIVES.map((obj) => (
          <div
            key={obj.section}
            className="rounded-xl p-4"
            style={{ background: `${obj.color}06`, border: `1px solid ${obj.color}15` }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: obj.color }}>
              {obj.section}
            </div>
            <div className="flex flex-col gap-2">
              {obj.items.map((item) => (
                <div key={item} className="flex gap-2 items-start">
                  <span className="mt-0.5 flex-shrink-0 text-[11px]" style={{ color: obj.color }}>&#10003;</span>
                  <span className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="34,197,94">
        <div className="text-sm font-bold mb-1.5" style={{ color: "#4ade80" }}>Earn Your Certificate</div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Complete all five sections to earn a <strong style={{ color: "var(--text-primary)" }}>Kanban Fundamentals
          certificate</strong>. Each section awards a badge as you go, so you can track your progress
          and celebrate milestones along the way.
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>How It Works &rarr;</Btn>
      </div>
    </div>
  );
}

function HowItWorksStep({ onBack }: { onBack: () => void }) {
  const steps = [
    {
      num: "1",
      title: "Learn the concept",
      desc: "Each lesson starts with a short introduction and optional video explaining the theory.",
      color: "#3b82f6",
    },
    {
      num: "2",
      title: "Experience it",
      desc: "Interactive simulations let you see the concept in action. Make decisions, observe outcomes.",
      color: "#8b5cf6",
    },
    {
      num: "3",
      title: "Analyse the results",
      desc: "Charts and metrics help you understand what happened and why. Compare different approaches.",
      color: "#f59e0b",
    },
    {
      num: "4",
      title: "Test your knowledge",
      desc: "Quick quizzes check your understanding and reinforce key takeaways.",
      color: "#22c55e",
    },
  ];

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="How It Works"
        tagColor="#22c55e"
        title="Learn by Doing"
        desc="Every lesson follows a four-step pattern designed to make concepts stick."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="rounded-xl p-4 flex gap-3 items-start"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold font-mono flex-shrink-0"
              style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
            >
              {s.num}
            </div>
            <div>
              <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.title}</div>
              <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="59,130,246">
        <div className="text-sm font-bold mb-1.5" style={{ color: "#60a5fa" }}>Your AI Training Assistant</div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Spot the <strong style={{ color: "var(--text-primary)" }}>?</strong> button in the bottom-right corner?
          That&apos;s your personal training assistant. Ask it anything about the material at any time &mdash;
          it knows the full course content and can explain concepts in different ways. If you need human
          help, it can point you to the WhatsApp learning community where other learners and trainers are available.
        </div>
      </Card>

      <div
        className="mt-5 rounded-xl p-5 text-center"
        style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
      >
        <div className="text-sm font-bold mb-2" style={{ color: "#4ade80" }}>Ready to Begin?</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Next up: tell us a bit about yourself so we can tailor the experience.
        </div>
        <Link href="/lessons/why-kanban" className="no-underline">
          <Btn primary>Start Lesson 1.2: Why Kanban? &rarr;</Btn>
        </Link>
      </div>

      <div className="flex justify-start mt-5">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}

export default function WelcomeLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && <ObjectivesStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <HowItWorksStep onBack={() => setStep(1)} />}
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
          Welcome &amp; Learning Objectives
        </h1>
      </div>
    </div>
  );
}
