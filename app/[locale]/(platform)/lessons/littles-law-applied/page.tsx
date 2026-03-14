"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { LESSON_META, SCENARIOS, QUIZ } from "@/content/lesson-littles-law-applied/config";

// ─── Step 0: Intro ──────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Lesson 5.1"
        tagColor="#ef4444"
        title="Applying Little's Law"
        desc="Use Little's Law as a diagnostic tool to analyse real-world scenarios and make better decisions about WIP, throughput, and delivery timelines."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          In Lesson 3, you discovered{" "}
          <strong style={{ color: "var(--text-primary)" }}>Little&apos;s Law</strong> and saw it in
          action through simulation. Now it&apos;s time to use it as a{" "}
          <strong style={{ color: "#ef4444" }}>diagnostic tool</strong> &mdash; applying the formula
          to real scenarios where teams make promises, managers ask questions, and stakeholders want
          answers.
        </p>
        <p className="m-0 mb-3">
          You&apos;ll work through <strong style={{ color: "var(--text-primary)" }}>4 real-world scenarios</strong> where
          Little&apos;s Law reveals whether commitments are realistic, what happens when WIP
          explodes, and how to give honest delivery forecasts.
        </p>
      </div>

      <Card accent="239,68,68">
        <div className="text-center">
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "#ef4444" }}
          >
            The Formula
          </div>
          <div
            className="text-[clamp(20px,4vw,28px)] font-extrabold font-mono"
            style={{ color: "var(--text-primary)" }}
          >
            CT = WIP &divide; Throughput
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--text-tertiary)" }}>
            Cycle Time (days) = Work in Progress &divide; Throughput (items/day)
          </div>
        </div>
      </Card>

      <div className="text-[12px] leading-relaxed mt-4 mb-5" style={{ color: "var(--text-tertiary)" }}>
        This relationship is always true for a stable system. If you know any two of the three
        variables, you can calculate the third. This makes it an incredibly powerful tool for
        cutting through gut feelings and making data-driven decisions.
      </div>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>
          Start Calculator &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 1: Calculator ─────────────────────────────────────

function CalculatorStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  // Track which two fields the user is entering (the third is calculated)
  const [userWip, setUserWip] = useState<string>("");
  const [userThroughput, setUserThroughput] = useState<string>("");
  const [userCycleTime, setUserCycleTime] = useState<string>("");
  // Which field was most recently cleared to become the "calculated" one
  const [lockedOut, setLockedOut] = useState<"wip" | "throughput" | "cycleTime" | null>(null);

  const wipVal = userWip === "" ? null : parseFloat(userWip);
  const thVal = userThroughput === "" ? null : parseFloat(userThroughput);
  const ctVal = userCycleTime === "" ? null : parseFloat(userCycleTime);

  // Derive the calculated value
  let calculated: string | null = null;
  let calcWip = wipVal;
  let calcTh = thVal;
  let calcCt = ctVal;

  const filledCount = [wipVal, thVal, ctVal].filter((v) => v !== null && !isNaN(v)).length;

  if (filledCount === 2) {
    if (wipVal !== null && thVal !== null && !isNaN(wipVal) && !isNaN(thVal) && thVal > 0 && (ctVal === null || lockedOut === "cycleTime")) {
      calcCt = Math.round((wipVal / thVal) * 100) / 100;
      calculated = "cycleTime";
    } else if (wipVal !== null && ctVal !== null && !isNaN(wipVal) && !isNaN(ctVal) && ctVal > 0 && (thVal === null || lockedOut === "throughput")) {
      calcTh = Math.round((wipVal / ctVal) * 100) / 100;
      calculated = "throughput";
    } else if (thVal !== null && ctVal !== null && !isNaN(thVal) && !isNaN(ctVal) && (wipVal === null || lockedOut === "wip")) {
      calcWip = Math.round((thVal * ctVal) * 100) / 100;
      calculated = "wip";
    }
  }

  const handleChange = (field: "wip" | "throughput" | "cycleTime", value: string) => {
    // When user types in a field, that field becomes user-controlled
    // The previously calculated field becomes the new calculated target
    if (field === "wip") {
      setUserWip(value);
      if (calculated === "wip" || lockedOut === "wip") {
        // User is overriding the calculated field — figure out which other to calculate
        setLockedOut(null);
      } else if (lockedOut === null && calculated) {
        setLockedOut(calculated as "wip" | "throughput" | "cycleTime");
      }
    } else if (field === "throughput") {
      setUserThroughput(value);
      if (calculated === "throughput" || lockedOut === "throughput") {
        setLockedOut(null);
      } else if (lockedOut === null && calculated) {
        setLockedOut(calculated as "wip" | "throughput" | "cycleTime");
      }
    } else {
      setUserCycleTime(value);
      if (calculated === "cycleTime" || lockedOut === "cycleTime") {
        setLockedOut(null);
      } else if (lockedOut === null && calculated) {
        setLockedOut(calculated as "wip" | "throughput" | "cycleTime");
      }
    }
  };

  const handleClear = () => {
    setUserWip("");
    setUserThroughput("");
    setUserCycleTime("");
    setLockedOut(null);
  };

  const wip = calculated === "wip" ? calcWip : wipVal;
  const throughput = calculated === "throughput" ? calcTh : thVal;
  const cycleTime = calculated === "cycleTime" ? calcCt : ctVal;

  const inputStyle = (field: string) => ({
    background: calculated === field ? "rgba(34,197,94,0.08)" : "var(--bg-surface)",
    border:
      calculated === field
        ? "2px solid rgba(34,197,94,0.4)"
        : "1px solid var(--border-subtle)",
    color: calculated === field ? "#22c55e" : "var(--text-primary)",
  });

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Interactive Calculator"
        tagColor="#ef4444"
        title="Little's Law Calculator"
        desc="Enter any two values and the third will be calculated automatically using Little's Law."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* WIP */}
        <div>
          <label
            className="block text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            WIP (items)
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 12"
            value={calculated === "wip" ? (calcWip ?? "") : userWip}
            onChange={(e) => handleChange("wip", e.target.value)}
            readOnly={calculated === "wip"}
            className="rounded-lg text-lg font-mono p-3 w-full outline-none"
            style={inputStyle("wip")}
          />
          {calculated === "wip" && (
            <div className="text-[10px] mt-1 font-bold" style={{ color: "#22c55e" }}>
              Calculated
            </div>
          )}
        </div>

        {/* Throughput */}
        <div>
          <label
            className="block text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Throughput (items/day)
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 3"
            value={calculated === "throughput" ? (calcTh ?? "") : userThroughput}
            onChange={(e) => handleChange("throughput", e.target.value)}
            readOnly={calculated === "throughput"}
            className="rounded-lg text-lg font-mono p-3 w-full outline-none"
            style={inputStyle("throughput")}
          />
          {calculated === "throughput" && (
            <div className="text-[10px] mt-1 font-bold" style={{ color: "#22c55e" }}>
              Calculated
            </div>
          )}
        </div>

        {/* Cycle Time */}
        <div>
          <label
            className="block text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Cycle Time (days)
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 4"
            value={calculated === "cycleTime" ? (calcCt ?? "") : userCycleTime}
            onChange={(e) => handleChange("cycleTime", e.target.value)}
            readOnly={calculated === "cycleTime"}
            className="rounded-lg text-lg font-mono p-3 w-full outline-none"
            style={inputStyle("cycleTime")}
          />
          {calculated === "cycleTime" && (
            <div className="text-[10px] mt-1 font-bold" style={{ color: "#22c55e" }}>
              Calculated
            </div>
          )}
        </div>
      </div>

      {calculated && (
        <Card accent="34,197,94">
          <div className="text-center fade-up">
            <div className="text-[12px] font-bold mb-1" style={{ color: "#22c55e" }}>
              Result
            </div>
            <div className="text-[15px] font-mono leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {calculated === "cycleTime" && (
                <>
                  CT = {wip} &divide; {throughput} ={" "}
                  <strong style={{ color: "#22c55e" }}>{cycleTime} days</strong>
                </>
              )}
              {calculated === "throughput" && (
                <>
                  TH = {wip} &divide; {cycleTime} ={" "}
                  <strong style={{ color: "#22c55e" }}>{throughput} items/day</strong>
                </>
              )}
              {calculated === "wip" && (
                <>
                  WIP = {throughput} &times; {cycleTime} ={" "}
                  <strong style={{ color: "#22c55e" }}>{wip} items</strong>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {!calculated && (
        <Card>
          <div className="text-center text-[12px]" style={{ color: "var(--text-muted)" }}>
            Enter any two values above to calculate the third.
          </div>
        </Card>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <div className="flex gap-2">
          <Btn onClick={onBack}>&larr; Intro</Btn>
          <Btn onClick={handleClear}>Clear</Btn>
        </div>
        <Btn primary onClick={onNext}>
          Scenarios &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 2: Scenarios ──────────────────────────────────────

function ScenariosStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const toggleReveal = (id: number) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allRevealed = SCENARIOS.every((s) => revealed[s.id]);

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Real-World Scenarios"
        tagColor="#ef4444"
        title="Diagnose with Little's Law"
        desc="Work through each scenario. Think about what Little's Law reveals before checking the analysis."
      />

      <div className="flex flex-col gap-4">
        {SCENARIOS.map((scenario) => (
          <Card key={scenario.id}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                }}
              >
                {scenario.id}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[14px] font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {scenario.title}
                </div>
                <div
                  className="text-[12px] leading-[1.7] mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {scenario.description}
                </div>

                {/* Hint (before reveal) */}
                {!revealed[scenario.id] && (
                  <div
                    className="rounded-lg px-3 py-2.5 mb-3"
                    style={{
                      background: "rgba(245,158,11,0.04)",
                      border: "1px solid rgba(245,158,11,0.12)",
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#f59e0b" }}
                    >
                      Hint
                    </div>
                    <div
                      className="text-[11px] leading-relaxed"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {scenario.hint}
                    </div>
                  </div>
                )}

                {/* Analysis (after reveal) */}
                {revealed[scenario.id] && (
                  <div
                    className="rounded-lg px-3 py-2.5 mb-3 fade-up"
                    style={{
                      background: "rgba(34,197,94,0.04)",
                      border: "1px solid rgba(34,197,94,0.15)",
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#22c55e" }}
                    >
                      Analysis
                    </div>
                    <div
                      className="text-[11px] leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {scenario.analysis}
                    </div>
                  </div>
                )}

                <Btn small onClick={() => toggleReveal(scenario.id)}>
                  {revealed[scenario.id] ? "Hide Analysis" : "Show Analysis"}
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {allRevealed && (
        <div className="mt-4 text-center fade-up">
          <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            All scenarios analysed. Ready for the quiz?
          </div>
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Calculator</Btn>
        <Btn primary onClick={onNext} disabled={!allRevealed}>
          Quiz &rarr;
        </Btn>
      </div>
    </div>
  );
}

// ─── Step 3: Quiz ───────────────────────────────────────────

function QuizStep({ onBack }: { onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (answers[questionId] !== undefined) return; // already answered
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const allAnswered = QUIZ.every((q) => answers[q.id] !== undefined);
  const score = QUIZ.filter((q) => answers[q.id] === q.ans).length;
  const passed = score >= 4;

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Knowledge Check"
        tagColor="#ef4444"
        title="Little's Law Quiz"
        desc="Test your understanding. Select the best answer for each question."
      />

      <div className="flex flex-col gap-4">
        {QUIZ.map((question, qi) => {
          const userAnswer = answers[question.id];
          const answered = userAnswer !== undefined;
          const isCorrect = userAnswer === question.ans;

          return (
            <Card key={question.id}>
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                Question {qi + 1} of {QUIZ.length}
              </div>
              <div
                className="text-[13px] font-bold leading-[1.6] mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {question.q}
              </div>

              <div className="flex flex-col gap-1.5">
                {question.opts.map((opt, oi) => {
                  const isSelected = userAnswer === oi;
                  const isCorrectOpt = question.ans === oi;
                  const showGreen = answered && isCorrectOpt;
                  const showRed = answered && isSelected && !isCorrect;

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(question.id, oi)}
                      className="w-full text-left rounded-lg px-3 py-2.5 border-none cursor-pointer transition-all text-[12px]"
                      style={{
                        background: showGreen
                          ? "rgba(34,197,94,0.08)"
                          : showRed
                          ? "rgba(239,68,68,0.08)"
                          : isSelected
                          ? "rgba(99,102,241,0.08)"
                          : "var(--bg-surface)",
                        border: showGreen
                          ? "2px solid rgba(34,197,94,0.4)"
                          : showRed
                          ? "2px solid rgba(239,68,68,0.4)"
                          : isSelected
                          ? "2px solid rgba(99,102,241,0.4)"
                          : "1px solid var(--border-faint)",
                        color: showGreen
                          ? "#22c55e"
                          : showRed
                          ? "#ef4444"
                          : "var(--text-secondary)",
                        cursor: answered ? "default" : "pointer",
                        fontWeight: showGreen || showRed ? 700 : 400,
                      }}
                    >
                      {opt}
                      {showGreen && <span className="ml-2">{"\u2713"}</span>}
                      {showRed && <span className="ml-2">{"\u2717"}</span>}
                    </button>
                  );
                })}
              </div>

              {answered && (
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
                  <strong style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}>
                    {isCorrect ? "Correct!" : "Incorrect."}
                  </strong>{" "}
                  {question.exp}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Score Card */}
      {allAnswered && (
        <div className="mt-5 fade-up">
          <Card accent={passed ? "34,197,94" : "239,68,68"}>
            <div className="text-center">
              <div
                className="text-[22px] font-extrabold mb-1"
                style={{ color: passed ? "#22c55e" : "#ef4444" }}
              >
                {score}/{QUIZ.length}
              </div>
              <div
                className="text-[13px] font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {passed ? "You passed!" : "Not quite there yet."}
              </div>
              <div
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--text-tertiary)" }}
              >
                {passed
                  ? "You have a strong grasp of Little's Law and how to apply it in real-world situations. You can use this formula to challenge unrealistic commitments and make better forecasts."
                  : "Review the scenarios and try again. Remember: CT = WIP \u00F7 Throughput. Focus on what each variable means and how changing one affects the others."}
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Scenarios</Btn>
        {allAnswered && passed && (
          <Link href="/dashboard" className="no-underline">
            <Btn primary>Back to Dashboard &rarr;</Btn>
          </Link>
        )}
        {allAnswered && !passed && (
          <Btn
            onClick={() => setAnswers({})}
          >
            Retry Quiz
          </Btn>
        )}
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function LittlesLawAppliedLesson() {
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
        <CalculatorStep onNext={() => setStep(2)} onBack={() => setStep(0)} />
      )}
      {step === 2 && (
        <ScenariosStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
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
