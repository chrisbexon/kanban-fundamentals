"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { QUIZ } from "@/content/lesson-pull-vs-push/config";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface QuizStepProps {
  onBack: () => void;
}

export function PullPushQuizStep({ onBack }: QuizStepProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleAnswer = (qId: number, optIdx: number) => {
    if (revealed[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  const totalAnswered = Object.keys(revealed).length;
  const totalCorrect = QUIZ.filter((q) => answers[q.id] === q.ans).length;
  const allDone = totalAnswered === QUIZ.length;

  return (
    <div className="fade-up max-w-[720px]">
      <StepHeader
        tag="Quiz"
        tagColor="#3b82f6"
        title="Check Your Understanding"
        desc="Five questions on push and pull systems."
      />

      <div className="flex flex-col gap-4">
        {QUIZ.map((q) => {
          const picked = answers[q.id];
          const show = revealed[q.id];
          const correct = picked === q.ans;

          return (
            <Card key={q.id}>
              <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                {q.id}. {q.q}
              </div>
              <div className="flex flex-col gap-1.5">
                {q.opts.map((opt, i) => {
                  const isSelected = picked === i;
                  const isCorrectAnswer = q.ans === i;

                  let bg = "transparent";
                  let border = "1px solid var(--border-subtle)";
                  let fg = "var(--text-secondary)";

                  if (show) {
                    if (isCorrectAnswer) {
                      bg = "rgba(34,197,94,0.08)";
                      border = "1px solid rgba(34,197,94,0.3)";
                      fg = "#22c55e";
                    } else if (isSelected && !correct) {
                      bg = "rgba(239,68,68,0.08)";
                      border = "1px solid rgba(239,68,68,0.3)";
                      fg = "#ef4444";
                    }
                  } else if (isSelected) {
                    bg = "rgba(59,130,246,0.08)";
                    border = "1px solid rgba(59,130,246,0.3)";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(q.id, i)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                      style={{ background: bg, border, color: fg }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {show && (
                <div
                  className="mt-2.5 text-xs leading-relaxed px-3 py-2 rounded-lg"
                  style={{
                    background: correct ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {q.exp}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {allDone && (
        <Card accent="59,130,246">
          <div className="text-center">
            <div className="text-2xl font-extrabold font-mono text-blue-400 mb-1">{totalCorrect}/{QUIZ.length}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {totalCorrect === QUIZ.length
                ? "Perfect score! You understand pull systems."
                : totalCorrect >= 3
                ? "Good work! Review the explanations for any you missed."
                : "Review the key insights and try again."}
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Key Insights</Btn>
        {allDone && totalCorrect >= 3 && (
          <Link href="/dashboard" className="no-underline">
            <Btn primary>Back to Dashboard &rarr;</Btn>
          </Link>
        )}
      </div>
    </div>
  );
}
