"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  LESSON_META,
  MATCH_EXERCISE,
  WORKFLOW_ELEMENTS,
  QUIZ,
} from "@/content/lesson-workflow-improvements/config";

// ─── Step 0: Intro ──────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Lesson 5.4"
        tagColor="#ef4444"
        title="Workflow Improvements"
        desc="Flow metrics don't just measure your system — they diagnose it. Each metric signal points to a specific workflow element you can improve."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          In previous lessons you learned to read flow metrics: cycle time, throughput, WIP aging, and
          cumulative flow diagrams. Now you&apos;ll connect those{" "}
          <strong style={{ color: "var(--text-primary)" }}>diagnostic signals</strong> to the specific{" "}
          <strong style={{ color: "var(--text-primary)" }}>workflow elements</strong> from the Kanban
          Guide that you can adjust to fix problems.
        </p>
        <p className="m-0">
          The Kanban Guide defines six key workflow elements. When a metric shows a problem, one of
          these elements is almost always the lever to pull.
        </p>
      </div>

      <Card accent="239,68,68">
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "#ef4444" }}
        >
          The 6 Workflow Elements
        </div>
        <div className="flex flex-col gap-1.5">
          {WORKFLOW_ELEMENTS.map((el) => (
            <div
              key={el}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#ef4444" }}
              />
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {el}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-[12px] leading-relaxed mt-4 mb-5" style={{ color: "var(--text-muted)" }}>
        In the next step, you&apos;ll match six metric signals to the workflow element that addresses
        each one. Can you connect the diagnosis to the cure?
      </div>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>
          Start Exercise &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 1: Matching Exercise ──────────────────────────────

function ExerciseStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [correct, setCorrect] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [wrongFlash, setWrongFlash] = useState<Record<string, boolean>>({});

  const allCorrect = MATCH_EXERCISE.every((item) => correct[item.id]);

  const handleSelect = (itemId: number, element: string, correctElement: string) => {
    if (correct[itemId]) return; // already answered

    if (element === correctElement) {
      setCorrect((p) => ({ ...p, [itemId]: true }));
      setSelected((p) => ({ ...p, [itemId]: element }));
    } else {
      // Flash red on the wrong button
      const flashKey = `${itemId}:${element}`;
      setWrongFlash((p) => ({ ...p, [flashKey]: true }));
      setSelected((p) => ({ ...p, [itemId]: element }));
      setTimeout(() => {
        setWrongFlash((p) => {
          const next = { ...p };
          delete next[flashKey];
          return next;
        });
      }, 600);
    }
  };

  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Exercise"
        tagColor="#ef4444"
        title="Match Metrics to Workflow Elements"
        desc="For each metric signal, select the workflow element that addresses it."
      />

      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        <div className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
          {Object.keys(correct).length} / {MATCH_EXERCISE.length} matched
        </div>
        <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border-faint)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(Object.keys(correct).length / MATCH_EXERCISE.length) * 100}%`,
              background: allCorrect
                ? "#22c55e"
                : "linear-gradient(90deg, #ef4444, #f59e0b)",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {MATCH_EXERCISE.map((item) => {
          const isCorrect = correct[item.id];

          return (
            <div
              key={item.id}
              className="rounded-[14px] p-[18px_20px] transition-all duration-300"
              style={{
                background: isCorrect ? "rgba(34,197,94,0.04)" : "var(--bg-surface)",
                border: isCorrect
                  ? "1px solid rgba(34,197,94,0.2)"
                  : "1px solid var(--border-faint)",
              }}
            >
              {/* Metric info */}
              <div className="mb-3">
                <div
                  className="text-[13px] font-bold leading-snug mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.metric}
                </div>
                <div
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.metricDescription}
                </div>
              </div>

              {/* Selectable workflow element buttons */}
              <div className="flex flex-wrap gap-1.5">
                {WORKFLOW_ELEMENTS.map((el) => {
                  const flashKey = `${item.id}:${el}`;
                  const isFlashing = wrongFlash[flashKey];
                  const isThisCorrect = isCorrect && el === item.workflowElement;
                  const isWrongSelection = isFlashing;
                  const isDimmed = isCorrect && el !== item.workflowElement;

                  return (
                    <button
                      key={el}
                      onClick={() => handleSelect(item.id, el, item.workflowElement)}
                      className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200"
                      style={{
                        background: isThisCorrect
                          ? "rgba(34,197,94,0.08)"
                          : isWrongSelection
                          ? "rgba(239,68,68,0.08)"
                          : "transparent",
                        borderColor: isThisCorrect
                          ? "#22c55e"
                          : isWrongSelection
                          ? "#ef4444"
                          : "var(--border-subtle)",
                        color: isThisCorrect
                          ? "#22c55e"
                          : isWrongSelection
                          ? "#ef4444"
                          : isDimmed
                          ? "var(--text-dimmer)"
                          : "var(--text-secondary)",
                        cursor: isCorrect ? "default" : "pointer",
                        opacity: isDimmed ? 0.4 : 1,
                        fontWeight: isThisCorrect ? 700 : 400,
                      }}
                    >
                      {el}
                    </button>
                  );
                })}
              </div>

              {/* Success explanation */}
              {isCorrect && (
                <div
                  className="fade-in mt-3 py-2.5 px-3.5 rounded-[10px] text-xs leading-relaxed"
                  style={{
                    background: "rgba(34,197,94,0.04)",
                    border: "1px solid rgba(34,197,94,0.1)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "#22c55e" }}>Correct!</strong> {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allCorrect && (
        <div
          className="fade-up mt-5 rounded-xl p-4 text-center"
          style={{
            background: "rgba(34,197,94,0.04)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <div className="text-[13px] font-bold" style={{ color: "#22c55e" }}>
            All 6 matched correctly!
          </div>
          <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
            You can now connect metric signals to actionable workflow improvements.
          </div>
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onNext} disabled={!allCorrect}>
          Review &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 2: Review ─────────────────────────────────────────

function ReviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Review"
        tagColor="#ef4444"
        title="Metrics to Elements"
        desc="A summary of all six metric-to-element connections you've made."
      />

      <div className="flex flex-col gap-3">
        {MATCH_EXERCISE.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div
                className="text-[13px] font-bold flex-1 min-w-0"
                style={{ color: "var(--text-primary)" }}
              >
                {item.metric}
              </div>
              <span
                className="text-[13px] flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                &rarr;
              </span>
              <div
                className="text-[12px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {item.workflowElement}
              </div>
            </div>
            <div
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--text-tertiary)" }}
            >
              {item.explanation}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="239,68,68">
        <div
          className="text-[13px] leading-[1.75]"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "var(--text-primary)" }}>The key insight:</strong>{" "}
          flow metrics are diagnostic signals that point directly to specific workflow elements.
          When you see a metric problem, you now know which lever to pull.
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Exercise</Btn>
        <Btn primary onClick={onNext}>
          Quiz &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 3: Quiz ───────────────────────────────────────────

function QuizStep({ onBack }: { onBack: () => void }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const sel = (qid: number, oi: number) => {
    if (!done) setAns((p) => ({ ...p, [qid]: oi }));
  };

  const allA = QUIZ.every((q) => ans[q.id] !== undefined);
  const score = QUIZ.filter((q) => ans[q.id] === q.ans).length;
  const pct = Math.round((score / QUIZ.length) * 100);
  const pass = pct >= 80;

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Knowledge Check"
        tagColor="#ef4444"
        title="Quiz: Workflow Improvements"
        desc="Test your understanding. You need 80% (4/5) to pass."
      />

      <div className="flex flex-col gap-[18px]">
        {QUIZ.map((q, qi) => {
          const picked = ans[q.id] !== undefined;
          const ok = done && ans[q.id] === q.ans;
          const bad = done && picked && ans[q.id] !== q.ans;
          return (
            <div
              key={q.id}
              className="slide-in rounded-[14px] p-[18px_20px] transition-all duration-300"
              style={{
                background: done
                  ? ok
                    ? "rgba(34,197,94,0.04)"
                    : bad
                    ? "rgba(239,68,68,0.04)"
                    : "var(--bg-surface)"
                  : "var(--bg-surface)",
                border: done
                  ? ok
                    ? "1px solid rgba(34,197,94,0.2)"
                    : bad
                    ? "1px solid rgba(239,68,68,0.2)"
                    : "1px solid var(--border-faint)"
                  : "1px solid var(--border-faint)",
                animationDelay: `${qi * 80}ms`,
              }}
            >
              <div
                className="text-sm font-bold mb-3.5 leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                <span className="mr-2 font-mono" style={{ color: "var(--text-muted)" }}>
                  {qi + 1}.
                </span>
                {q.q}
              </div>
              <div className="flex flex-col gap-2">
                {q.opts.map((opt, oi) => {
                  const isSel = ans[q.id] === oi;
                  const showOk = done && oi === q.ans;
                  const showBad = done && isSel && oi !== q.ans;
                  return (
                    <button
                      key={oi}
                      onClick={() => sel(q.id, oi)}
                      className="py-3 px-4 rounded-[10px] text-left text-[13px] leading-relaxed transition-all duration-200"
                      style={{
                        border: showOk
                          ? "2px solid #22c55e"
                          : showBad
                          ? "2px solid #ef4444"
                          : isSel
                          ? "2px solid #3b82f6"
                          : "2px solid var(--border-subtle)",
                        background: showOk
                          ? "rgba(34,197,94,0.06)"
                          : showBad
                          ? "rgba(239,68,68,0.06)"
                          : isSel
                          ? "rgba(59,130,246,0.06)"
                          : "transparent",
                        color: showOk
                          ? "#6ee7b7"
                          : showBad
                          ? "#fca5a5"
                          : isSel
                          ? "#93c5fd"
                          : "var(--text-quiz-option)",
                        fontWeight: isSel ? 600 : 400,
                        cursor: done ? "default" : "pointer",
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full mr-3 flex-shrink-0 text-[10px] font-bold font-mono align-middle"
                        style={{
                          background: showOk
                            ? "#22c55e"
                            : showBad
                            ? "#ef4444"
                            : isSel
                            ? "#3b82f6"
                            : "var(--bg-quiz-circle)",
                          color:
                            isSel || showOk || showBad
                              ? "#fff"
                              : "var(--text-coin-idle)",
                          border:
                            !isSel && !showOk && !showBad
                              ? "2px solid var(--border-coin-idle)"
                              : "none",
                        }}
                      >
                        {showOk
                          ? "\u2713"
                          : showBad
                          ? "\u2717"
                          : String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {done && (
                <div
                  className="fade-in mt-3 py-2.5 px-3.5 rounded-[10px] text-xs leading-relaxed"
                  style={{
                    background: ok
                      ? "rgba(34,197,94,0.04)"
                      : "rgba(59,130,246,0.04)",
                    border: ok
                      ? "1px solid rgba(34,197,94,0.08)"
                      : "1px solid rgba(59,130,246,0.08)",
                    color: ok ? "#6ee7b7" : "#93c5fd",
                  }}
                >
                  {q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!done ? (
        <div className="mt-6 flex justify-between flex-wrap gap-2.5">
          <Btn onClick={onBack}>&larr; Review</Btn>
          <Btn primary onClick={() => setDone(true)} disabled={!allA}>
            {allA ? "Submit Answers" : `Answer all ${QUIZ.length} questions`}
          </Btn>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="pop-in rounded-2xl py-6 px-7 text-center"
            style={{
              background: pass
                ? "rgba(34,197,94,0.05)"
                : "rgba(245,158,11,0.05)",
              border: pass
                ? "1px solid rgba(34,197,94,0.18)"
                : "1px solid rgba(245,158,11,0.18)",
            }}
          >
            <div
              className="text-[52px] font-extrabold font-mono leading-none"
              style={{ color: pass ? "#34d399" : "#fbbf24" }}
            >
              {pct}%
            </div>
            <div
              className="text-base font-bold mt-1.5 mb-2"
              style={{ color: pass ? "#34d399" : "#fbbf24" }}
            >
              {pass ? "Lesson Complete!" : "Almost There"}
            </div>
            <div
              className="text-[13px] leading-relaxed max-w-[400px] mx-auto"
              style={{ color: "var(--text-quiz-option)" }}
            >
              {pass
                ? `You scored ${score}/${QUIZ.length}. You can confidently connect flow metric signals to actionable workflow improvements.`
                : `You scored ${score}/${QUIZ.length}. Review the explanations above and try again \u2014 80% needed.`}
            </div>
            {!pass && (
              <button
                onClick={() => {
                  setAns({});
                  setDone(false);
                }}
                className="mt-4 py-2.5 px-6 rounded-[10px] border-none text-white font-bold text-sm cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.15)",
                }}
              >
                Retry Quiz
              </button>
            )}
          </div>
          <div className="flex justify-between mt-[18px] flex-wrap gap-2.5">
            <Btn onClick={onBack}>&larr; Review</Btn>
            {pass && (
              <Link href="/dashboard" className="no-underline">
                <Btn primary>Back to Dashboard &rarr;</Btn>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function WorkflowImprovementsLesson() {
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
        <ExerciseStep onNext={() => setStep(2)} onBack={() => setStep(0)} />
      )}
      {step === 2 && (
        <ReviewStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
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
