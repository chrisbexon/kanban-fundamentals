"use client";

import type { WipWorkItem, Worker, WipSettings, RoundResult, GameEvent, RoundPhase, WorkColor } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { WorkerPool } from "./worker-pool";
import { KanbanBoard } from "./kanban-board";
import { RoundControls } from "./round-controls";
import { RoundSummary } from "./round-summary";
import { SettingsPanel } from "./settings-panel";
import { EventBanner } from "./event-banner";

interface WipGameStepProps {
  items: WipWorkItem[];
  workers: Worker[];
  day: number;
  phase: RoundPhase;
  settings: WipSettings;
  roundNumber: number;
  wipCounts: Record<WorkColor, number>;
  doneCount: number;
  selectedWorkerId: string | null;
  assignedWorkerCount: number;
  lastResult: RoundResult | null;
  events: GameEvent[];
  gameOver: boolean;
  onSelectWorker: (id: string) => void;
  onClickItem: (id: string) => void;
  onUnassignWorker: (id: string) => void;
  onResolve: () => void;
  onAcknowledge: () => void;
  onPullItem: (id: string) => void;
  onReorderBacklog: (id: string, dir: "up" | "down") => void;
  onUpdateSettings: (s: Partial<WipSettings>) => void;
  onRestart: () => void;
  onAcknowledgeEvent: (id: string) => void;
  onFinish: () => void;
  onBack: () => void;
}

export function WipGameStep({
  items, workers, day, phase, settings, roundNumber, wipCounts, doneCount,
  selectedWorkerId, assignedWorkerCount, lastResult, events, gameOver,
  onSelectWorker, onClickItem, onUnassignWorker, onResolve, onAcknowledge,
  onPullItem, onReorderBacklog, onUpdateSettings, onRestart, onAcknowledgeEvent, onFinish, onBack,
}: WipGameStepProps) {
  const unacknowledgedEvents = events.filter((e) => !e.acknowledged);

  return (
    <div className="fade-up">
      <StepHeader
        tag="Simulation"
        tagColor="#8b5cf6"
        title="WIP Limits & Work Item Age"
        desc={gameOver
          ? "Game complete! Review your results."
          : `Day ${day} \u2014 Assign workers to items, then resolve the round.`}
      />

      {/* Unacknowledged events */}
      {unacknowledgedEvents.map((evt) => (
        <EventBanner key={evt.id} event={evt} onAcknowledge={() => onAcknowledgeEvent(evt.id)} />
      ))}

      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        {([["red", "Red WIP"], ["blue", "Blue WIP"], ["green", "Green WIP"]] as [WorkColor, string][]).map(([color, label]) => (
          <div
            key={color}
            className="pop-in rounded-[10px] py-2 px-3 text-center min-w-[70px]"
            style={{
              background: `${STAGE_COLORS[color]}08`,
              border: wipCounts[color] > settings.wipLimits[color] && settings.enforceWip[color]
                ? `1px solid rgba(239,68,68,0.3)`
                : `1px solid ${STAGE_COLORS[color]}15`,
            }}
          >
            <div className="text-lg font-extrabold font-mono" style={{ color: STAGE_COLORS[color] }}>
              {wipCounts[color]}
            </div>
            <div className="text-[8px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
        <div className="pop-in rounded-[10px] py-2 px-3 text-center min-w-[70px]" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
          <div className="text-lg font-extrabold font-mono text-emerald-400">{doneCount}</div>
          <div className="text-[8px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>Done</div>
        </div>
      </div>

      {/* Round controls */}
      <RoundControls
        day={day}
        phase={phase}
        roundNumber={roundNumber}
        assignedWorkerCount={assignedWorkerCount}
        totalWorkers={workers.length}
        gameOver={gameOver}
        onResolve={onResolve}
        onAcknowledge={onAcknowledge}
        onFinish={onFinish}
      />

      {/* Round result summary */}
      {phase === "resolve" && lastResult && (
        <RoundSummary result={lastResult} workers={workers} />
      )}

      {/* Settings + Worker pool side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 mb-3">
        <SettingsPanel settings={settings} onUpdate={onUpdateSettings} onRestart={onRestart} />
        <WorkerPool
          workers={workers}
          selectedWorkerId={selectedWorkerId}
          onSelectWorker={onSelectWorker}
          onUnassignWorker={onUnassignWorker}
          disabled={phase !== "assign" || gameOver}
        />
      </div>

      {/* Kanban board */}
      <KanbanBoard
        items={items}
        workers={workers}
        day={day}
        settings={settings}
        selectedWorkerId={phase === "assign" && !gameOver ? selectedWorkerId : null}
        onClickItem={onClickItem}
        onPullItem={onPullItem}
        onReorderBacklog={onReorderBacklog}
        disabled={phase !== "assign" || gameOver}
      />

      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
      </div>
    </div>
  );
}
