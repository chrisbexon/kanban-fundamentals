"use client";

import type { RoundHistory } from "@/hooks/use-wip-game";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface RoundTransitionProps {
  completedRound: number;
  nextRound: number;
  roundHistory: RoundHistory;
  onStartNextRound: () => void;
}

const ROUND_BRIEFS: Record<number, { title: string; focus: string; instruction: string; tip?: string; color: string }> = {
  2: {
    title: "Round 2: Experiment with WIP Limits",
    focus: "WIP Limits",
    instruction:
      "You've seen how the board behaves with default limits. This time, try changing the WIP limits in the settings panel. Lower them, raise them, turn them off entirely. Watch what happens to cycle time and throughput. The same seed data means the only variable is your WIP limits.",
    tip: "If you lower a WIP limit below the current number of items in that stage, the column will show as over-limit. This is expected — you don't need to remove items. Simply stop pulling new work into that stage and let existing items flow out naturally until WIP drops to the new limit.",
    color: "#8b5cf6",
  },
  3: {
    title: "Round 3: Control Total Work Item Age",
    focus: "Total Work Item Age",
    instruction:
      "Forget individual WIP limits for a moment. This round, focus on the Total Age indicator on the board. Your goal: keep total work item age below the target. When total age rises, stop starting new work and focus on finishing what's in progress. This is the most advanced flow control technique — using age as your primary signal.",
    color: "#f59e0b",
  },
};

export function RoundTransition({ completedRound, nextRound, roundHistory, onStartNextRound }: RoundTransitionProps) {
  const brief = ROUND_BRIEFS[nextRound];
  if (!brief) return null;

  const doneItems = roundHistory.items.filter((it) => it.location === "done");
  const cycleTimeItems = doneItems.filter((it) => it.dayStarted && it.dayDone);
  const avgCycleTime = cycleTimeItems.length > 0
    ? cycleTimeItems.reduce((s, it) => s + (it.dayDone! - it.dayStarted!), 0) / cycleTimeItems.length
    : 0;

  return (
    <div className="fade-up max-w-[720px]">
      <div className="text-center mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[3px] mb-2" style={{ color: "var(--text-dimmer)" }}>
          Round {completedRound} Complete
        </div>
        <div className="text-2xl font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>
          {doneItems.length} items delivered
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Avg cycle time: {avgCycleTime.toFixed(1)} days
        </div>
      </div>

      <Card accent={brief.color.replace("#", "").match(/.{2}/g)!.map((h) => parseInt(h, 16)).join(",")}>
        <div className="text-sm font-bold mb-2" style={{ color: brief.color }}>{brief.title}</div>
        <div className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
          {brief.instruction}
        </div>
        {brief.tip && (
          <div
            className="text-[12px] leading-[1.7] mt-3 rounded-lg px-3 py-2.5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)", color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>Tip:</strong> {brief.tip}
          </div>
        )}
      </Card>

      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          Your charts from Round {completedRound} are preserved for comparison in the debrief.
        </div>
        <Btn primary onClick={onStartNextRound}>
          Start Round {nextRound} &rarr;
        </Btn>
      </div>
    </div>
  );
}
