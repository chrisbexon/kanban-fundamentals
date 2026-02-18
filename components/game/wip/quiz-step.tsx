"use client";

import { useState } from "react";
import { QUIZ } from "@/content/lesson-2-wip-limits/config";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";

interface WipQuizStepProps {
  onBack: () => void;
}

export function WipQuizStep({ onBack }: WipQuizStepProps) {
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
        tagColor="#8b5cf6"
        title="Quiz: WIP Limits & Work Item Age"
        desc="Test your understanding. You need 80% to pass."
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
                background: done ? (ok ? "rgba(34,197,94,0.04)" : bad ? "rgba(239,68,68,0.04)" : "var(--bg-surface)") : "var(--bg-surface)",
                border: done ? (ok ? "1px solid rgba(34,197,94,0.2)" : bad ? "1px solid rgba(239,68,68,0.2)" : "1px solid var(--border-faint)") : "1px solid var(--border-faint)",
                animationDelay: `${qi * 80}ms`,
              }}
            >
              <div className="text-sm font-bold mb-3.5 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                <span className="mr-2 font-mono" style={{ color: "var(--text-muted)" }}>{qi + 1}.</span>
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
                        border: showOk ? "2px solid #22c55e" : showBad ? "2px solid #ef4444" : isSel ? "2px solid #3b82f6" : "2px solid var(--border-subtle)",
                        background: showOk ? "rgba(34,197,94,0.06)" : showBad ? "rgba(239,68,68,0.06)" : isSel ? "rgba(59,130,246,0.06)" : "transparent",
                        color: showOk ? "#6ee7b7" : showBad ? "#fca5a5" : isSel ? "#93c5fd" : "var(--text-quiz-option)",
                        fontWeight: isSel ? 600 : 400,
                        cursor: done ? "default" : "pointer",
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full mr-3 flex-shrink-0 text-[10px] font-bold font-mono align-middle"
                        style={{
                          background: showOk ? "#22c55e" : showBad ? "#ef4444" : isSel ? "#3b82f6" : "var(--bg-quiz-circle)",
                          color: isSel || showOk || showBad ? "#fff" : "var(--text-coin-idle)",
                          border: !isSel && !showOk && !showBad ? "2px solid var(--border-coin-idle)" : "none",
                        }}
                      >
                        {showOk ? "\u2713" : showBad ? "\u2717" : String.fromCharCode(65 + oi)}
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
                    background: ok ? "rgba(34,197,94,0.04)" : "rgba(59,130,246,0.04)",
                    border: ok ? "1px solid rgba(34,197,94,0.08)" : "1px solid rgba(59,130,246,0.08)",
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
          <Btn onClick={onBack}>&larr; Debrief</Btn>
          <Btn primary onClick={() => setDone(true)} disabled={!allA}>
            {allA ? "Submit Answers" : `Answer all ${QUIZ.length} questions`}
          </Btn>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="pop-in rounded-2xl py-6 px-7 text-center"
            style={{
              background: pass ? "rgba(34,197,94,0.05)" : "rgba(245,158,11,0.05)",
              border: pass ? "1px solid rgba(34,197,94,0.18)" : "1px solid rgba(245,158,11,0.18)",
            }}
          >
            <div className="text-[52px] font-extrabold font-mono leading-none" style={{ color: pass ? "#34d399" : "#fbbf24" }}>
              {pct}%
            </div>
            <div className="text-base font-bold mt-1.5 mb-2" style={{ color: pass ? "#34d399" : "#fbbf24" }}>
              {pass ? "Lesson Complete!" : "Almost There"}
            </div>
            <div className="text-[13px] leading-relaxed max-w-[400px] mx-auto" style={{ color: "var(--text-quiz-option)" }}>
              {pass
                ? `You scored ${score}/${QUIZ.length}. Strong understanding of WIP limits, work item age, and flow metrics.`
                : `You scored ${score}/${QUIZ.length}. Review the explanations above and try again \u2014 80% needed.`}
            </div>
            {!pass && (
              <button
                onClick={() => { setAns({}); setDone(false); }}
                className="mt-4 py-2.5 px-6 rounded-[10px] border-none text-white font-bold text-sm cursor-pointer"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 4px 12px rgba(239,68,68,0.15)" }}
              >
                Retry Quiz
              </button>
            )}
          </div>
          <div className="flex justify-between mt-[18px] flex-wrap gap-2.5">
            <Btn onClick={onBack}>&larr; Debrief</Btn>
            {pass && <Btn primary disabled>Next Lesson: Little&apos;s Law &rarr;</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}
