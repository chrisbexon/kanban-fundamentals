"use client";

import type { WipWorkItem, Worker, WipSettings, WorkColor } from "@/types/wip-game";
import { COLUMN_DEFS } from "@/lib/constants/wip-game";
import { stageWip, canAssign, canPullFinishedItem } from "@/lib/engine/wip-game";
import { BoardColumn } from "./board-column";

interface KanbanBoardProps {
  items: WipWorkItem[];
  workers: Worker[];
  day: number;
  settings: WipSettings;
  selectedWorkerId: string | null;
  onClickItem: (id: string) => void;
  onPullItem: (id: string) => void;
  onReorderBacklog: (itemId: string, dir: "up" | "down") => void;
  disabled: boolean;
}

export function KanbanBoard({
  items, workers, day, settings, selectedWorkerId,
  onClickItem, onPullItem, onReorderBacklog, disabled,
}: KanbanBoardProps) {
  // Compute which items are assignable if a worker is selected
  const assignableItemIds = new Set<string>();
  if (selectedWorkerId && !disabled) {
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (worker) {
      for (const item of items) {
        if (canAssign(items, item, worker, settings)) {
          assignableItemIds.add(item.id);
        }
      }
    }
  }

  // Compute which finished items can be manually pulled forward
  const pullableItemIds = new Set<string>();
  if (!disabled) {
    for (const item of items) {
      if ((item.location === "red-finished" || item.location === "blue-finished") &&
          canPullFinishedItem(items, item.id, settings)) {
        pullableItemIds.add(item.id);
      }
    }
  }

  // Compute WIP per color (shared across columns of the same color)
  const wipCounts: Record<WorkColor, number> = {
    red: stageWip(items, "red"),
    blue: stageWip(items, "blue"),
    green: stageWip(items, "green"),
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
      {COLUMN_DEFS.map((def) => {
        const colItems = items.filter((it) => it.location === def.location);
        // Sort backlog by priority, done by completion order
        if (def.location === "backlog") {
          // Keep backlog order as-is (user can reorder)
        } else if (def.location === "done") {
          colItems.sort((a, b) => (b.dayDone ?? 0) - (a.dayDone ?? 0));
        }

        return (
          <BoardColumn
            key={def.location}
            def={def}
            items={colItems}
            workers={workers}
            day={day}
            wipCount={def.wipColor ? wipCounts[def.wipColor] : undefined}
            wipLimit={def.wipColor ? settings.wipLimits[def.wipColor] : undefined}
            enforceWip={def.wipColor ? settings.enforceWip[def.wipColor] : undefined}
            onClickItem={onClickItem}
            assignableItemIds={disabled ? new Set() : assignableItemIds}
            pullableItemIds={pullableItemIds}
            onPullItem={onPullItem}
            onReorder={def.location === "backlog" && !disabled ? onReorderBacklog : undefined}
          />
        );
      })}
    </div>
  );
}
