"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  LESSON_META,
  MYTH_FACT_QUIZ,
  REFLECTION_CATEGORIES,
  FEEDBACK_QUESTIONS,
} from "@/content/lesson-closing/config";
import type { MythFactItem, ReflectionCategory } from "@/content/lesson-closing/config";

const LABELS = LESSON_META.steps;

/* ------------------------------------------------------------------ */
/*  Step 0 — Myth or Fact Quiz                                        */
/* ------------------------------------------------------------------ */

function MythFactStep({ onNext }: { onNext: () => void }) {
  const [answers, setAnswers] = useState<Record<number, "fact" | "myth" | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleAnswer = (item: MythFactItem, choice: "fact" | "myth") => {
    if (revealed[item.id]) return;
    setAnswers((prev) => ({ ...prev, [item.id]: choice }));
    setRevealed((prev) => ({ ...prev, [item.id]: true }));
  };

  const answeredCount = Object.keys(revealed).length;
  const correctCount = MYTH_FACT_QUIZ.filter(
    (q) => revealed[q.id] && answers[q.id] === q.answer
  ).length;
  const allAnswered = answeredCount === MYTH_FACT_QUIZ.length;

  const scoreMessage = () => {
    if (correctCount === 10) return "Perfect score! You truly mastered Kanban fundamentals.";
    if (correctCount >= 8) return "Excellent work! You have a strong grasp of Kanban principles.";
    if (correctCount >= 6) return "Good effort! Review the explanations for the ones you missed.";
    return "Keep learning! The explanations above will help solidify your understanding.";
  };

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Final Challenge"
        tagColor="#f59e0b"
        title="Kanban: Fact or Myth?"
        desc="Test everything you've learned. For each statement, decide: is it Fact or Myth?"
      />

      <div className="flex flex-col gap-4">
        {MYTH_FACT_QUIZ.map((item, idx) => {
          const userAnswer = answers[item.id] ?? null;
          const isRevealed = !!revealed[item.id];
          const isCorrect = userAnswer === item.answer;

          return (
            <Card key={item.id}>
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                  style={{
                    background: isRevealed
                      ? isCorrect
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)"
                      : "rgba(245,158,11,0.12)",
                    color: isRevealed
                      ? isCorrect
                        ? "#22c55e"
                        : "#ef4444"
                      : "#f59e0b",
                    border: isRevealed
                      ? isCorrect
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)"
                      : "1px solid rgba(245,158,11,0.25)",
                  }}
                >
                  {idx + 1}
                </span>
                <p
                  className="text-sm font-medium leading-relaxed m-0"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.statement}
                </p>
              </div>

              <div className="flex gap-3 ml-10">
                <button
                  onClick={() => handleAnswer(item, "fact")}
                  disabled={isRevealed}
                  className="rounded-lg font-bold text-sm min-w-[100px] py-2.5 px-4 cursor-pointer transition-all duration-200 disabled:cursor-default flex items-center justify-center gap-1.5"
                  style={{
                    background:
                      isRevealed && item.answer === "fact"
                        ? "rgba(34,197,94,0.25)"
                        : "rgba(34,197,94,0.1)",
                    border:
                      isRevealed && item.answer === "fact"
                        ? "2px solid rgba(34,197,94,0.6)"
                        : "2px solid rgba(34,197,94,0.3)",
                    color: "#22c55e",
                    opacity: isRevealed && userAnswer === "fact" && !isCorrect ? 0.5 : 1,
                  }}
                >
                  {isRevealed && userAnswer === "fact" && isCorrect && (
                    <span>&#10003;</span>
                  )}
                  {isRevealed && userAnswer === "fact" && !isCorrect && (
                    <span>&#10007;</span>
                  )}
                  Fact
                </button>

                <button
                  onClick={() => handleAnswer(item, "myth")}
                  disabled={isRevealed}
                  className="rounded-lg font-bold text-sm min-w-[100px] py-2.5 px-4 cursor-pointer transition-all duration-200 disabled:cursor-default flex items-center justify-center gap-1.5"
                  style={{
                    background:
                      isRevealed && item.answer === "myth"
                        ? "rgba(239,68,68,0.25)"
                        : "rgba(239,68,68,0.1)",
                    border:
                      isRevealed && item.answer === "myth"
                        ? "2px solid rgba(239,68,68,0.6)"
                        : "2px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    opacity: isRevealed && userAnswer === "myth" && !isCorrect ? 0.5 : 1,
                  }}
                >
                  {isRevealed && userAnswer === "myth" && isCorrect && (
                    <span>&#10003;</span>
                  )}
                  {isRevealed && userAnswer === "myth" && !isCorrect && (
                    <span>&#10007;</span>
                  )}
                  Myth
                </button>
              </div>

              {isRevealed && (
                <div
                  className="mt-3 ml-10 rounded-lg p-3 text-xs leading-relaxed"
                  style={{
                    background: isCorrect
                      ? "rgba(34,197,94,0.06)"
                      : "rgba(239,68,68,0.06)",
                    border: isCorrect
                      ? "1px solid rgba(34,197,94,0.15)"
                      : "1px solid rgba(239,68,68,0.15)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {!isCorrect && (
                    <div className="font-bold mb-1" style={{ color: "#ef4444" }}>
                      Incorrect &mdash; the answer is{" "}
                      <span className="uppercase">{item.answer}</span>.
                    </div>
                  )}
                  {isCorrect && (
                    <div className="font-bold mb-1" style={{ color: "#22c55e" }}>
                      Correct!
                    </div>
                  )}
                  {item.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {allAnswered && (
        <div
          className="mt-6 rounded-xl p-5 text-center"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <div className="text-3xl font-extrabold mb-1" style={{ color: "#f59e0b" }}>
            {correctCount}/{MYTH_FACT_QUIZ.length}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {scoreMessage()}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>
          Reflection &rarr;
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Reflection Notes                                         */
/* ------------------------------------------------------------------ */

function ReflectionStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleChange = (id: string, value: string) => {
    setSaved(false);
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Reflection"
        tagColor="#f59e0b"
        title="What Did You Learn?"
        desc="Take a moment to capture your key takeaways. These notes are for you."
      />

      <div className="flex flex-col gap-4">
        {REFLECTION_CATEGORIES.map((cat: ReflectionCategory) => (
          <Card key={cat.id}>
            <div
              className="flex items-center gap-2 mb-2.5"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-bold">{cat.label}</span>
            </div>
            <textarea
              value={notes[cat.id] ?? ""}
              onChange={(e) => handleChange(cat.id, e.target.value)}
              placeholder={cat.placeholder}
              className="w-full min-h-[100px] p-3 rounded-lg text-sm font-sans"
              style={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                resize: "vertical",
                outline: "none",
              }}
            />
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-5">
        <Btn primary onClick={handleSave}>
          Save Notes
        </Btn>
      </div>

      {saved && (
        <div
          className="mt-3 text-center text-sm font-semibold"
          style={{ color: "#22c55e" }}
        >
          Notes saved successfully!
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>
          Feedback &rarr;
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Feedback Collection                                      */
/* ------------------------------------------------------------------ */

function FeedbackStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [feedback, setFeedback] = useState<Record<string, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (id: string, value: number) => {
    setSubmitted(false);
    setFeedback((prev) => ({ ...prev, [id]: value }));
  };

  const handleText = (id: string, value: string) => {
    setSubmitted(false);
    setFeedback((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Feedback"
        tagColor="#f59e0b"
        title="Help Us Improve"
        desc="Your feedback shapes the next version of this course."
      />

      <div className="flex flex-col gap-4">
        {FEEDBACK_QUESTIONS.map((q) => (
          <Card key={q.id}>
            <div
              className="text-sm font-bold mb-2.5"
              style={{ color: "var(--text-primary)" }}
            >
              {q.label}
            </div>

            {q.type === "rating" && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const current = (feedback[q.id] as number) ?? 0;
                  const filled = star <= current;
                  return (
                    <button
                      key={star}
                      onClick={() => handleRating(q.id, star)}
                      className="text-xl cursor-pointer transition-all duration-150 bg-transparent border-none p-1"
                      style={{
                        color: filled ? "#f59e0b" : "var(--text-muted)",
                      }}
                      aria-label={`Rate ${star} out of 5`}
                    >
                      {filled ? "\u2605" : "\u2606"}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "text" && (
              <textarea
                value={(feedback[q.id] as string) ?? ""}
                onChange={(e) => handleText(q.id, e.target.value)}
                placeholder="Your thoughts..."
                className="w-full min-h-[100px] p-3 rounded-lg text-sm font-sans"
                style={{
                  background: "var(--bg-surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-5">
        <Btn primary onClick={handleSubmit}>
          Submit Feedback
        </Btn>
      </div>

      {submitted && (
        <div
          className="mt-3 text-center text-sm font-semibold"
          style={{ color: "#22c55e" }}
        >
          Thank you! Your feedback has been submitted.
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>
          Certificate &rarr;
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Certificate                                              */
/* ------------------------------------------------------------------ */

function CertificateStep({ onBack }: { onBack: () => void }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Congratulations!"
        tagColor="#f59e0b"
        title="Course Complete"
      />

      {/* Certificate Card */}
      <Card accent="245,158,11" style={{ padding: "40px 32px", textAlign: "center" as const }}>
        {/* Decorative top border */}
        <div
          className="mx-auto mb-5"
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
          }}
        />

        <div className="text-4xl mb-3">&#127891;</div>

        <div
          className="text-[10px] font-bold uppercase tracking-[4px] mb-4"
          style={{ color: "#f59e0b" }}
        >
          Certificate of Completion
        </div>

        <div
          className="text-2xl font-extrabold mb-1"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Kanban Fundamentals
        </div>

        <div
          className="text-xs mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Interactive Training Course
        </div>

        <div
          className="text-[11px] uppercase tracking-[2px] mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Awarded to
        </div>

        <div
          className="mx-auto mb-1"
          style={{
            width: "60%",
            borderBottom: "2px solid var(--border-subtle)",
            paddingBottom: 8,
          }}
        >
          <span
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Learner
          </span>
        </div>

        <div className="text-xs mt-5 mb-2" style={{ color: "var(--text-tertiary)" }}>
          {formattedDate}
        </div>

        <div
          className="text-xs font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Awarded by{" "}
          <span style={{ color: "#f59e0b" }}>Genius Teams</span>
        </div>

        {/* Decorative bottom border */}
        <div
          className="mx-auto mt-5"
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
          }}
        />
      </Card>

      {/* What's Next Card */}
      <Card style={{ marginTop: 20 }} accent="245,158,11">
        <div
          className="text-sm font-bold mb-3"
          style={{ color: "#fbbf24" }}
        >
          What&apos;s Next?
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            {
              icon: "\u2192",
              text: "Apply Kanban to your team\u2019s workflow",
            },
            {
              icon: "\u2192",
              text: "Join the WhatsApp learning community",
            },
            {
              icon: "\u2192",
              text: "Explore advanced Kanban practices",
            },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <span
                className="text-xs font-bold flex-shrink-0"
                style={{ color: "#f59e0b" }}
              >
                {item.icon}
              </span>
              <span
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Link href="/dashboard" className="no-underline">
          <Btn primary>Back to Dashboard</Btn>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                    */
/* ------------------------------------------------------------------ */

function SectionHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div
        className="w-2 h-10 rounded flex-shrink-0"
        style={{ background: "#f59e0b" }}
      />
      <div className="min-w-0">
        <div
          className="text-[10px] font-bold uppercase tracking-[3px]"
          style={{ color: "var(--text-dimmer)" }}
        >
          Section 6 &middot; Course Closing
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background:
              "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Course Wrap-Up &amp; Certification
        </h1>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function ClosingLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />

      {step === 0 && <MythFactStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <ReflectionStep
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <FeedbackStep
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && <CertificateStep onBack={() => setStep(2)} />}
    </>
  );
}
