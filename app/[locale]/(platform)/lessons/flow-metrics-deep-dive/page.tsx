"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  LESSON_META,
  CYCLE_TIME_DATA,
  THROUGHPUT_DATA,
  BOARD_END_STATE,
  AGING_WIP_DATA,
  CHART_ANALYSES,
  SLE_DAYS,
  P50,
  P85,
  P95,
  QUIZ,
} from "@/content/lesson-flow-metrics-deep-dive/config";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  Line,
  BarChart,
  Cell,
} from "recharts";

// ─── Chart theme ────────────────────────────────────────────
const GRID = "var(--chart-grid, rgba(255,255,255,0.08))";
const AXIS = "var(--chart-axis, rgba(255,255,255,0.2))";
const TICK = { fontSize: 11, fill: "var(--text-muted)" };
const TT = {
  contentStyle: {
    background: "var(--bg-tooltip)",
    border: "1px solid var(--border-tooltip)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--text-secondary)",
  },
};

const CHART_TABS = ["Cycle Time", "Throughput", "Board State", "Aging WIP"];

// ─── Helpers ────────────────────────────────────────────────

function ageBadgeColor(age: number): string {
  if (age <= 4) return "#22c55e";
  if (age <= 8) return "#f59e0b";
  return "#ef4444";
}

function locationBarColor(location: string): string {
  switch (location) {
    case "red-active":
      return "#ef4444";
    case "blue-active":
      return "#3b82f6";
    case "red-finished":
      return "#f87171";
    case "green":
      return "#22c55e";
    default:
      return "#64748b";
  }
}

// ─── Expandable Insight Card ────────────────────────────────

function InsightCard({
  label,
  text,
  expanded,
  onToggle,
}: {
  label: string;
  text: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-faint)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center justify-between border-none cursor-pointer"
        style={{ background: "transparent", color: "var(--text-primary)" }}
      >
        <span className="text-[12px] font-bold">{label}</span>
        <span
          className="text-[11px] transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          &#9660;
        </span>
      </button>
      {expanded && (
        <div
          className="px-3 pb-3 text-[11px] leading-relaxed fade-up"
          style={{ color: "var(--text-secondary)" }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ─── Chart Analysis Block ───────────────────────────────────

function ChartAnalysis({
  chartKey,
  expandedInsights,
  onToggleInsight,
}: {
  chartKey: keyof typeof CHART_ANALYSES;
  expandedInsights: Record<number, boolean>;
  onToggleInsight: (idx: number) => void;
}) {
  const analysis = CHART_ANALYSES[chartKey];
  return (
    <div className="mt-4">
      <div
        className="text-[13px] font-bold mb-3 leading-relaxed"
        style={{ color: "var(--text-primary)" }}
      >
        {analysis.question}
      </div>
      <div className="flex flex-col gap-2">
        {analysis.insights.map((insight, idx) => (
          <InsightCard
            key={idx}
            label={insight.label}
            text={insight.text}
            expanded={!!expandedInsights[idx]}
            onToggle={() => onToggleInsight(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 0: Intro ──────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Lesson 5.2"
        tagColor="#ef4444"
        title="Flow Metrics Deep Dive"
        desc="These charts come from Round 3 of the Kanban Game. In the full course, they would show YOUR data from gameplay. Each chart reveals a different dimension of flow health."
      />

      <div
        className="text-sm leading-[1.8] mb-5"
        style={{ color: "var(--text-secondary)" }}
      >
        <p className="m-0 mb-3">
          You&apos;ll explore{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            four key flow charts
          </strong>{" "}
          that every Kanban practitioner should be able to read and interpret.
          Each chart answers a different question about how work flows through
          your system.
        </p>
      </div>

      <Card accent="239,68,68">
        <div
          className="text-[12px] font-bold mb-3"
          style={{ color: "#ef4444" }}
        >
          The 4 Flow Charts
        </div>
        <div className="flex flex-col gap-3">
          {[
            {
              key: "cycleTime" as const,
              num: "1",
              title: CHART_ANALYSES.cycleTime.title,
              question: CHART_ANALYSES.cycleTime.question,
            },
            {
              key: "throughput" as const,
              num: "2",
              title: CHART_ANALYSES.throughput.title,
              question: CHART_ANALYSES.throughput.question,
            },
            {
              key: "boardState" as const,
              num: "3",
              title: CHART_ANALYSES.boardState.title,
              question: CHART_ANALYSES.boardState.question,
            },
            {
              key: "agingWip" as const,
              num: "4",
              title: CHART_ANALYSES.agingWip.title,
              question: CHART_ANALYSES.agingWip.question,
            },
          ].map((c) => (
            <div key={c.num} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {c.num}
              </div>
              <div>
                <div
                  className="text-[12px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.title}
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {c.question}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>
          View Charts &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 1: Charts (Interactive Tabs) ──────────────────────

function ChartsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeChart, setActiveChart] = useState<number>(0);
  const [expandedInsights, setExpandedInsights] = useState<
    Record<number, Record<number, boolean>>
  >({});

  const toggleInsight = (chartIdx: number, insightIdx: number) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [chartIdx]: {
        ...(prev[chartIdx] || {}),
        [insightIdx]: !(prev[chartIdx]?.[insightIdx] ?? false),
      },
    }));
  };

  const chartKeys: (keyof typeof CHART_ANALYSES)[] = [
    "cycleTime",
    "throughput",
    "boardState",
    "agingWip",
  ];

  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Interactive Charts"
        tagColor="#ef4444"
        title="Explore the Data"
        desc="Switch between 4 chart types. Expand each insight to understand what the data reveals."
      />

      {/* Tab selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CHART_TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveChart(i)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border-none cursor-pointer transition-all"
            style={{
              background:
                activeChart === i
                  ? "rgba(59,130,246,0.15)"
                  : "var(--bg-surface)",
              color: activeChart === i ? "#3b82f6" : "var(--text-muted)",
              border:
                activeChart === i
                  ? "2px solid rgba(59,130,246,0.3)"
                  : "2px solid var(--border-faint)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeChart === 0 && <CycleTimeChart />}
      {activeChart === 1 && <ThroughputChart />}
      {activeChart === 2 && <BoardStateView />}
      {activeChart === 3 && <AgingWipChart />}

      <ChartAnalysis
        chartKey={chartKeys[activeChart]}
        expandedInsights={expandedInsights[activeChart] || {}}
        onToggleInsight={(idx) => toggleInsight(activeChart, idx)}
      />

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onNext}>
          Analysis &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Chart 0: Cycle Time Scatterplot ────────────────────────

function CycleTimeChart() {
  const normal = CYCLE_TIME_DATA.filter((d) => d.cycleTime <= SLE_DAYS);
  const outliers = CYCLE_TIME_DATA.filter((d) => d.cycleTime > SLE_DAYS);

  return (
    <Card>
      <div
        className="text-[13px] font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Cycle Time Scatterplot
      </div>
      <div
        className="text-[11px] mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        Each dot is one completed work item. X = day completed, Y = cycle time
        (days). Red dots exceed the SLE.
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="dayDone"
            name="Day Completed"
            tick={TICK}
            stroke={AXIS}
            label={{
              value: "Day Completed",
              position: "insideBottom",
              offset: -5,
              style: { ...TICK, fontSize: 10 },
            }}
          />
          <YAxis
            type="number"
            dataKey="cycleTime"
            name="Cycle Time"
            tick={TICK}
            stroke={AXIS}
            label={{
              value: "Cycle Time (days)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { ...TICK, fontSize: 10 },
            }}
          />
          <Tooltip
            {...TT}
            formatter={(value: number, name: string) => [
              `${value} ${name === "Cycle Time" ? "days" : ""}`,
              name,
            ]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <ReferenceLine
            y={SLE_DAYS}
            stroke="#ef4444"
            strokeDasharray="6 4"
            label={{
              value: `SLE (${SLE_DAYS} days)`,
              position: "right",
              fill: "#ef4444",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={P50}
            stroke="#3b82f6"
            strokeDasharray="4 4"
            label={{
              value: "P50",
              position: "right",
              fill: "#3b82f6",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={P85}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{
              value: "P85",
              position: "right",
              fill: "#f59e0b",
              fontSize: 10,
            }}
          />
          <Scatter name="Normal" data={normal} fill="#8b5cf6" />
          <Scatter name="Outlier" data={outliers} fill="#ef4444" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Chart 1: Throughput Run Chart ──────────────────────────

function ThroughputChart() {
  return (
    <Card>
      <div
        className="text-[13px] font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Throughput Run Chart
      </div>
      <div
        className="text-[11px] mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        Blue bars show daily item completions. Amber line is the 5-day rolling
        average. Consistent bars = predictable delivery.
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={THROUGHPUT_DATA}
          margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
        >
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={TICK}
            stroke={AXIS}
            label={{
              value: "Day",
              position: "insideBottom",
              offset: -5,
              style: { ...TICK, fontSize: 10 },
            }}
          />
          <YAxis
            tick={TICK}
            stroke={AXIS}
            allowDecimals
            label={{
              value: "Items",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { ...TICK, fontSize: 10 },
            }}
          />
          <Tooltip
            {...TT}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Bar
            dataKey="count"
            name="Daily Count"
            fill="#3b82f6"
            opacity={0.6}
            radius={[3, 3, 0, 0]}
          />
          <Line
            dataKey="rollingAvg"
            name="Rolling Avg"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Chart 2: Board State (Mini Kanban Board) ───────────────

function BoardStateView() {
  return (
    <Card>
      <div
        className="text-[13px] font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Current Board State &mdash; Day 60
      </div>
      <div
        className="text-[11px] mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        A snapshot of the board at the end of Round 3. Each column shows items
        currently in that stage.
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ minHeight: 180 }}
      >
        {BOARD_END_STATE.map((col) => {
          const isDone = col.location === "done";
          return (
            <div
              key={col.location}
              className="flex-shrink-0 rounded-lg p-2"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-faint)",
                minWidth: isDone ? 100 : 90,
                maxWidth: isDone ? 120 : 110,
              }}
            >
              {/* Column header */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: col.color }}
                />
                <span
                  className="text-[10px] font-bold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.label}
                </span>
              </div>

              {/* Items */}
              {isDone ? (
                <div
                  className="text-center py-4 rounded-md text-[11px] font-bold"
                  style={{
                    background: "rgba(163,230,53,0.06)",
                    color: "#a3e635",
                    border: "1px solid rgba(163,230,53,0.15)",
                  }}
                >
                  {col.items.length} items
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {col.items.length === 0 ? (
                    <div
                      className="text-[10px] text-center py-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      empty
                    </div>
                  ) : (
                    col.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md px-2 py-1.5"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: item.blocked
                            ? "2px solid #ef4444"
                            : "1px solid var(--border-faint)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.id}
                          </span>
                          {item.age > 0 && (
                            <span
                              className="text-[9px] font-bold px-1 py-0.5 rounded"
                              style={{
                                background: `${ageBadgeColor(item.age)}20`,
                                color: ageBadgeColor(item.age),
                              }}
                            >
                              {item.age}d
                            </span>
                          )}
                        </div>
                        {item.blocked && (
                          <div
                            className="text-[8px] font-bold mt-0.5"
                            style={{ color: "#ef4444" }}
                          >
                            BLOCKED
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Chart 3: Aging WIP ─────────────────────────────────────

function AgingWipChart() {
  const sorted = [...AGING_WIP_DATA].sort((a, b) => b.age - a.age);

  const barData = sorted.map((d) => ({
    name: d.itemId,
    age: d.age,
    location: d.location,
    locationLabel: d.locationLabel,
  }));

  return (
    <Card>
      <div
        className="text-[13px] font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Aging Work in Progress
      </div>
      <div
        className="text-[11px] mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        Each bar shows how many days an in-progress item has been active. Items
        approaching the SLE need immediate attention.
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ top: 10, right: 30, bottom: 10, left: 50 }}
        >
          <CartesianGrid
            stroke={GRID}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={TICK}
            stroke={AXIS}
            domain={[0, SLE_DAYS + 2]}
            label={{
              value: "Age (days)",
              position: "insideBottom",
              offset: -5,
              style: { ...TICK, fontSize: 10 },
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={TICK}
            stroke={AXIS}
            width={45}
          />
          <Tooltip
            {...TT}
            formatter={(value: number) => [`${value} days`, "Age"]}
            labelFormatter={(label) => `${label}`}
          />
          <ReferenceLine
            x={SLE_DAYS}
            stroke="#ef4444"
            strokeDasharray="6 4"
            label={{
              value: "SLE",
              position: "top",
              fill: "#ef4444",
              fontSize: 10,
            }}
          />
          <Bar dataKey="age" radius={[0, 4, 4, 0]}>
            {barData.map((entry, i) => (
              <Cell key={`aging-${i}`} fill={locationBarColor(entry.location)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Step 2: Analysis ───────────────────────────────────────

function AnalysisStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const summaryCards = [
    {
      title: "Cycle Time",
      color: "#8b5cf6",
      finding:
        "93% of items within SLE. Predictable system with 2 outliers worth investigating.",
    },
    {
      title: "Throughput",
      color: "#3b82f6",
      finding:
        "Steady 0.5 items/day. Consistent enough for reliable Monte Carlo forecasting.",
    },
    {
      title: "Board State",
      color: "#22c55e",
      finding:
        "Low WIP (6 items), 30 completed. Healthy 5:1 done-to-WIP ratio.",
    },
    {
      title: "Aging WIP",
      color: "#f59e0b",
      finding:
        "Oldest item is 7 days (70% of SLE). No breaches yet, but W-31 needs attention.",
    },
  ];

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Synthesis"
        tagColor="#ef4444"
        title="Putting It Together"
        desc="These four metrics form a complete picture of your workflow health."
      />

      <Card accent="239,68,68">
        <div
          className="text-[12px] font-bold mb-3"
          style={{ color: "#ef4444" }}
        >
          Four Dimensions of Flow Health
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Each chart tells part of the story. Together, they give you a
          comprehensive, data-driven view of how work moves through your system.
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <div className="flex items-start gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: card.color }}
              />
              <div>
                <div
                  className="text-[12px] font-bold mb-1"
                  style={{ color: card.color }}
                >
                  {card.title}
                </div>
                <div
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {card.finding}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Card accent="139,92,246">
          <div
            className="text-[13px] font-bold mb-2"
            style={{ color: "#a78bfa" }}
          >
            Key Insight
          </div>
          <div
            className="text-[12px] leading-[1.8]"
            style={{ color: "var(--text-secondary)" }}
          >
            Making a change to your workflow &mdash; adjusting WIP limits,
            adding policies, resolving blockers &mdash; will be reflected in
            these metrics. They are your{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              feedback loop for continuous improvement
            </strong>{" "}
            and experimentation.
          </div>
        </Card>
      </div>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Charts</Btn>
        <Btn primary onClick={onNext}>
          Take the Quiz &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 3: Quiz ───────────────────────────────────────────

function QuizStep({ onBack }: { onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [showScore, setShowScore] = useState(false);

  const totalQuestions = QUIZ.length;
  const score = QUIZ.filter((q) => answers[q.id] === q.ans).length;
  const passThreshold = Math.ceil(totalQuestions * 0.8);
  const passed = score >= passThreshold;

  const handleSelect = (questionId: number, optIndex: number) => {
    if (revealed.has(questionId)) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
    setRevealed((prev) => new Set(prev).add(questionId));
  };

  const allRevealed = revealed.size === totalQuestions;

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Quiz"
        tagColor="#ef4444"
        title="Check Your Understanding"
        desc={`${totalQuestions} questions. Click an answer to reveal whether it's correct. Score 80% (${passThreshold}/${totalQuestions}) to pass.`}
      />

      <div className="flex flex-col gap-4">
        {QUIZ.map((q, qi) => {
          const isRevealed = revealed.has(q.id);
          const selected = answers[q.id];
          const isCorrect = selected === q.ans;

          return (
            <Card key={q.id}>
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Question {qi + 1}
              </div>
              <div
                className="text-[13px] font-bold mb-3 leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                {q.q}
              </div>

              <div className="flex flex-col gap-1.5">
                {q.opts.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isAnswer = isRevealed && oi === q.ans;
                  const isWrong = isRevealed && isSelected && !isCorrect;

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.id, oi)}
                      className="w-full text-left rounded-lg px-3 py-2 border-none cursor-pointer transition-all text-[12px]"
                      style={{
                        background: isAnswer
                          ? "rgba(34,197,94,0.08)"
                          : isWrong
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(255,255,255,0.03)",
                        border: isAnswer
                          ? "1px solid rgba(34,197,94,0.3)"
                          : isWrong
                          ? "1px solid rgba(239,68,68,0.3)"
                          : "1px solid var(--border-faint)",
                        color: isAnswer
                          ? "#22c55e"
                          : isWrong
                          ? "#ef4444"
                          : "var(--text-secondary)",
                        cursor: isRevealed ? "default" : "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isRevealed && (
                <div
                  className="mt-3 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed fade-up"
                  style={{
                    background: isCorrect
                      ? "rgba(34,197,94,0.04)"
                      : "rgba(239,68,68,0.04)",
                    border: isCorrect
                      ? "1px solid rgba(34,197,94,0.12)"
                      : "1px solid rgba(239,68,68,0.12)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong
                    style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}
                  >
                    {isCorrect ? "Correct!" : "Not quite."}
                  </strong>{" "}
                  {q.exp}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {allRevealed && !showScore && (
        <div className="flex justify-center mt-5">
          <Btn primary onClick={() => setShowScore(true)}>
            See Your Score &rarr;
          </Btn>
        </div>
      )}

      {showScore && (
        <div className="fade-up mt-5">
          <Card accent={passed ? "34,197,94" : "239,68,68"}>
            <div className="text-center">
              <div
                className="text-[28px] font-extrabold mb-1"
                style={{ color: passed ? "#22c55e" : "#ef4444" }}
              >
                {score}/{totalQuestions}
              </div>
              <div
                className="text-[13px] font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {passed ? "You passed!" : "Not quite there yet"}
              </div>
              <div
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--text-tertiary)" }}
              >
                {passed
                  ? "You have a solid understanding of flow metrics. These charts are the tools you'll use to continuously improve any workflow."
                  : "Review the charts and analysis, then try again. Understanding these metrics is essential for improving flow."}
              </div>
            </div>
          </Card>

          {passed ? (
            <div
              className="mt-5 rounded-xl p-5 text-center"
              style={{
                background: "rgba(34,197,94,0.04)",
                border: "1px solid rgba(34,197,94,0.12)",
              }}
            >
              <div
                className="text-sm font-bold mb-2"
                style={{ color: "#4ade80" }}
              >
                Lesson Complete
              </div>
              <div
                className="text-xs mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                You can now read and interpret the four key flow charts used in
                Kanban.
              </div>
              <Link href="/dashboard" className="no-underline">
                <Btn primary>Back to Dashboard &rarr;</Btn>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Btn
                onClick={() => {
                  setAnswers({});
                  setRevealed(new Set());
                  setShowScore(false);
                }}
              >
                Retry Quiz
              </Btn>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-start mt-5">
        <Btn onClick={onBack}>&larr; Analysis</Btn>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function FlowMetricsDeepDiveLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav
        step={step}
        labels={LESSON_META.steps}
        onNav={setStep}
        canAdv={true}
      />
      {step === 0 && <IntroStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <ChartsStep
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <AnalysisStep
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && <QuizStep onBack={() => setStep(2)} />}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ background: "#ef4444" }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: "#ef4444" }}
        >
          Section 5 &middot; Improving the Workflow
        </span>
      </div>
    </div>
  );
}
