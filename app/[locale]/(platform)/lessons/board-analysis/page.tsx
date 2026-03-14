"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  LESSON_META,
  SCENARIO_BOARDS,
  QUIZ,
  METRICS_SCENARIOS,
} from "@/content/lesson-board-analysis/config";
import type {
  ScenarioBoard,
  BoardColumn,
  BoardItem,
} from "@/content/lesson-board-analysis/config";

// ─── Color Map ───────────────────────────────────────────────

const ITEM_COLORS: Record<string, { bg: string; border: string }> = {
  orange: {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.3)",
  },
  blue: {
    bg: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.3)",
  },
  green: {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.3)",
  },
  yellow: {
    bg: "rgba(250,204,21,0.15)",
    border: "rgba(250,204,21,0.3)",
  },
  gray: {
    bg: "rgba(148,163,184,0.15)",
    border: "rgba(148,163,184,0.3)",
  },
  red: {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.3)",
  },
};

// ─── Item Card ───────────────────────────────────────────────

function ItemCard({ item }: { item: BoardItem }) {
  const colors = ITEM_COLORS[item.color] || ITEM_COLORS.gray;
  const isBlocked = !!item.blocked;

  return (
    <div
      className="rounded-md px-1.5 py-1 mb-1 text-[9px]"
      style={{
        background: colors.bg,
        border: isBlocked
          ? "2px solid #ef4444"
          : `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className="font-mono text-[8px] font-bold"
          style={{ color: "var(--text-muted)" }}
        >
          {item.id}
        </span>
        {isBlocked && (
          <span
            className="text-[7px] font-bold uppercase tracking-wider"
            style={{ color: "#ef4444" }}
          >
            BLOCKED
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Mini Board ──────────────────────────────────────────────

function MiniBoard({ board }: { board: ScenarioBoard }) {
  return (
    <div
      className="rounded-xl p-3 overflow-x-auto"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-faint)",
      }}
    >
      <div
        className="flex gap-1.5"
        style={{ minWidth: board.columns.length * 90 }}
      >
        {board.columns.map((col: BoardColumn) => {
          const hasSubColumns = !!col.subColumns && col.subColumns.length > 0;

          return (
            <div key={col.name} className="flex-1" style={{ minWidth: 80 }}>
              {/* Main Column Header */}
              <div
                className="rounded-t-lg px-2 py-1.5 flex items-center justify-between gap-1"
                style={{ background: "var(--bg-surface-raised)" }}
              >
                <span
                  className="text-[9px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.name}
                </span>
                {col.wipLimit !== undefined && (
                  <span
                    className="text-[8px] font-bold rounded-full px-1.5 py-0.5"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      color: "#3b82f6",
                      border: "1px solid rgba(59,130,246,0.2)",
                    }}
                  >
                    {col.wipLimit}
                  </span>
                )}
              </div>

              {hasSubColumns ? (
                /* Sub-columns layout */
                <div className="flex" style={{ background: "var(--bg-surface-raised)", opacity: 0.7 }}>
                  {col.subColumns!.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex-1"
                      style={{
                        minWidth: 50,
                        borderRight: "1px solid var(--border-faint)",
                      }}
                    >
                      {/* Sub-column header */}
                      <div
                        className="text-[7px] font-bold text-center py-1 px-0.5"
                        style={{
                          color: "var(--text-muted)",
                          borderTop: "1px solid var(--border-faint)",
                          borderBottom: "1px solid var(--border-faint)",
                        }}
                      >
                        {sub.name}
                      </div>
                      {/* Sub-column items */}
                      <div className="p-1 min-h-[50px]">
                        {sub.items.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Direct items layout */
                <div
                  className="p-1.5 min-h-[50px] rounded-b-lg"
                  style={{
                    background: "var(--bg-surface-raised)",
                    opacity: 0.7,
                  }}
                >
                  {col.items?.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Board Analysis Card ─────────────────────────────────────

function BoardAnalysis({
  board,
  isRevealed,
  onReveal,
}: {
  board: ScenarioBoard;
  isRevealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="mb-6">
      {/* Board Header */}
      <div className="mb-2">
        <div
          className="text-[13px] font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Board {board.id}: {board.title}
        </div>
        <div
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {board.description}
        </div>
      </div>

      {/* Mini Board */}
      <MiniBoard board={board} />

      {/* Analysis Question + Reveal */}
      <div className="mt-3">
        <div
          className="text-[11px] font-bold mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {board.analysisQuestion}
        </div>

        {!isRevealed && <Btn onClick={onReveal}>Reveal Analysis</Btn>}

        {isRevealed && (
          <div className="fade-up mt-2">
            {/* Problems */}
            <div className="mb-3">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "#ef4444" }}
              >
                Problems Identified
              </div>
              <div className="flex flex-col gap-1">
                {board.problems.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] leading-relaxed"
                  >
                    <span style={{ color: "#ef4444", flexShrink: 0 }}>
                      {"\u2022"}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insight */}
            <Card accent="34,197,94">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "#22c55e" }}
              >
                Key Insight
              </div>
              <div
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {board.keyInsight}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────

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

// ─── Step 0: Intro ───────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  const columnStructure = [
    "Input Queue",
    "Discovery (In Progress / Complete)",
    "Building (Doing / Complete)",
    "User Acceptance",
    "Prod",
  ];

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Lesson 5.3"
        tagColor="#ef4444"
        title="Board Analysis"
        desc="Analyse four Kanban boards with real problems. The boards use the same column structure as the Kanban Game. Spot the issues, then learn which flow metrics would help diagnose them."
      />

      <Card>
        <div
          className="text-[12px] font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Kanban Game Board Structure
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {columnStructure.map((col, i) => (
            <div key={col} className="flex items-center gap-1.5">
              <div
                className="rounded-md px-2 py-1 text-[10px] font-bold"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  color: "#3b82f6",
                }}
              >
                {col}
              </div>
              {i < columnStructure.length - 1 && (
                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Discovery and Building each have two sub-columns (active work and
          completed work waiting to be pulled).
        </div>
      </Card>

      <div className="mt-5">
        <div
          className="text-[12px] font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          What You&apos;ll Analyse
        </div>
        <div className="flex flex-col gap-2">
          {SCENARIO_BOARDS.map((b) => (
            <div key={b.id} className="flex items-start gap-2.5">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {b.id}
              </div>
              <div>
                <div
                  className="text-[12px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {b.title}
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {b.description.split(".")[0]}.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>
          Start Analysis &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 1: Boards 1-2 ─────────────────────────────────────

function Boards12Step({
  revealed,
  onReveal,
  onBack,
  onNext,
}: {
  revealed: Record<number, boolean>;
  onReveal: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Boards 1-2"
        tagColor="#ef4444"
        title="Spot the Problems"
        desc="Examine each board carefully. Look at WIP limits, item distribution, and column patterns before revealing the analysis."
      />

      <BoardAnalysis
        board={SCENARIO_BOARDS[0]}
        isRevealed={!!revealed[1]}
        onReveal={() => onReveal(1)}
      />

      <BoardAnalysis
        board={SCENARIO_BOARDS[1]}
        isRevealed={!!revealed[2]}
        onReveal={() => onReveal(2)}
      />

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onNext}>
          Boards 3-4 &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 2: Boards 3-4 ─────────────────────────────────────

function Boards34Step({
  revealed,
  onReveal,
  onBack,
  onNext,
  allRevealed,
}: {
  revealed: Record<number, boolean>;
  onReveal: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
  allRevealed: boolean;
}) {
  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Boards 3-4"
        tagColor="#ef4444"
        title="Anti-Patterns & Blockers"
        desc="One board has a structural anti-pattern. The other has a blocker crisis. Can you diagnose both?"
      />

      <BoardAnalysis
        board={SCENARIO_BOARDS[2]}
        isRevealed={!!revealed[3]}
        onReveal={() => onReveal(3)}
      />

      <BoardAnalysis
        board={SCENARIO_BOARDS[3]}
        isRevealed={!!revealed[4]}
        onReveal={() => onReveal(4)}
      />

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Boards 1-2</Btn>
        <Btn primary onClick={onNext} disabled={!allRevealed}>
          {allRevealed
            ? "Metrics Challenge \u2192"
            : "Reveal all boards to continue"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Metric Toggle Button ────────────────────────────────────

const ALL_METRICS = ["WIP", "Work Item Age", "Cycle Time", "Throughput"];

function MetricToggle({
  label,
  isOn,
  onToggle,
  disabled,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-all"
      style={{
        background: isOn ? "rgba(59,130,246,0.15)" : "transparent",
        color: isOn ? "#3b82f6" : "var(--text-muted)",
        border: isOn
          ? "2px solid rgba(59,130,246,0.4)"
          : "2px solid var(--border-faint)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ─── Step 3: Metrics Quiz ────────────────────────────────────

function MetricsQuizStep({ onBack }: { onBack: () => void }) {
  // Metrics selection state: scenarioId -> Set of selected metric names
  const [selections, setSelections] = useState<Record<number, Set<string>>>(
    {}
  );
  // Which scenarios have been checked
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  // Which scenarios are correct
  const [correct, setCorrect] = useState<Record<number, boolean>>({});
  // Missing metrics for feedback
  const [missing, setMissing] = useState<Record<number, string[]>>({});

  // Standard quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizRevealed, setQuizRevealed] = useState<Set<number>>(new Set());
  const [showQuizScore, setShowQuizScore] = useState(false);

  const toggleMetric = (scenarioId: number, metric: string) => {
    if (checked[scenarioId] && correct[scenarioId]) return; // locked if correct
    setSelections((prev) => {
      const current = new Set(prev[scenarioId] || []);
      if (current.has(metric)) {
        current.delete(metric);
      } else {
        current.add(metric);
      }
      return { ...prev, [scenarioId]: current };
    });
    // Reset check state on change
    if (checked[scenarioId]) {
      setChecked((prev) => ({ ...prev, [scenarioId]: false }));
      setCorrect((prev) => ({ ...prev, [scenarioId]: false }));
      setMissing((prev) => ({ ...prev, [scenarioId]: [] }));
    }
  };

  const checkScenario = (scenarioId: number) => {
    const scenario = METRICS_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const selected = selections[scenarioId] || new Set<string>();
    const missingMetrics = scenario.correctMetrics.filter(
      (m) => !selected.has(m)
    );
    const isCorrect =
      missingMetrics.length === 0 &&
      selected.size === scenario.correctMetrics.length;

    setChecked((prev) => ({ ...prev, [scenarioId]: true }));
    setCorrect((prev) => ({ ...prev, [scenarioId]: isCorrect }));
    setMissing((prev) => ({ ...prev, [scenarioId]: missingMetrics }));
  };

  const allMetricsScenariosCorrect = METRICS_SCENARIOS.every(
    (s) => correct[s.id]
  );

  // Standard quiz logic
  const totalQuestions = QUIZ.length;
  const quizScore = QUIZ.filter((q) => quizAnswers[q.id] === q.ans).length;
  const quizPassed = quizScore >= Math.ceil(totalQuestions * 0.8);
  const allQuizRevealed = quizRevealed.size === totalQuestions;

  const handleQuizSelect = (questionId: number, optIndex: number) => {
    if (quizRevealed.has(questionId)) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
    setQuizRevealed((prev) => new Set(prev).add(questionId));
  };

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Metrics Challenge"
        tagColor="#ef4444"
        title="Which Metrics Help?"
        desc="For each scenario, select ALL the flow metrics that would help diagnose and track improvements."
      />

      <div className="flex flex-col gap-4 mb-6">
        {METRICS_SCENARIOS.map((scenario) => {
          const selected = selections[scenario.id] || new Set<string>();
          const isChecked = !!checked[scenario.id];
          const isCorrect = !!correct[scenario.id];
          const missingList = missing[scenario.id] || [];

          return (
            <Card key={scenario.id}>
              <div
                className="text-[13px] font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {scenario.scenarioTitle}
              </div>
              <div
                className="text-[11px] leading-relaxed mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {scenario.scenarioSummary}
              </div>

              {/* Metric toggles */}
              <div className="flex flex-wrap gap-2 mb-3">
                {ALL_METRICS.map((metric) => (
                  <MetricToggle
                    key={metric}
                    label={metric}
                    isOn={selected.has(metric)}
                    onToggle={() => toggleMetric(scenario.id, metric)}
                    disabled={isCorrect}
                  />
                ))}
              </div>

              {/* Check button */}
              {!isCorrect && (
                <Btn
                  onClick={() => checkScenario(scenario.id)}
                  disabled={selected.size === 0}
                >
                  Check
                </Btn>
              )}

              {/* Feedback */}
              {isChecked && isCorrect && (
                <div
                  className="mt-3 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed fade-up"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.15)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "#22c55e" }}>Correct!</strong>{" "}
                  {scenario.explanation}
                </div>
              )}

              {isChecked && !isCorrect && (
                <div
                  className="mt-3 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed fade-up"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "#f59e0b" }}>Almost</strong> &mdash;
                  think about how{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    {missingList.join(", ")}
                  </strong>{" "}
                  would help in this scenario.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Standard Quiz — shown after all metrics scenarios are correct */}
      {allMetricsScenariosCorrect && (
        <div className="fade-up">
          <div
            className="mb-5 rounded-xl p-4 text-center"
            style={{
              background: "rgba(34,197,94,0.04)",
              border: "1px solid rgba(34,197,94,0.12)",
            }}
          >
            <div
              className="text-[13px] font-bold mb-1"
              style={{ color: "#22c55e" }}
            >
              All scenarios correct!
            </div>
            <div
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              All four flow metrics work together to give a complete picture of
              flow health. Now test your understanding with the final quiz.
            </div>
          </div>

          <StepHeader
            tag="Quiz"
            tagColor="#ef4444"
            title="Check Your Understanding"
            desc={`${totalQuestions} questions on board analysis. Score ${Math.ceil(totalQuestions * 0.8)}/${totalQuestions} (80%) to pass.`}
          />

          <div className="flex flex-col gap-4">
            {QUIZ.map((q, qi) => {
              const isRevealed = quizRevealed.has(q.id);
              const selected = quizAnswers[q.id];
              const isQCorrect = selected === q.ans;

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
                      const isWrong =
                        isRevealed && isSelected && !isQCorrect;

                      return (
                        <button
                          key={oi}
                          onClick={() => handleQuizSelect(q.id, oi)}
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
                        background: isQCorrect
                          ? "rgba(34,197,94,0.04)"
                          : "rgba(239,68,68,0.04)",
                        border: isQCorrect
                          ? "1px solid rgba(34,197,94,0.12)"
                          : "1px solid rgba(239,68,68,0.12)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <strong
                        style={{
                          color: isQCorrect ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {isQCorrect ? "Correct!" : "Not quite."}
                      </strong>{" "}
                      {q.exp}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {allQuizRevealed && !showQuizScore && (
            <div className="flex justify-center mt-5">
              <Btn primary onClick={() => setShowQuizScore(true)}>
                See Your Score &rarr;
              </Btn>
            </div>
          )}

          {showQuizScore && (
            <div className="fade-up mt-5">
              <Card accent={quizPassed ? "34,197,94" : "239,68,68"}>
                <div className="text-center">
                  <div
                    className="text-[28px] font-extrabold mb-1"
                    style={{ color: quizPassed ? "#22c55e" : "#ef4444" }}
                  >
                    {quizScore}/{totalQuestions}
                  </div>
                  <div
                    className="text-[13px] font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {quizPassed ? "You passed!" : "Not quite there yet"}
                  </div>
                  <div
                    className="text-[11px] leading-relaxed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {quizPassed
                      ? "You can read and analyse Kanban boards effectively, and you understand how flow metrics diagnose common problems."
                      : "Review the board analyses and explanations above, then try again. You need at least 4 correct answers to pass."}
                  </div>
                </div>
              </Card>

              {quizPassed ? (
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
                    You can now read Kanban boards, spot common anti-patterns,
                    and choose the right metrics to diagnose flow problems.
                  </div>
                  <Link href="/dashboard" className="no-underline">
                    <Btn primary>Back to Dashboard &rarr;</Btn>
                  </Link>
                </div>
              ) : (
                <div className="flex justify-center mt-4">
                  <Btn
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizRevealed(new Set());
                      setShowQuizScore(false);
                    }}
                  >
                    Retry Quiz
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-start mt-7">
        <Btn onClick={onBack}>&larr; Boards 3-4</Btn>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function BoardAnalysisLesson() {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleReveal = (boardId: number) => {
    setRevealed((prev) => ({ ...prev, [boardId]: true }));
  };

  const allRevealed =
    !!revealed[1] && !!revealed[2] && !!revealed[3] && !!revealed[4];

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
        <Boards12Step
          revealed={revealed}
          onReveal={handleReveal}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Boards34Step
          revealed={revealed}
          onReveal={handleReveal}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          allRevealed={allRevealed}
        />
      )}
      {step === 3 && <MetricsQuizStep onBack={() => setStep(2)} />}
    </>
  );
}
