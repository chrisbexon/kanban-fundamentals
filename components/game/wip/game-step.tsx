"use client";

import { useState } from "react";
import type { WipWorkItem, Worker, WipSettings, DaySnapshot, RoundResult, GameEvent, RoundPhase, WorkColor } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { WorkerPool } from "./worker-pool";
import { KanbanBoard } from "./kanban-board";
import { RoundControls } from "./round-controls";
import { RoundSummary } from "./round-summary";
import { SettingsPanel } from "./settings-panel";
import { EventBanner } from "./event-banner";
import { LiveChartsPanel } from "./live-charts-panel";
import { TotalAgeIndicator } from "./total-age-indicator";

type ViewMode = "board" | "charts";

const ROUND_DESCRIPTIONS: Record<number, { tag: string; tagColor: string; title: string; desc: string }> = {
  1: {
    tag: "Round 1 \u2014 Free Play",
    tagColor: "#3b82f6",
    title: "Learn the Board",
    desc: "Assign workers, pull items, and resolve rounds. Get a feel for how work flows through the system.",
  },
  2: {
    tag: "Round 2 \u2014 WIP Limits",
    tagColor: "#8b5cf6",
    title: "Experiment with WIP Limits",
    desc: "Change the WIP limits in settings. Lower them and watch cycle times. Raise them and see what happens to flow.",
  },
  3: {
    tag: "Round 3 \u2014 Total Age",
    tagColor: "#f59e0b",
    title: "Control by Work Item Age",
    desc: "Keep total work item age below the target. Stop starting, start finishing.",
  },
};

/** Target total age for round 3 (sum of all active item ages) */
const TOTAL_AGE_TARGET = 60;

interface WipGameStepProps {
  items: WipWorkItem[];
  workers: Worker[];
  day: number;
  phase: RoundPhase;
  settings: WipSettings;
  snapshots: DaySnapshot[];
  roundNumber: number;
  wipCounts: Record<WorkColor, number>;
  doneCount: number;
  selectedWorkerId: string | null;
  assignedWorkerCount: number;
  lastResult: RoundResult | null;
  events: GameEvent[];
  gameOver: boolean;
  gameRound: number;
  totalAge: number;
  onSelectWorker: (id: string) => void;
  onClickItem: (id: string) => void;
  onUnassignWorker: (id: string) => void;
  onAssignWorkerToItem: (workerId: string, itemId: string) => void;
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
  items, workers, day, phase, settings, snapshots, roundNumber, wipCounts, doneCount,
  selectedWorkerId, assignedWorkerCount, lastResult, events, gameOver,
  gameRound, totalAge,
  onSelectWorker, onClickItem, onUnassignWorker, onAssignWorkerToItem, onResolve, onAcknowledge,
  onPullItem, onReorderBacklog, onUpdateSettings, onRestart, onAcknowledgeEvent, onFinish, onBack,
}: WipGameStepProps) {
  const unacknowledgedEvents = events.filter((e) => !e.acknowledged);
  const [view, setView] = useState<ViewMode>("board");

  const roundInfo = ROUND_DESCRIPTIONS[gameRound] ?? ROUND_DESCRIPTIONS[1];
  const settingsLocked = gameRound === 1; // Round 1: default limits, no changes

  return (
    <div className="fade-up">
      <StepHeader
        tag={roundInfo.tag}
        tagColor={roundInfo.tagColor}
        title={gameOver ? "Round Complete!" : roundInfo.title}
        desc={gameOver
          ? "Review your results, then continue."
          : `Day ${day} \u2014 ${roundInfo.desc}`}
      />

      {/* Unacknowledged events */}
      {unacknowledgedEvents.map((evt) => (
        <EventBanner key={evt.id} event={evt} onAcknowledge={() => onAcknowledgeEvent(evt.id)} />
      ))}

      {/* Total Age indicator for round 3 */}
      {gameRound === 3 && !gameOver && (
        <TotalAgeIndicator totalAge={totalAge} targetAge={TOTAL_AGE_TARGET} />
      )}

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
        <div
          className="pop-in rounded-[10px] py-2 px-3 text-center min-w-[70px]"
          style={{
            background: totalAge > 60 ? "rgba(239,68,68,0.06)" : totalAge > 40 ? "rgba(245,158,11,0.06)" : "rgba(59,130,246,0.06)",
            border: totalAge > 60 ? "1px solid rgba(239,68,68,0.12)" : totalAge > 40 ? "1px solid rgba(245,158,11,0.12)" : "1px solid rgba(59,130,246,0.12)",
          }}
        >
          <div
            className="text-lg font-extrabold font-mono"
            style={{ color: totalAge > 60 ? "#ef4444" : totalAge > 40 ? "#fbbf24" : "#60a5fa" }}
          >
            {totalAge}
          </div>
          <div className="text-[8px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>Total Age</div>
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
        onFinish={onFinish}
      />

      {/* Round result summary */}
      {lastResult && (
        <RoundSummary result={lastResult} workers={workers} />
      )}

      {/* View toggle: Board / Charts */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setView("board")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            background: view === "board" ? "rgba(59,130,246,0.15)" : "transparent",
            color: view === "board" ? "#60a5fa" : "var(--text-muted)",
            border: view === "board" ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-faint)",
          }}
        >
          Board
        </button>
        <button
          onClick={() => setView("charts")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            background: view === "charts" ? "rgba(139,92,246,0.15)" : "transparent",
            color: view === "charts" ? "#a78bfa" : "var(--text-muted)",
            border: view === "charts" ? "1px solid rgba(139,92,246,0.3)" : "1px solid var(--border-faint)",
          }}
        >
          Charts
        </button>
      </div>

      {view === "board" ? (
        <>
          {/* Settings + Worker pool side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 mb-3">
            <SettingsPanel
              settings={settings}
              onUpdate={onUpdateSettings}
              onRestart={onRestart}
              locked={settingsLocked}
            />
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
            onAssignWorkerToItem={onAssignWorkerToItem}
            disabled={phase !== "assign" || gameOver}
          />
        </>
      ) : (
        <LiveChartsPanel
          items={items}
          snapshots={snapshots}
          settings={settings}
          currentDay={day}
        />
      )}

      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}
