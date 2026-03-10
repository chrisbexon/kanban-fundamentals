"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { LittlesLawIntro } from "@/content/lesson-3-littles-law/intro";
import { LittlesLawGameStep } from "@/components/game/littles-law/game-step";
import { LittlesLawDebrief } from "@/components/game/littles-law/debrief-step";
import { LittlesLawQuizStep } from "@/components/game/littles-law/quiz-step";
import { useLittlesLaw } from "@/hooks/use-littles-law";

const LABELS = ["Intro", "Simulation", "Debrief", "Quiz"];

export default function LittlesLawLesson() {
  const [step, setStep] = useState(0);
  const sim = useLittlesLaw();

  const canAdv = (t: number) => {
    if (t <= step) return true;
    if (t === 1) return true; // can always go to sim
    if (t >= 2) return sim.snapshot.totalDepartures >= 3; // need some data
    return false;
  };

  return (
    <>
      <LittlesLawHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={canAdv(step + 1)} />

      {step === 0 && <LittlesLawIntro onNext={() => setStep(1)} />}

      {step === 1 && (
        <LittlesLawGameStep
          state={sim.state}
          snapshot={sim.snapshot}
          onToggleRunning={sim.toggleRunning}
          onSetSpeed={sim.setSpeed}
          onUpdateSettings={sim.updateSettings}
          onReset={sim.reset}
          onFinish={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <LittlesLawDebrief
          state={sim.state}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && <LittlesLawQuizStep onBack={() => setStep(2)} />}
    </>
  );
}

function LittlesLawHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div
        className="w-2 h-10 rounded flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #f59e0b, #ef4444, #8b5cf6)" }}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Kanban Training &middot; Lesson 3
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Little&apos;s Law
        </h1>
      </div>
    </div>
  );
}
