"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { FlowMetricsIntroStep } from "@/content/lesson-5-flow-metrics/intro";
import { MonteCarloStep } from "@/components/game/flow/monte-carlo-step";
import { useFlowMetrics } from "@/hooks/use-flow-metrics";

const LABELS = ["Intro", "Monte Carlo"];

export default function FlowMetricsLesson() {
  const [step, setStep] = useState(0);
  const flow = useFlowMetrics();

  return (
    <>
      <FlowHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />

      {step === 0 && <FlowMetricsIntroStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <MonteCarloStep
          flow={flow}
          onBack={() => setStep(0)}
        />
      )}
    </>
  );
}

function FlowHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div
        className="w-2 h-10 rounded flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #ef4444, #8b5cf6, #3b82f6)" }}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Kanban Training &middot; Lesson 5
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Flow Metrics &amp; Forecasting
        </h1>
      </div>
    </div>
  );
}
