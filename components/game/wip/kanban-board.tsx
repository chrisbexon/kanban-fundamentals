"use client";

import type { WipWorkItem, Worker, WipSettings, WorkColor } from "@/types/wip-game";
import { COLUMN_DEFS, STAGE_COLORS } from "@/lib/constants/wip-game";
import { stageWip, canAssign, canPullFinishedItem, canPullBacklogItem } from "@/lib/engine/wip-game";
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
  onAssignWorkerToItem: (workerId: string, itemId: string) => void;
  disabled: boolean;
}

/** Column group with a shared WIP header */
interface ColumnGroup {
  color: WorkColor;
  label: string;
  locations: string[];
}

const COLUMN_GROUPS: ColumnGroup[] = [
  { color: "red", label: "Red", locations: ["red-active", "red-finished"] },
  { color: "blue", label: "Blue", locations: ["blue-active", "blue-finished"] },
  { color: "green", label: "Green", locations: ["green"] },
];

function WipGroupHeader({
  color,
  label,
  wipCount,
  wipLimit,
  enforceWip,
}: {
  color: WorkColor;
  label: string;
  wipCount: number;
  wipLimit: number;
  enforceWip: boolean;
}) {
  const isOverWip = enforceWip && wipCount > wipLimit;
  const isAtWip = enforceWip && wipCount === wipLimit;
  const stageColor = STAGE_COLORS[color];

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 rounded-t-xl"
      style={{
        background: isOverWip
          ? "rgba(239,68,68,0.08)"
          : `${stageColor}08`,
        borderBottom: isOverWip
          ? "2px solid rgba(239,68,68,0.3)"
          : `2px solid ${stageColor}25`,
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: stageColor }}>
        {label}
      </div>
      <div
        className="text-[10px] font-bold font-mono px-2 py-0.5 rounded"
        style={{
          background: isOverWip
            ? "rgba(239,68,68,0.15)"
            : isAtWip
            ? "rgba(245,158,11,0.15)"
            : "var(--bg-interactive)",
          color: isOverWip ? "#ef4444" : isAtWip ? "#fbbf24" : "var(--text-tertiary)",
        }}
      >
        WIP {wipCount}/{wipLimit}
      </div>
    </div>
  );
}

export function KanbanBoard({
  items, workers, day, settings, selectedWorkerId,
  onClickItem, onPullItem, onReorderBacklog, onAssignWorkerToItem, disabled,
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

  // Compute which items can be manually pulled forward
  const pullableItemIds = new Set<string>();
  if (!disabled) {
    const backlogPullable = canPullBacklogItem(items, settings);
    for (const item of items) {
      if (item.location === "backlog" && backlogPullable) {
        pullableItemIds.add(item.id);
      } else if ((item.location === "red-finished" || item.location === "blue-finished") &&
          canPullFinishedItem(items, item.id, settings)) {
        pullableItemIds.add(item.id);
      }
    }
  }

  // Compute WIP per color
  const wipCounts: Record<WorkColor, number> = {
    red: stageWip(items, "red"),
    blue: stageWip(items, "blue"),
    green: stageWip(items, "green"),
  };

  // Backlog column def
  const backlogDef = COLUMN_DEFS.find((c) => c.location === "backlog")!;
  const doneDef = COLUMN_DEFS.find((c) => c.location === "done")!;
  const backlogItems = items.filter((it) => it.location === "backlog");
  const doneItems = items.filter((it) => it.location === "done").sort((a, b) => (b.dayDone ?? 0) - (a.dayDone ?? 0));

  const sharedColumnProps = {
    workers,
    day,
    sleDays: settings.sleDays,
    onClickItem,
    assignableItemIds: disabled ? new Set<string>() : assignableItemIds,
    pullableItemIds,
    onPullItem,
    onAssignWorkerToItem: !disabled ? onAssignWorkerToItem : undefined,
  };

  // Width ratios: backlog=1, red(2 cols)=2, blue(2 cols)=2, green(1 col)=1, done=1
  const GROUP_FLEX: Record<WorkColor, number> = { red: 2, blue: 2, green: 1 };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
      {/* Backlog — standalone, flex 1 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <BoardColumn
          def={backlogDef}
          items={backlogItems}
          onReorder={!disabled ? onReorderBacklog : undefined}
          {...sharedColumnProps}
        />
      </div>

      {/* Color groups with shared WIP headers */}
      {COLUMN_GROUPS.map((group) => {
        const isOverWip = settings.enforceWip[group.color] && wipCounts[group.color] > settings.wipLimits[group.color];
        return (
          <div
            key={group.color}
            className="flex flex-col rounded-xl"
            style={{
              flex: GROUP_FLEX[group.color],
              minWidth: 0,
              border: isOverWip
                ? "1px solid rgba(239,68,68,0.25)"
                : "1px solid var(--border-hairline)",
              background: "var(--bg-surface)",
            }}
          >
            <WipGroupHeader
              color={group.color}
              label={group.label}
              wipCount={wipCounts[group.color]}
              wipLimit={settings.wipLimits[group.color]}
              enforceWip={settings.enforceWip[group.color]}
            />
            <div className="flex gap-0 flex-1">
              {group.locations.map((loc) => {
                const def = COLUMN_DEFS.find((c) => c.location === loc)!;
                const colItems = items.filter((it) => it.location === loc);
                return (
                  <BoardColumn
                    key={loc}
                    def={def}
                    items={colItems}
                    grouped
                    {...sharedColumnProps}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Done — standalone, flex 1 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <BoardColumn
          def={doneDef}
          items={doneItems}
          {...sharedColumnProps}
        />
      </div>
    </div>
  );
}
