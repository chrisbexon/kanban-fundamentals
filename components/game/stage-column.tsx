"use client";

import type { WorkItem, GameStage, WorkState } from "@/types/penny-game";
import { STATE_AFTER, TOTAL_ITEMS } from "@/lib/constants/penny-game";
import { Coin } from "./coin";

interface StageColumnProps {
  sc: GameStage;
  items: WorkItem[];
  wip: number | null;
  all: WorkItem[];
}

export function StageColumn({ sc, items, wip, all }: StageColumnProps) {
  const isW = sc.type === "work";
  const sid = sc.id as WorkState;
  const cc = isW ? items.filter((x) => x.wd[sid] >= x.wr[sid]).length : 0;
  const af = isW && items.length > 0 && cc === items.length;
  const ns = STATE_AFTER[sid as WorkState];
  const blocked = af && ns && ns !== "done" && all.filter((x) => x.state === ns).length > 0;

  return (
    <div
      className="min-w-[68px] rounded-xl p-3 pb-2.5 flex flex-col items-center gap-1.5 relative transition-all duration-300"
      style={{
        flex: sc.id === "backlog" || sc.id === "done" ? "1 1 88px" : "1 1 78px",
        background: isW ? "var(--bg-surface-raised)" : "var(--bg-surface)",
        border: blocked
          ? "1px solid rgba(239,68,68,0.35)"
          : isW
          ? `1px solid ${sc.color}15`
          : "1px solid var(--border-hairline)",
      }}
    >
      {wip !== null && (
        <div
          className="absolute -top-[11px] -right-[5px] text-white text-[8px] font-extrabold rounded-[7px] px-[7px] py-[2px] font-mono tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${sc.color}, ${sc.color}bb)`,
            boxShadow: `0 2px 8px ${sc.color}33`,
          }}
        >
          {wip}
        </div>
      )}
      <div className="text-center">
        <div className="text-[15px] mb-0.5 leading-none">{sc.icon}</div>
        <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: sc.color }}>
          {sc.label}
        </div>
      </div>
      <div className="text-[8px] font-mono font-semibold" style={{ color: "var(--text-coin-idle)" }}>
        {sc.id === "backlog"
          ? `${items.length} waiting`
          : sc.id === "done"
          ? `${items.length}/${TOTAL_ITEMS}`
          : isW && items.length
          ? `${cc}/${items.length} flipped`
          : isW
          ? "idle"
          : ""}
      </div>
      {blocked && (
        <div className="anim-pulse text-[7px] font-bold uppercase tracking-widest text-red-500 bg-red-500/[0.08] rounded px-[7px] py-[2px]">
          blocked &darr;
        </div>
      )}
      {isW && items.length > 0 && !af && cc > 0 && (
        <div className="text-[7px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/[0.06] rounded px-[7px] py-[2px]">
          flipping...
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 justify-center flex-1 content-start mt-1">
        {items.map((x) => (
          <Coin key={x.id} item={x} sc={sc} />
        ))}
      </div>
    </div>
  );
}
