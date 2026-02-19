"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { WipIntroStep } from "@/content/lesson-2-wip-limits/intro";
import { WipGameStep } from "@/components/game/wip/game-step";
import { WipDebriefStep } from "@/components/game/wip/debrief-step";
import { WipQuizStep } from "@/components/game/wip/quiz-step";
import { useWipGame } from "@/hooks/use-wip-game";

const LABELS = ["Intro", "Simulation", "Debrief", "Quiz"];

export default function WipLimitsLesson() {
  const [step, setStep] = useState(0);
  const game = useWipGame();

  const canAdv = (t: number) => {
    if (t <= step) return true;
    if (t === 1) return true;
    if (t >= 2) return game.gameOver;
    return false;
  };

  return (
    <>
      <WipHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={canAdv(step + 1)} />

      {step === 0 && <WipIntroStep onNext={() => setStep(1)} />}

      {step === 1 && (
        <WipGameStep
          items={game.items}
          workers={game.workers}
          day={game.day}
          phase={game.phase}
          settings={game.settings}
          roundNumber={game.roundNumber}
          wipCounts={game.wipCounts}
          doneCount={game.doneCount}
          selectedWorkerId={game.selectedWorkerId}
          assignedWorkerCount={game.assignedWorkerCount}
          lastResult={game.lastResult}
          events={game.events}
          gameOver={game.gameOver}
          onSelectWorker={game.selectWorker}
          onClickItem={game.clickItem}
          onUnassignWorker={game.unassignWorker}
          onResolve={game.resolveRound}
          onAcknowledge={game.acknowledgeRound}
          onPullItem={game.pullItem}
          onReorderBacklog={game.reorderBacklog}
          onUpdateSettings={game.updateSettings}
          onRestart={game.restart}
          onAcknowledgeEvent={game.acknowledgeEvent}
          onFinish={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <WipDebriefStep
          items={game.items}
          snapshots={game.snapshots}
          settings={game.settings}
          currentDay={game.day}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && <WipQuizStep onBack={() => setStep(2)} />}
    </>
  );
}

function WipHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div
        className="w-2 h-10 rounded flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #ef4444, #3b82f6, #22c55e, #8b5cf6)" }}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Kanban Training &middot; Lesson 2
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          WIP Limits &amp; Work Item Age
        </h1>
      </div>
    </div>
  );
}
