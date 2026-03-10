"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import Link from "next/link";

const LABELS = ["Definition", "The Goal", "Toyota & Lean", "The Way"];

/* ─── TPS interactive data ─── */

interface TPSPillar {
  title: string;
  icon: string;
  color: string;
  short: string;
  detail: string;
  kanbanLink: string;
}

const TPS_PILLARS: TPSPillar[] = [
  {
    title: "Just-in-Time",
    icon: "\u{23F0}",
    color: "#3b82f6",
    short: "Produce only what is needed, when it is needed, in the amount needed.",
    detail:
      "Taiichi Ohno observed American supermarkets restocking shelves only when customers took items. He reversed the traditional \u201Cpush\u201D logic: instead of building inventory based on forecasts, Toyota built each part only when the next station requested it. The kanban card was the physical signal that said \u201CI\u2019ve consumed one \u2014 make me another.\u201D This eliminated overproduction, the waste Ohno considered the root of all other wastes.",
    kanbanLink:
      "This is exactly what a WIP limit does on your Kanban board. When a column reaches its limit, upstream work stops until a slot opens. Pull, not push.",
  },
  {
    title: "Jidoka (Autonomation)",
    icon: "\u{1F6D1}",
    color: "#ef4444",
    short: "Stop and fix problems immediately \u2014 never pass defects downstream.",
    detail:
      "Jidoka means \u201Cautomation with a human touch.\u201D It originated with Sakichi Toyoda\u2019s automatic loom (1896), which stopped itself when a thread broke. On Toyota\u2019s assembly line, any worker could pull the andon cord to halt production when they spotted a defect. This was radical \u2014 stopping an entire line seems expensive, but passing defects downstream is far more costly. Fix the problem at its source.",
    kanbanLink:
      "In knowledge work, blockers are your andon cord. Making blockers visible on the board and stopping to resolve them \u2014 rather than starting more new work \u2014 is jidoka in action.",
  },
  {
    title: "Continuous Improvement (Kaizen)",
    icon: "\u{1F504}",
    color: "#22c55e",
    short: "Small, relentless improvements every day \u2014 by the people who do the work.",
    detail:
      "Kaizen isn\u2019t a quarterly initiative or a transformation programme. It\u2019s a daily discipline. Toyota workers were expected to identify problems in their own processes and propose improvements. Deming\u2019s Plan-Do-Check-Act cycle gave this discipline a structure: try a small change, measure the result, keep what works, adjust what doesn\u2019t.",
    kanbanLink:
      "Kanban\u2019s foundational principle is \u201Cagree to pursue improvement through evolutionary change.\u201D You don\u2019t blow up your process. You start with what you do now and improve incrementally, guided by flow metrics.",
  },
  {
    title: "Respect for People",
    icon: "\u{1F91D}",
    color: "#f59e0b",
    short: "Trust workers to solve problems. Develop people, not just products.",
    detail:
      "Toyota\u2019s system only works because management trusts frontline workers to identify and solve problems. The andon cord is meaningless if pulling it gets you punished. Respect for people means investing in skill development, giving teams authority over their processes, and never blaming individuals for system failures. Deming called this \u201Cdrive out fear.\u201D",
    kanbanLink:
      "Kanban manages the flow of work, not the people doing it. When cycle time increases, we look at the system \u2014 where is work queuing? where are the bottlenecks? \u2014 not at who\u2019s \u201Ctoo slow.\u201D",
  },
];

const LEAN_PRINCIPLES = [
  {
    num: "1",
    title: "Identify Value",
    desc: "Value is defined by the customer, not by the process. Everything that doesn\u2019t contribute to what the customer needs is waste.",
    color: "#3b82f6",
  },
  {
    num: "2",
    title: "Map the Value Stream",
    desc: "Trace the entire flow from request to delivery. See every step, every handoff, every queue. Most of the time an item spends in your system is waiting, not being worked on.",
    color: "#8b5cf6",
  },
  {
    num: "3",
    title: "Create Flow",
    desc: "Eliminate the interruptions, batching, and queues that cause work to stop and start. The goal is smooth, continuous movement from start to finish.",
    color: "#22c55e",
  },
  {
    num: "4",
    title: "Establish Pull",
    desc: "Don\u2019t push work into the system based on forecasts. Let downstream demand pull work through. Start new work only when there\u2019s capacity.",
    color: "#f59e0b",
  },
  {
    num: "5",
    title: "Pursue Perfection",
    desc: "There is no end state. Every improvement reveals the next opportunity. The system is never \u201Cdone\u201D \u2014 it\u2019s always evolving.",
    color: "#ef4444",
  },
];

const SEVEN_WASTES = [
  { name: "Overproduction", icon: "\u{1F4E6}", example: "Building features nobody asked for" },
  { name: "Waiting", icon: "\u{23F3}", example: "Work sitting in a queue between stages" },
  { name: "Transport", icon: "\u{1F69A}", example: "Unnecessary handoffs between teams" },
  { name: "Over-processing", icon: "\u{2699}\uFE0F", example: "Gold-plating beyond what delivers value" },
  { name: "Inventory", icon: "\u{1F4CB}", example: "Too much WIP \u2014 started but unfinished work" },
  { name: "Motion", icon: "\u{1F3C3}", example: "Context switching between too many tasks" },
  { name: "Defects", icon: "\u{1F41B}", example: "Rework caused by passing problems downstream" },
];

/* ─── Step 1: Definition ─── */

function DefinitionStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Lesson 2.1"
        tagColor="#3b82f6"
        title="What Is Kanban?"
        desc="Before we dive into simulations and metrics, let's establish the foundations: what Kanban is, what it aims to achieve, and how it works."
      />

      <Card accent="59,130,246">
        <div className="text-[13px] font-bold mb-2" style={{ color: "#60a5fa" }}>
          The Definition
        </div>
        <div
          className="text-[15px] font-bold leading-relaxed mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Kanban is a strategy for optimising the flow of value through a process that uses a visual, pull-based system.
        </div>
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Every word matters. It&apos;s a <strong style={{ color: "var(--text-primary)" }}>strategy</strong> (not a framework you install),
          focused on <strong style={{ color: "var(--text-primary)" }}>flow of value</strong> (not activity or output),
          through a <strong style={{ color: "var(--text-primary)" }}>process</strong> (any sequence of steps),
          using <strong style={{ color: "var(--text-primary)" }}>visual</strong> (make work visible) and{" "}
          <strong style={{ color: "var(--text-primary)" }}>pull-based</strong> (start work only when there&apos;s capacity) mechanics.
        </div>
      </Card>

      <div className="mt-5 text-sm leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          Kanban is not a methodology with prescribed roles, ceremonies, or artifacts. It&apos;s a
          strategy you <strong style={{ color: "var(--text-primary)" }}>apply to your existing process</strong>.
          You don&apos;t need to reorganise your team or rename anyone&apos;s job title. You start
          with what you do now and improve from there.
        </p>
        <p className="m-0">
          This makes Kanban uniquely approachable. But it also means the depth is in the{" "}
          <em>principles</em> &mdash; understanding <strong style={{ color: "var(--text-primary)" }}>why</strong> it works
          is what separates someone who uses a board from someone who manages flow.
        </p>
      </div>

      <div
        className="mt-5 rounded-xl p-4"
        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}
      >
        <div className="text-[11px] font-bold mb-2" style={{ color: "#60a5fa" }}>
          In this lesson you&apos;ll learn
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            "The goal: what Kanban is trying to achieve (and why it matters to your organisation)",
            "The origins: how Toyota\u2019s production system created the principles we still use",
            "The way: the three practices that make Kanban work in any context",
          ].map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[11px] mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }}>&#10003;</span>
              <span className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>The Goal &rarr;</Btn>
      </div>
    </div>
  );
}

/* ─── Step 2: The Goal ─── */

interface GoalCardProps {
  title: string;
  icon: string;
  color: string;
  desc: string;
  example: string;
  selected: boolean;
  onClick: () => void;
}

function GoalCard({ title, icon, color, desc, example, selected, onClick }: GoalCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 border-none cursor-pointer transition-all"
      style={{
        background: selected ? `${color}08` : "var(--bg-surface)",
        border: selected ? `1px solid ${color}25` : "1px solid var(--border-faint)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}
        >
          {icon}
        </div>
        <div className="text-[14px] font-bold" style={{ color: selected ? color : "var(--text-primary)" }}>
          {title}
        </div>
      </div>
      <div className="text-[12px] leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
        {desc}
      </div>
      {selected && (
        <div
          className="rounded-lg px-3 py-2 text-[11px] leading-relaxed fade-up"
          style={{ background: `${color}08`, border: `1px solid ${color}15`, color }}
        >
          <strong>Example:</strong> {example}
        </div>
      )}
    </button>
  );
}

function GoalStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  const goals = [
    {
      title: "Effective",
      icon: "\u{1F3AF}",
      color: "#22c55e",
      desc: "Delivers what customers want, when they want it. Not just shipping \u2014 shipping the right thing at the right time.",
      example:
        "A team releases features every week, but customer satisfaction is low because they\u2019re building what\u2019s easy, not what\u2019s valuable. Kanban makes the queue of work visible, so the team and stakeholders can see what\u2019s being prioritised and have honest conversations about value.",
    },
    {
      title: "Predictable",
      icon: "\u{1F4C8}",
      color: "#3b82f6",
      desc: "Accurately forecasts delivery. Not through estimation theatre, but through empirical data from your own system.",
      example:
        "Instead of a project manager asking \u201Chow long will this take?\u201D and getting a guess, the team uses throughput data and Monte Carlo simulation to say \u201Cthere\u2019s an 85% chance we\u2019ll deliver 12 items by March 15.\u201D You\u2019ll build this exact skill in Lesson 3.3.",
    },
    {
      title: "Efficient",
      icon: "\u{1F4B0}",
      color: "#f59e0b",
      desc: "Allocates financial and human resources optimally. Every item in progress has a cost \u2014 reducing WIP reduces waste.",
      example:
        "A team of 6 has 23 items in progress. Each unfinished item represents invested effort producing zero return. By limiting WIP to 8, the team finishes items faster, reduces inventory cost, and delivers value sooner. You\u2019ll experience this in the Kanban Game (Lesson 3.1).",
    },
  ];

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="The Goal"
        tagColor="#3b82f6"
        title="Why Does Kanban Exist?"
        desc="Kanban isn't about having a pretty board. It exists to make your delivery system achieve three things. Tap each to explore."
      />

      <div className="flex flex-col gap-3">
        {goals.map((g, i) => (
          <GoalCard
            key={g.title}
            {...g}
            selected={selected === i}
            onClick={() => setSelected(selected === i ? null : i)}
          />
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="59,130,246">
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>These three goals are your compass throughout this course.</strong>{" "}
          Every concept you learn &mdash; batch size, Little&apos;s Law, WIP limits, flow metrics &mdash;
          exists to make your system more effective, more predictable, or more efficient. When you&apos;re
          unsure whether a practice is worth adopting, ask: does it move the needle on one of these three?
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>Toyota &amp; Lean &rarr;</Btn>
      </div>
    </div>
  );
}

/* ─── Step 3: Toyota & Lean (Interactive) ─── */

function ToyotaStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [activePillar, setActivePillar] = useState<number | null>(null);
  const [showWastes, setShowWastes] = useState(false);
  const [showLean, setShowLean] = useState(false);

  return (
    <div className="fade-up max-w-[780px]">
      <StepHeader
        tag="Origins"
        tagColor="#3b82f6"
        title="The Toyota Production System"
        desc="In Lesson 1.3 you met Taiichi Ohno and the birth of the kanban card. Now let's go deeper into the system he built and the thinking that powers modern Kanban."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          The Toyota Production System (TPS) wasn&apos;t a single invention &mdash; it was a{" "}
          <strong style={{ color: "var(--text-primary)" }}>philosophy</strong> built over decades.
          After World War II, Toyota couldn&apos;t afford the large inventories and mass production
          methods used by American car makers. Necessity forced innovation: build only what&apos;s
          needed, eliminate waste relentlessly, and empower every worker to improve the system.
        </p>
        <p className="m-0">
          TPS rests on four pillars. Tap each to see how it connects to the Kanban you&apos;ll practise in this course.
        </p>
      </div>

      {/* TPS Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {TPS_PILLARS.map((p, i) => (
          <button
            key={p.title}
            onClick={() => setActivePillar(activePillar === i ? null : i)}
            className="text-left rounded-xl p-4 border-none cursor-pointer transition-all"
            style={{
              background: activePillar === i ? `${p.color}08` : "var(--bg-surface)",
              border: activePillar === i ? `1px solid ${p.color}25` : "1px solid var(--border-faint)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-lg">{p.icon}</span>
              <span
                className="text-[13px] font-bold"
                style={{ color: activePillar === i ? p.color : "var(--text-primary)" }}
              >
                {p.title}
              </span>
            </div>
            <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              {p.short}
            </div>
          </button>
        ))}
      </div>

      {activePillar !== null && (
        <div className="mb-5 fade-up">
          <div
            className="rounded-xl p-5"
            style={{
              background: `${TPS_PILLARS[activePillar].color}05`,
              border: `1px solid ${TPS_PILLARS[activePillar].color}15`,
            }}
          >
            <div className="text-[12px] leading-[1.75] mb-3" style={{ color: "var(--text-secondary)" }}>
              {TPS_PILLARS[activePillar].detail}
            </div>
            <div
              className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
              style={{
                background: `${TPS_PILLARS[activePillar].color}08`,
                border: `1px solid ${TPS_PILLARS[activePillar].color}15`,
                color: TPS_PILLARS[activePillar].color,
              }}
            >
              <strong>Connection to Kanban:</strong> {TPS_PILLARS[activePillar].kanbanLink}
            </div>
          </div>
        </div>
      )}

      {/* Seven Wastes */}
      <div className="mb-5">
        <button
          onClick={() => setShowWastes(!showWastes)}
          className="w-full text-left rounded-xl p-4 border-none cursor-pointer transition-all"
          style={{
            background: showWastes ? "rgba(239,68,68,0.04)" : "var(--bg-surface)",
            border: showWastes ? "1px solid rgba(239,68,68,0.15)" : "1px solid var(--border-faint)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{"\u{1F5D1}\uFE0F"}</span>
              <span className="text-[13px] font-bold" style={{ color: showWastes ? "#ef4444" : "var(--text-primary)" }}>
                The Seven Wastes of Lean
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {showWastes ? "collapse" : "expand"}
            </span>
          </div>
          {!showWastes && (
            <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              Toyota identified seven types of waste. Tap to see how each appears in knowledge work.
            </div>
          )}
        </button>

        {showWastes && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 fade-up">
            {SEVEN_WASTES.map((w) => (
              <div
                key={w.name}
                className="rounded-lg p-3 flex gap-2.5 items-start"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
              >
                <span className="text-base flex-shrink-0">{w.icon}</span>
                <div>
                  <div className="text-[12px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    {w.name}
                  </div>
                  <div className="text-[10px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {w.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* From TPS to Lean */}
      <div>
        <button
          onClick={() => setShowLean(!showLean)}
          className="w-full text-left rounded-xl p-4 border-none cursor-pointer transition-all"
          style={{
            background: showLean ? "rgba(59,130,246,0.04)" : "var(--bg-surface)",
            border: showLean ? "1px solid rgba(59,130,246,0.15)" : "1px solid var(--border-faint)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{"\u{1F4D6}"}</span>
              <span className="text-[13px] font-bold" style={{ color: showLean ? "#3b82f6" : "var(--text-primary)" }}>
                From TPS to Lean: The Five Principles
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {showLean ? "collapse" : "expand"}
            </span>
          </div>
          {!showLean && (
            <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              In 1988, researchers at MIT studied Toyota&apos;s system and codified it into five universal principles. Tap to explore.
            </div>
          )}
        </button>

        {showLean && (
          <div className="mt-3 fade-up">
            <div className="text-[12px] leading-relaxed mb-3 px-1" style={{ color: "var(--text-secondary)" }}>
              John Krafcik coined &quot;lean production&quot; in his 1988 MIT thesis. Womack and Jones later distilled
              Toyota&apos;s approach into five principles that apply to any process &mdash; not just manufacturing.
              Notice how each maps directly to what Kanban does.
            </div>
            <div className="flex flex-col gap-2">
              {LEAN_PRINCIPLES.map((p) => (
                <div
                  key={p.title}
                  className="rounded-lg p-3.5 flex gap-3 items-start"
                  style={{ background: `${p.color}05`, border: `1px solid ${p.color}12` }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold font-mono flex-shrink-0"
                    style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}
                  >
                    {p.num}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {p.title}
                    </div>
                    <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card style={{ marginTop: 20 }} accent="59,130,246">
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>The thread from Toyota to your board:</strong>{" "}
          TPS proved that limiting work in progress, making problems visible, and improving
          incrementally produces better outcomes than pushing more work into the system.
          David Anderson took these ideas and applied them to knowledge work. The
          result is the Kanban Method &mdash; and the three practices you&apos;ll learn next.
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>The Way &rarr;</Btn>
      </div>
    </div>
  );
}

/* ─── Step 4: The Way ─── */

interface PracticeData {
  num: string;
  title: string;
  color: string;
  icon: string;
  desc: string;
  whyItMatters: string;
  courseLink: string;
}

const PRACTICES: PracticeData[] = [
  {
    num: "1",
    title: "Define and visualise a workflow",
    color: "#3b82f6",
    icon: "\u{1F441}\uFE0F",
    desc:
      "Map the stages work moves through from \u201Crequested\u201D to \u201Cdone.\u201D Make all work visible on a board. Include everything \u2014 planned work, unplanned work, the \u201Cquick requests\u201D that aren\u2019t quick at all. Hidden work is unmanaged work.",
    whyItMatters:
      "You can\u2019t improve a process you can\u2019t see. Visualisation exposes queues, bottlenecks, and the true demand on your team. It replaces status meetings with a glance at the board.",
    courseLink: "Section 4 (Workflow Visualisation) will teach you how to design a board that reflects reality, not a template from the internet.",
  },
  {
    num: "2",
    title: "Actively manage items in a workflow",
    color: "#8b5cf6",
    icon: "\u{1F3AF}",
    desc:
      "Having a board is step one. Actively managing it means setting WIP limits, monitoring work item age, responding to blockers, and making data-driven decisions about what to start, stop, or continue.",
    whyItMatters:
      "A board without active management is just a to-do list on a wall. The power of Kanban comes from the policies and decisions you make based on what the board reveals.",
    courseLink: "The Kanban Game (Lesson 3.1) puts you in charge of a board with WIP limits and work item age. You\u2019ll see what happens when you actively manage flow \u2014 and what happens when you don\u2019t.",
  },
  {
    num: "3",
    title: "Improve a workflow",
    color: "#22c55e",
    icon: "\u{1F4CA}",
    desc:
      "Use flow metrics \u2014 cycle time, throughput, WIP, work item age \u2014 to identify improvement opportunities. Run experiments. Measure the impact. Evolve your process through evidence, not opinions.",
    whyItMatters:
      "Without measurement, improvement is guesswork. Flow metrics give you an objective view of how your system is performing and where the constraints are.",
    courseLink: "Flow Metrics & Forecasting (Lesson 3.3) teaches you to read these metrics and use Monte Carlo simulation to forecast delivery with confidence levels.",
  },
];

function TheWayStep({ onBack }: { onBack: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="The Way"
        tagColor="#3b82f6"
        title="Three Practices, One Strategy"
        desc="Kanban achieves its goals through three interconnected practices. Tap each to explore."
      />

      <Card accent="59,130,246" style={{ marginBottom: 20 }}>
        <div
          className="text-[13px] font-bold leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          Kanban is a strategy for optimising the flow of value through a process that uses a visual, pull-based system.
        </div>
        <div className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
          The three practices below are <em>how</em> this strategy works.
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {PRACTICES.map((p, i) => (
          <button
            key={p.title}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left rounded-xl p-5 border-none cursor-pointer transition-all"
            style={{
              background: expanded === i ? `${p.color}06` : "var(--bg-surface)",
              border: expanded === i ? `1px solid ${p.color}20` : "1px solid var(--border-faint)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold font-mono flex-shrink-0"
                style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}25` }}
              >
                {p.num}
              </div>
              <div>
                <div
                  className="text-[13px] font-bold"
                  style={{ color: expanded === i ? p.color : "var(--text-primary)" }}
                >
                  {p.title}
                </div>
              </div>
            </div>
            <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {p.desc}
            </div>

            {expanded === i && (
              <div className="mt-3 flex flex-col gap-2 fade-up">
                <div
                  className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                  style={{ background: `${p.color}06`, border: `1px solid ${p.color}12`, color: p.color }}
                >
                  <strong>Why it matters:</strong> {p.whyItMatters}
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-faint)", color: "var(--text-muted)" }}
                >
                  <strong style={{ color: "var(--text-tertiary)" }}>Where you&apos;ll practise this:</strong> {p.courseLink}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Goal ↔ Way connection */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}
      >
        <div className="text-sm font-bold mb-3" style={{ color: "#60a5fa" }}>
          Connecting The Goal to The Way
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              goal: "Effective",
              practice: "Visualise workflow",
              link: "Seeing all work makes it possible to prioritise what delivers real value.",
              color: "#22c55e",
            },
            {
              goal: "Predictable",
              practice: "Improve workflow",
              link: "Flow metrics and forecasting replace guesses with data-driven confidence levels.",
              color: "#3b82f6",
            },
            {
              goal: "Efficient",
              practice: "Manage items actively",
              link: "WIP limits reduce waste, lower inventory cost, and speed up delivery.",
              color: "#f59e0b",
            },
          ].map((c) => (
            <div
              key={c.goal}
              className="rounded-lg p-3 text-center"
              style={{ background: `${c.color}06`, border: `1px solid ${c.color}12` }}
            >
              <div className="text-[12px] font-bold mb-1" style={{ color: c.color }}>
                {c.goal}
              </div>
              <div className="text-[10px] mb-1.5 font-medium" style={{ color: "var(--text-primary)" }}>
                &darr; {c.practice}
              </div>
              <div className="text-[10px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {c.link}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card style={{ marginTop: 20 }} accent="34,197,94">
        <div className="text-sm font-bold mb-1.5" style={{ color: "#4ade80" }}>
          Ready for the Simulations
        </div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          You now have the foundations: the definition, the goal, the origins, and the three practices.
          Everything from here on builds directly on these ideas. Next up: the Penny Game, where you&apos;ll
          experience how <strong style={{ color: "var(--text-primary)" }}>batch size</strong> &mdash; one
          of the most overlooked variables in any process &mdash; dramatically affects flow.
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
        <Link href="/lessons/littles-law" className="no-underline">
          <div
            className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider mb-1" style={{ color: "#3b82f6" }}>
              Lesson 2.3
            </div>
            <div className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Little&apos;s Law
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Drive-through simulation
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

/* ─── Main ─── */

export default function KanbanPrinciplesLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <DefinitionStep onNext={() => setStep(1)} />}
      {step === 1 && <GoalStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ToyotaStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <TheWayStep onBack={() => setStep(2)} />}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div className="w-2 h-10 rounded flex-shrink-0" style={{ background: "#3b82f6" }} />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Section 2 &middot; Theory &amp; Principles
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Kanban Principles &amp; Strategy
        </h1>
      </div>
    </div>
  );
}
