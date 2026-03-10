"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import Link from "next/link";

const LABELS = ["About You", "Your Goals", "Summary"];

interface SurveyData {
  name: string;
  role: string;
  industry: string;
  teamSize: string;
  experience: string;
  painPoints: string[];
  goals: string[];
  whyKanban: string;
  whyThisCourse: string;
}

const ROLES = [
  "Team Lead / Manager",
  "Scrum Master / Agile Coach",
  "Product Owner / Product Manager",
  "Developer / Engineer",
  "Designer",
  "Business Analyst",
  "Executive / Director",
  "Consultant",
  "Other",
];

const INDUSTRIES = [
  "Software / Technology",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Government / Public Sector",
  "Education",
  "Marketing / Creative",
  "Construction / Engineering",
  "Legal",
  "Other",
];

const TEAM_SIZES = ["Just me", "2\u20135", "6\u201310", "11\u201320", "20+"];

const EXPERIENCE_LEVELS = [
  "Brand new \u2014 never heard of Kanban before",
  "Aware \u2014 I\u2019ve heard of it but never used it",
  "Beginner \u2014 I\u2019ve tried a basic board",
  "Intermediate \u2014 using Kanban but want to go deeper",
  "Experienced \u2014 refreshing or formalising my knowledge",
];

const PAIN_POINTS = [
  "Too much work in progress",
  "Unpredictable delivery dates",
  "Bottlenecks and handoff delays",
  "No visibility of what\u2019s happening",
  "Teams are overloaded",
  "Stakeholders want fixed date commitments",
  "Hard to prioritise",
  "Long lead times",
  "Context switching",
  "Lack of data to support decisions",
];

const GOALS = [
  "Improve delivery predictability",
  "Reduce lead/cycle times",
  "Better visualise workflows",
  "Learn to use flow metrics",
  "Implement WIP limits",
  "Forecast with data instead of estimates",
  "Coach others on Kanban",
  "Get certified / earn a credential",
  "Improve team collaboration",
  "Build a case for change with leadership",
];

function OptionChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-[11px] font-medium border-none cursor-pointer transition-all"
      style={{
        background: selected ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
        color: selected ? "#4ade80" : "var(--text-tertiary)",
        border: selected ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border-faint)",
      }}
    >
      {label}
    </button>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <OptionChip key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
      ))}
    </div>
  );
}

function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <OptionChip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-xs border-none outline-none"
      style={{
        background: "var(--bg-input, rgba(255,255,255,0.06))",
        color: "var(--text-primary)",
        border: "1px solid var(--border-subtle)",
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-lg px-3 py-2 text-xs border-none outline-none resize-none"
      style={{
        background: "var(--bg-input, rgba(255,255,255,0.06))",
        color: "var(--text-primary)",
        border: "1px solid var(--border-subtle)",
        fontFamily: "inherit",
      }}
    />
  );
}

export default function WhyKanbanLesson() {
  const [step, setStep] = useState(0);
  const [survey, setSurvey] = useState<SurveyData>({
    name: "",
    role: "",
    industry: "",
    teamSize: "",
    experience: "",
    painPoints: [],
    goals: [],
    whyKanban: "",
    whyThisCourse: "",
  });

  const update = (field: keyof SurveyData, value: string | string[]) => {
    setSurvey((s) => ({ ...s, [field]: value }));
  };

  const saveSurvey = () => {
    try {
      localStorage.setItem("kanban-learner-survey", JSON.stringify(survey));
    } catch { /* silent */ }
  };

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />

      {step === 0 && (
        <div className="fade-up max-w-[740px]">
          <StepHeader
            tag="Lesson 1.2"
            tagColor="#22c55e"
            title="Tell Us About You"
            desc="This helps us understand who's in the room. Your answers are stored locally on your device and can help the AI assistant tailor its responses."
          />

          <div className="flex flex-col gap-5">
            <Card>
              <FieldLabel>Your Name</FieldLabel>
              <TextInput value={survey.name} onChange={(v) => update("name", v)} placeholder="First name is fine" />
            </Card>

            <Card>
              <FieldLabel>Your Role</FieldLabel>
              <RadioGroup options={ROLES} value={survey.role} onChange={(v) => update("role", v)} />
            </Card>

            <Card>
              <FieldLabel>Your Industry</FieldLabel>
              <RadioGroup options={INDUSTRIES} value={survey.industry} onChange={(v) => update("industry", v)} />
            </Card>

            <Card>
              <FieldLabel>Team Size</FieldLabel>
              <RadioGroup options={TEAM_SIZES} value={survey.teamSize} onChange={(v) => update("teamSize", v)} />
            </Card>

            <Card>
              <FieldLabel>Kanban Experience</FieldLabel>
              <RadioGroup options={EXPERIENCE_LEVELS} value={survey.experience} onChange={(v) => update("experience", v)} />
            </Card>
          </div>

          <div className="flex justify-end mt-7">
            <Btn primary onClick={() => setStep(1)}>Your Goals &rarr;</Btn>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="fade-up max-w-[740px]">
          <StepHeader
            tag="Your Goals"
            tagColor="#22c55e"
            title="Why Are You Here?"
            desc="Select all that apply. There are no wrong answers."
          />

          <div className="flex flex-col gap-5">
            <Card>
              <FieldLabel>What pain points are you experiencing? (select all that apply)</FieldLabel>
              <MultiSelect options={PAIN_POINTS} selected={survey.painPoints} onChange={(v) => update("painPoints", v)} />
            </Card>

            <Card>
              <FieldLabel>What do you hope to achieve? (select all that apply)</FieldLabel>
              <MultiSelect options={GOALS} selected={survey.goals} onChange={(v) => update("goals", v)} />
            </Card>

            <Card>
              <FieldLabel>Why Kanban? What drew you to this approach?</FieldLabel>
              <TextArea
                value={survey.whyKanban}
                onChange={(v) => update("whyKanban", v)}
                placeholder="e.g. My team is drowning in WIP, a colleague recommended it, I saw a talk..."
              />
            </Card>

            <Card>
              <FieldLabel>Why this course? What are you hoping to take away?</FieldLabel>
              <TextArea
                value={survey.whyThisCourse}
                onChange={(v) => update("whyThisCourse", v)}
                placeholder="e.g. I want to bring data-driven practices to my team, I need a certification..."
              />
            </Card>
          </div>

          <div className="flex justify-between mt-7 flex-wrap gap-2.5">
            <Btn onClick={() => setStep(0)}>&larr; Back</Btn>
            <Btn primary onClick={() => { saveSurvey(); setStep(2); }}>See Summary &rarr;</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-up max-w-[740px]">
          <StepHeader
            tag="Summary"
            tagColor="#22c55e"
            title={survey.name ? `Welcome, ${survey.name}!` : "Your Profile"}
            desc="Here's what you told us. This information helps shape your learning experience."
          />

          <div className="flex flex-col gap-3">
            {survey.role && (
              <SummaryRow label="Role" value={survey.role} />
            )}
            {survey.industry && (
              <SummaryRow label="Industry" value={survey.industry} />
            )}
            {survey.teamSize && (
              <SummaryRow label="Team Size" value={survey.teamSize} />
            )}
            {survey.experience && (
              <SummaryRow label="Experience" value={survey.experience} />
            )}
            {survey.painPoints.length > 0 && (
              <SummaryRow label="Pain Points" value={survey.painPoints.join(", ")} />
            )}
            {survey.goals.length > 0 && (
              <SummaryRow label="Goals" value={survey.goals.join(", ")} />
            )}
            {survey.whyKanban && (
              <SummaryRow label="Why Kanban?" value={survey.whyKanban} />
            )}
            {survey.whyThisCourse && (
              <SummaryRow label="Why This Course?" value={survey.whyThisCourse} />
            )}
          </div>

          {survey.painPoints.length > 0 && (
            <Card style={{ marginTop: 20 }} accent="34,197,94">
              <div className="text-sm font-bold mb-1.5" style={{ color: "#4ade80" }}>Good News</div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {survey.painPoints.includes("Too much work in progress") && (
                  <p className="m-0 mb-1">You mentioned <strong style={{ color: "var(--text-primary)" }}>too much WIP</strong> &mdash; Lesson 3.1 (The Kanban Game) is built exactly for this. You&apos;ll experience firsthand how WIP limits transform flow.</p>
                )}
                {survey.painPoints.includes("Unpredictable delivery dates") && (
                  <p className="m-0 mb-1">You mentioned <strong style={{ color: "var(--text-primary)" }}>unpredictable delivery</strong> &mdash; Lesson 3.3 (Flow Metrics) will teach you Monte Carlo forecasting, replacing guesses with probability-based forecasts.</p>
                )}
                {survey.painPoints.includes("No visibility of what\u2019s happening") && (
                  <p className="m-0 mb-1">You mentioned <strong style={{ color: "var(--text-primary)" }}>lack of visibility</strong> &mdash; Section 4 (Workflow Visualisation) will help you design boards that make the invisible visible.</p>
                )}
                {survey.painPoints.includes("Bottlenecks and handoff delays") && (
                  <p className="m-0 mb-1">You mentioned <strong style={{ color: "var(--text-primary)" }}>bottlenecks</strong> &mdash; Little&apos;s Law (Lesson 2.2) and the Kanban Game (3.1) will show you exactly how to identify and address them.</p>
                )}
                {!survey.painPoints.includes("Too much work in progress") &&
                 !survey.painPoints.includes("Unpredictable delivery dates") &&
                 !survey.painPoints.includes("No visibility of what\u2019s happening") &&
                 !survey.painPoints.includes("Bottlenecks and handoff delays") && (
                  <p className="m-0">Every pain point you selected is addressed directly in the course. You&apos;re in the right place.</p>
                )}
              </div>
            </Card>
          )}

          <div
            className="mt-5 rounded-xl p-5 text-center"
            style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
          >
            <div className="text-sm font-bold mb-2" style={{ color: "#4ade80" }}>Let&apos;s Get Started</div>
            <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Next: a quick journey through the history of Kanban &mdash; from telephone exchanges to modern knowledge work.
            </div>
            <Link href="/lessons/history" className="no-underline">
              <Btn primary>Lesson 1.3: A Brief History &rarr;</Btn>
            </Link>
          </div>

          <div className="flex justify-start mt-5">
            <Btn onClick={() => setStep(1)}>&larr; Back</Btn>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg px-4 py-2.5 flex gap-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0 pt-0.5" style={{ color: "var(--text-muted)", width: 100 }}>
        {label}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{value}</div>
    </div>
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
          Why Kanban?
        </h1>
      </div>
    </div>
  );
}
