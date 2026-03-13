"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { WipIntroStep } from "@/content/lesson-2-wip-limits/intro";
import { WipGameStep } from "@/components/game/wip/game-step";
import { WipDebriefStep } from "@/components/game/wip/debrief-step";
import { WipQuizStep } from "@/components/game/wip/quiz-step";
import { RoundTransition } from "@/components/game/wip/round-transition";
import { useWipGame } from "@/hooks/use-wip-game";

// Steps: Intro, Round1, Transition1→2, Round2, Transition2→3, Round3, Debrief, Quiz
const LABELS = ["Intro", "Round 1", "Round 2", "Round 3", "Debrief", "Quiz"];

export default function WipLimitsLesson() {
  const [step, setStep] = useState(0);
  const game = useWipGame();

  // Map step index to what's shown
  // 0 = Intro
  // 1 = Round 1 game
  // 2 = Round 2 (transition shown when round 1 just ended, then game)
  // 3 = Round 3 (transition shown when round 2 just ended, then game)
  // 4 = Debrief
  // 5 = Quiz

  const canAdv = (target: number) => {
    if (target <= step) return true;
    if (target === 1) return true; // can always start round 1
    // Can advance past a round step only when that round's game is over
    if (target === 2) return game.gameRound >= 2 || (game.gameRound === 1 && game.gameOver);
    if (target === 3) return game.gameRound >= 3 || (game.gameRound === 2 && game.gameOver);
    if (target === 4) return game.gameRound === 3 && game.gameOver;
    if (target === 5) return game.gameRound === 3 && game.gameOver;
    return false;
  };

  // When a round finishes, the "Finish" button should show transition then start next round
  const handleRoundFinish = () => {
    if (game.gameRound < 3) {
      // Move to next step (which shows transition)
      setStep(step + 1);
    } else {
      // Final round done — go to debrief
      setStep(4);
    }
  };

  const handleStartNextRound = () => {
    game.startNextRound();
    // Stay on same step — the game component will now show the new round
  };

  // Determine if we should show a transition screen
  const showTransition = (targetRound: number) => {
    return game.gameRound < targetRound;
  };

  return (
    <>
      <WipHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={canAdv(step + 1)} />

      {step === 0 && <WipIntroStep onNext={() => setStep(1)} />}

      {/* Round 1 */}
      {step === 1 && (
        <WipGameStep
          items={game.items}
          workers={game.workers}
          day={game.day}
          phase={game.phase}
          settings={game.settings}
          snapshots={game.snapshots}
          roundNumber={game.roundNumber}
          wipCounts={game.wipCounts}
          doneCount={game.doneCount}
          selectedWorkerId={game.selectedWorkerId}
          assignedWorkerCount={game.assignedWorkerCount}
          lastResult={game.lastResult}
          events={game.events}
          gameOver={game.gameOver}
          gameRound={game.gameRound}
          totalAge={game.totalAge}
          onSelectWorker={game.selectWorker}
          onClickItem={game.clickItem}
          onUnassignWorker={game.unassignWorker}
          onAssignWorkerToItem={game.assignWorkerToItem}
          onResolve={game.resolveRound}
          onAcknowledge={game.acknowledgeRound}
          onPullItem={game.pullItem}
          onReorderBacklog={game.reorderBacklog}
          onUpdateSettings={game.updateSettings}
          onRestart={game.restart}
          onAcknowledgeEvent={game.acknowledgeEvent}
          onFinish={handleRoundFinish}
          onBack={() => setStep(0)}
        />
      )}

      {/* Round 2: transition or game */}
      {step === 2 && (
        showTransition(2) ? (
          <RoundTransition
            completedRound={1}
            nextRound={2}
            roundHistory={game.roundHistories[0] ?? { round: 1, items: game.items, snapshots: game.snapshots, settings: game.settings }}
            onStartNextRound={handleStartNextRound}
          />
        ) : (
          <WipGameStep
            items={game.items}
            workers={game.workers}
            day={game.day}
            phase={game.phase}
            settings={game.settings}
            snapshots={game.snapshots}
            roundNumber={game.roundNumber}
            wipCounts={game.wipCounts}
            doneCount={game.doneCount}
            selectedWorkerId={game.selectedWorkerId}
            assignedWorkerCount={game.assignedWorkerCount}
            lastResult={game.lastResult}
            events={game.events}
            gameOver={game.gameOver}
            gameRound={game.gameRound}
            totalAge={game.totalAge}
            onSelectWorker={game.selectWorker}
            onClickItem={game.clickItem}
            onUnassignWorker={game.unassignWorker}
            onAssignWorkerToItem={game.assignWorkerToItem}
            onResolve={game.resolveRound}
            onAcknowledge={game.acknowledgeRound}
            onPullItem={game.pullItem}
            onReorderBacklog={game.reorderBacklog}
            onUpdateSettings={game.updateSettings}
            onRestart={game.restart}
            onAcknowledgeEvent={game.acknowledgeEvent}
            onFinish={handleRoundFinish}
            onBack={() => setStep(1)}
          />
        )
      )}

      {/* Round 3: transition or game */}
      {step === 3 && (
        showTransition(3) ? (
          <RoundTransition
            completedRound={2}
            nextRound={3}
            roundHistory={game.roundHistories[1] ?? { round: 2, items: game.items, snapshots: game.snapshots, settings: game.settings }}
            onStartNextRound={handleStartNextRound}
          />
        ) : (
          <WipGameStep
            items={game.items}
            workers={game.workers}
            day={game.day}
            phase={game.phase}
            settings={game.settings}
            snapshots={game.snapshots}
            roundNumber={game.roundNumber}
            wipCounts={game.wipCounts}
            doneCount={game.doneCount}
            selectedWorkerId={game.selectedWorkerId}
            assignedWorkerCount={game.assignedWorkerCount}
            lastResult={game.lastResult}
            events={game.events}
            gameOver={game.gameOver}
            gameRound={game.gameRound}
            totalAge={game.totalAge}
            onSelectWorker={game.selectWorker}
            onClickItem={game.clickItem}
            onUnassignWorker={game.unassignWorker}
            onAssignWorkerToItem={game.assignWorkerToItem}
            onResolve={game.resolveRound}
            onAcknowledge={game.acknowledgeRound}
            onPullItem={game.pullItem}
            onReorderBacklog={game.reorderBacklog}
            onUpdateSettings={game.updateSettings}
            onRestart={game.restart}
            onAcknowledgeEvent={game.acknowledgeEvent}
            onFinish={handleRoundFinish}
            onBack={() => setStep(2)}
          />
        )
      )}

      {/* Debrief — gets data from all 3 rounds */}
      {step === 4 && (
        <WipDebriefStep
          items={game.allItems}
          snapshots={game.allSnapshots}
          settings={game.settings}
          currentDay={game.day}
          roundHistories={game.roundHistories}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && <WipQuizStep onBack={() => setStep(4)} />}
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
