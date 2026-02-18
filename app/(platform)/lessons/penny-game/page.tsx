"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { IntroStep } from "@/content/lesson-1-penny-game/intro";
import { GameStep } from "@/components/game/game-step";
import { DebriefStep } from "@/components/game/debrief-step";
import { QuizStep } from "@/components/game/quiz-step";
import { usePennyGame } from "@/hooks/use-penny-game";

const LABELS = ["Intro", "Simulation", "Debrief", "Quiz"];

export default function PennyGameLesson() {
  const [step, setStep] = useState(0);
  const game = usePennyGame();
  const canAdv = (t: number) => {
    if (t <= step) return true;
    if (t === 1) return true;
    if (t >= 2) return game.enough;
    return false;
  };

  return (
    <>
      <Header />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={canAdv(step + 1)} />

      {step === 0 && <IntroStep onNext={() => setStep(1)} />}

      {step === 1 && (
        <GameStep
          batchSize={game.batchSize}
          customBatch={game.customBatch}
          onCustomBatchChange={game.setCustomBatch}
          onSelectBatch={game.selectBatch}
          onCustomBatchApply={game.applyCustomBatch}
          items={game.items}
          tick={game.tick}
          running={game.running}
          speed={game.speed}
          onSpeedChange={game.setSpeed}
          onStep={game.step}
          onStart={game.handleStart}
          onPause={game.pause}
          onReset={game.reset}
          allDone={game.allDone}
          stats={game.stats}
          doneCount={game.doneCount}
          runs={game.runs}
          enough={game.enough}
          onClearRuns={game.clearRuns}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <DebriefStep
          runs={game.runs}
          snaps={game.snaps}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && <QuizStep onBack={() => setStep(2)} />}
    </>
  );
}
