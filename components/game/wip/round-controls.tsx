"use client";

import type { RoundPhase } from "@/types/wip-game";
import { SEED_DAYS, PLAYABLE_ROUNDS } from "@/lib/constants/wip-game";
import { Btn } from "@/components/ui/button";

interface RoundControlsProps {
  day: number;
  phase: RoundPhase;
  roundNumber: number;
  assignedWorkerCount: number;
  totalWorkers: number;
  gameOver: boolean;
  onResolve: () => void;
  onAcknowledge: () => void;
  onFinish: () => void;
}

export function RoundControls({
  day, phase, roundNumber, assignedWorkerCount, totalWorkers,
  gameOver, onResolve, onAcknowledge, onFinish,
}: RoundControlsProps) {
  const pct = Math.round(((day - SEED_DAYS) / PLAYABLE_ROUNDS) * 100);

  return (
    <div
      className="rounded-xl p-3.5 mb-3 flex items-center gap-4 flex-wrap"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      {/* Day counter */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-extrabold font-mono" style={{ color: "var(--text-primary)" }}>{day}</div>
          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Day</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{roundNumber}/{PLAYABLE_ROUNDS}</div>
          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Round</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1 min-w-[100px]">
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "var(--bg-progress-track)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #22c55e)",
            }}
          />
        </div>
        <div className="text-[8px] mt-1" style={{ color: "var(--text-muted)" }}>{pct}% complete</div>
      </div>

      {/* Phase indicator */}
      <div
        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: phase === "assign" ? "rgba(59,130,246,0.1)" : "rgba(139,92,246,0.1)",
          color: phase === "assign" ? "#60a5fa" : "#a78bfa",
          border: phase === "assign" ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(139,92,246,0.2)",
        }}
      >
        {phase === "assign" ? `Assign Workers (${assignedWorkerCount}/${totalWorkers})` : "Review Results"}
      </div>

      {/* Action button */}
      {gameOver ? (
        <Btn primary onClick={onFinish}>View Results &rarr;</Btn>
      ) : phase === "assign" ? (
        <Btn primary onClick={onResolve}>
          Resolve Day {day + 1} &rarr;
        </Btn>
      ) : (
        <Btn primary onClick={onAcknowledge}>
          Next Round &rarr;
        </Btn>
      )}
    </div>
  );
}
