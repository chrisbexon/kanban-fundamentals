"use client";

import type { WorkItem, SimulationRun } from "@/types/penny-game";
import type { RunStats } from "@/types/penny-game";
import { STAGES, WORK_STATES, TOTAL_ITEMS } from "@/lib/constants/penny-game";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { GameBoard } from "./game-board";
import { GameControls } from "./game-controls";

interface GameStepProps {
  batchSize: number;
  customBatch: string;
  onCustomBatchChange: (v: string) => void;
  onSelectBatch: (bs: number) => void;
  onCustomBatchApply: () => void;
  items: WorkItem[];
  tick: number;
  running: boolean;
  speed: number;
  onSpeedChange: (spd: number) => void;
  onStep: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  allDone: boolean;
  stats: RunStats | null;
  doneCount: number;
  runs: SimulationRun[];
  enough: boolean;
  onClearRuns: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function GameStep({
  batchSize, customBatch, onCustomBatchChange, onSelectBatch, onCustomBatchApply,
  items, tick, running, speed, onSpeedChange, onStep, onStart, onPause, onReset,
  allDone, stats, doneCount, runs, enough, onClearRuns, onNext, onBack,
}: GameStepProps) {
  const bnSt = (() => {
    let mx = 0;
    let bn: string | null = null;
    for (const s of WORK_STATES) {
      const r = items.filter((x) => x.state === s).reduce((sm, x) => sm + Math.max(0, x.wr[s] - x.wd[s]), 0);
      if (r > mx) { mx = r; bn = s; }
    }
    return STAGES.find((s) => s.id === bn);
  })();

  const statCards: { l: string; v: string | number; a?: boolean; g?: boolean; w?: boolean }[] = [
    { l: "Tick", v: tick },
    { l: "Batch", v: batchSize, a: true },
    { l: "Done", v: `${doneCount}/${TOTAL_ITEMS}`, g: allDone },
    ...(stats ? [
      { l: "1st Item", v: stats.first },
      { l: "Avg Cycle", v: stats.ac },
      { l: "Avg Wait", v: stats.aw },
    ] : []),
    ...(bnSt && tick > 0 && !allDone ? [{ l: "Bottleneck", v: `${bnSt.icon} ${bnSt.label}`, w: true }] : []),
  ];

  return (
    <div className="fade-up">
      <StepHeader
        tag="Simulation"
        tagColor="#3b82f6"
        title="Run the Penny Game"
        desc={enough
          ? "You've run multiple simulations. Run more or continue to analyse your results."
          : "Run at least 2 simulations with different batch sizes to compare."}
      />

      <GameControls
        batchSize={batchSize}
        onSelectBatch={onSelectBatch}
        customBatch={customBatch}
        onCustomBatchChange={onCustomBatchChange}
        onCustomBatchApply={onCustomBatchApply}
        running={running}
        allDone={allDone}
        tick={tick}
        speed={speed}
        onSpeedChange={onSpeedChange}
        onStep={onStep}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
      />

      {/* Progress bar */}
      <div className="h-[3px] rounded-sm mb-3.5 overflow-hidden" style={{ background: "var(--bg-progress-track)" }}>
        <div
          className="h-full rounded-sm transition-[width] duration-350 ease-out"
          style={{ width: `${(doneCount / TOTAL_ITEMS) * 100}%`, background: "linear-gradient(90deg, #f59e0b, #3b82f6, #10b981, #22c55e)" }}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-3.5">
        {statCards.map((s, i) => (
          <div
            key={i}
            className={`pop-in rounded-[10px] py-2.5 px-3.5 text-center min-w-[80px] ${s.g ? "anim-glow" : ""}`}
            style={{
              background: s.w ? "rgba(245,158,11,0.06)" : s.a ? "rgba(59,130,246,0.06)" : "var(--bg-surface)",
              border: s.w ? "1px solid rgba(245,158,11,0.12)" : s.a ? "1px solid rgba(59,130,246,0.12)" : "1px solid var(--border-hairline)",
              animationDelay: `${i * 50}ms`,
            }}
          >
            <div
              className="text-xl font-extrabold font-mono leading-none"
              style={{ color: s.g ? "#34d399" : s.w ? "#fbbf24" : s.a ? "#60a5fa" : "var(--text-primary)" }}
            >
              {s.v}
            </div>
            <div className="text-[8px] uppercase tracking-wider mt-1 font-bold" style={{ color: "var(--text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <GameBoard items={items} batchSize={batchSize} />

      {/* Finished notification */}
      {allDone && tick > 0 && (
        <Card accent="34,197,94" style={{ marginBottom: 16 }}>
          <div className="text-sm font-bold text-emerald-400 mb-1">
            {"\u2713"} Batch {batchSize} complete &mdash; {tick} ticks
          </div>
          <div className="text-[13px] text-emerald-300 leading-relaxed">
            {batchSize >= 10
              ? "Try a smaller batch to see the difference."
              : batchSize > 1
              ? "Try single-piece flow (batch 1) for the ultimate comparison."
              : "Single-piece flow \u2014 peak flow."}
          </div>
        </Card>
      )}

      {/* Run comparison table */}
      {runs.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] mb-2.5 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            Run Comparison
          </div>
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <table className="w-full border-collapse text-xs font-mono min-w-[460px]">
              <thead>
                <tr className="text-[8px] uppercase tracking-wider" style={{ color: "var(--text-coin-idle)" }}>
                  {["Batch", "1st Item", "All Done", "Avg Cycle", "Avg Wait", "Bottleneck"].map((h, i) => (
                    <th key={h} className="py-1.5 px-2 font-bold" style={{ textAlign: i === 0 ? "left" : "right" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((r, i) => {
                  const si = STAGES.find((s) => s.id === r.bn);
                  const bf = Math.min(...runs.map((x) => x.first));
                  const ba = Math.min(...runs.map((x) => x.all || Infinity));
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--border-hairline)" }}>
                      <td className="py-2.5 px-2 font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{r.bs}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: r.first === bf && runs.length > 1 ? "#34d399" : "var(--text-tertiary)", fontWeight: r.first === bf && runs.length > 1 ? 700 : 400 }}>{r.first}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: r.all === ba && runs.length > 1 ? "#34d399" : "var(--text-tertiary)", fontWeight: r.all === ba && runs.length > 1 ? 700 : 400 }}>{r.all}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: "var(--text-tertiary)" }}>{r.ac}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: "var(--text-tertiary)" }}>{r.aw}</td>
                      <td className="py-2.5 px-2 text-right font-semibold" style={{ color: si?.color }}>{si?.icon} {si?.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {runs.length >= 2 && (() => {
            const sr = [...runs].sort((a, b) => a.first - b.first);
            const f = sr[0], sl = sr[sr.length - 1];
            const pct = sl.first > 0 ? Math.round(((sl.first - f.first) / sl.first) * 100) : 0;
            return (
              <div className="mt-3 py-2.5 px-4 rounded-[10px] text-xs text-emerald-300 leading-relaxed" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                <strong>Insight:</strong> Batch {f.bs} delivered the first item <strong>{pct}% faster</strong> than batch {sl.bs}. Smaller batches pull work through, adapting to bottlenecks naturally.
              </div>
            );
          })()}

          <button
            onClick={onClearRuns}
            className="mt-2.5 py-1 px-3 rounded-md border bg-transparent text-[9px] cursor-pointer font-semibold"
            style={{ borderColor: "var(--border-faint)", color: "var(--text-muted)" }}
          >
            Clear runs
          </button>
        </Card>
      )}

      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onNext} disabled={!enough}>
          {enough ? "Analyse Results \u2192" : `Run ${2 - runs.length} more to continue`}
        </Btn>
      </div>
    </div>
  );
}
