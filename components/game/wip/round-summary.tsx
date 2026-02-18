"use client";

import type { RoundResult, Worker } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";
import { Card } from "@/components/ui/card";

interface RoundSummaryProps {
  result: RoundResult;
  workers: Worker[];
}

export function RoundSummary({ result, workers }: RoundSummaryProps) {
  const workerMap = new Map(workers.map((w) => [w.id, w]));

  return (
    <Card accent="139,92,246" style={{ marginBottom: 12 }}>
      <div className="text-sm font-bold text-violet-400 mb-2.5">
        Day {result.day} Summary
      </div>

      {/* Worker rolls */}
      {result.workerRolls.length > 0 && (
        <div className="mb-2">
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>Work Applied</div>
          <div className="flex flex-wrap gap-1.5">
            {result.workerRolls.map((roll, i) => {
              const worker = workerMap.get(roll.workerId);
              const color = worker ? STAGE_COLORS[worker.color] : "var(--text-tertiary)";
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                >
                  <span className="font-bold" style={{ color }}>{worker?.name ?? roll.workerId}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>&rarr;</span>
                  <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{roll.itemId}</span>
                  <span className="font-bold font-mono" style={{ color }}>+{roll.roll}</span>
                  {roll.crossTrained && (
                    <span className="text-[8px] text-amber-500 font-bold">XT</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events */}
      <div className="flex flex-wrap gap-3 text-xs">
        {result.itemsAdvanced.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-bold">Advanced:</span>
            <span style={{ color: "var(--text-secondary)" }}>{result.itemsAdvanced.join(", ")}</span>
          </div>
        )}
        {result.itemsPulled.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-blue-400 font-bold">Pulled:</span>
            <span style={{ color: "var(--text-secondary)" }}>{result.itemsPulled.join(", ")}</span>
          </div>
        )}
        {result.blockerApplied && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-bold">Blocked:</span>
            <span style={{ color: "var(--text-secondary)" }}>{result.blockerApplied}</span>
          </div>
        )}
        {result.blockerCleared.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-bold">Unblocked:</span>
            <span style={{ color: "var(--text-secondary)" }}>{result.blockerCleared.join(", ")}</span>
          </div>
        )}
        {result.throughput > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-bold">Completed:</span>
            <span style={{ color: "var(--text-secondary)" }}>{result.throughput} item{result.throughput > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
