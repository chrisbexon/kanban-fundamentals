"use client";

import type { WorkItem } from "@/types/penny-game";
import { STAGES, WORK_STATES } from "@/lib/constants/penny-game";
import { StageColumn } from "./stage-column";

interface GameBoardProps {
  items: WorkItem[];
  batchSize: number;
}

export function GameBoard({ items, batchSize }: GameBoardProps) {
  const getI = (sid: string) => items.filter((x) => x.state === sid);

  return (
    <div
      className="flex gap-1.5 mb-4 p-3 rounded-2xl overflow-x-auto min-h-[220px]"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", WebkitOverflowScrolling: "touch" }}
    >
      {STAGES.map((sc) => (
        <StageColumn
          key={sc.id}
          sc={sc}
          items={getI(sc.id)}
          wip={WORK_STATES.includes(sc.id as typeof WORK_STATES[number]) ? batchSize : null}
          all={items}
        />
      ))}
    </div>
  );
}
