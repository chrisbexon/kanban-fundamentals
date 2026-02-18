"use client";

import type { WipWorkItem, Worker } from "@/types/wip-game";
import type { ColumnDef } from "@/lib/constants/wip-game";
import { WorkItemCard } from "./work-item-card";

interface BoardColumnProps {
  def: ColumnDef;
  items: WipWorkItem[];
  workers: Worker[];
  day: number;
  wipCount?: number;
  wipLimit?: number;
  enforceWip?: boolean;
  onClickItem?: (id: string) => void;
  assignableItemIds: Set<string>;
  onReorder?: (itemId: string, dir: "up" | "down") => void;
}

export function BoardColumn({
  def, items, workers, day, wipCount, wipLimit, enforceWip,
  onClickItem, assignableItemIds, onReorder,
}: BoardColumnProps) {
  const isOverWip = wipCount !== undefined && wipLimit !== undefined && enforceWip && wipCount > wipLimit;
  const isAtWip = wipCount !== undefined && wipLimit !== undefined && enforceWip && wipCount === wipLimit;
  const isBacklog = def.location === "backlog";
  const isDone = def.location === "done";

  return (
    <div
      className="flex flex-col rounded-xl min-w-[140px] flex-1"
      style={{
        background: "var(--bg-surface)",
        border: isOverWip
          ? "1px solid rgba(239,68,68,0.25)"
          : "1px solid var(--border-hairline)",
      }}
    >
      {/* Column header */}
      <div
        className="px-3 py-2 rounded-t-xl flex items-center justify-between"
        style={{
          background: `${def.color}08`,
          borderBottom: `2px solid ${def.color}30`,
        }}
      >
        <div>
          <div className="text-[10px] font-bold" style={{ color: def.color }}>
            {def.label}
          </div>
          <div className="text-[8px]" style={{ color: "var(--text-muted)" }}>{items.length} items</div>
        </div>
        {def.wipColor && wipLimit !== undefined && (
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
            {wipCount}/{wipLimit}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 p-2 flex-1 overflow-y-auto max-h-[400px]">
        {items.map((item, idx) => {
          const itemWorkers = workers.filter((w) => item.assignedWorkerIds.includes(w.id));
          const canClick = assignableItemIds.has(item.id);
          return (
            <div key={item.id} className="relative">
              {isBacklog && onReorder && (
                <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); onReorder(item.id, "up"); }}
                    className="w-4 h-4 rounded text-[8px] flex items-center justify-center border-none cursor-pointer"
                    style={{ background: "var(--bg-interactive)", color: idx > 0 ? "var(--text-secondary)" : "var(--text-faint)" }}
                    disabled={idx === 0}
                  >
                    &#9650;
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onReorder(item.id, "down"); }}
                    className="w-4 h-4 rounded text-[8px] flex items-center justify-center border-none cursor-pointer"
                    style={{ background: "var(--bg-interactive)", color: idx < items.length - 1 ? "var(--text-secondary)" : "var(--text-faint)" }}
                    disabled={idx === items.length - 1}
                  >
                    &#9660;
                  </button>
                </div>
              )}
              <div className={isBacklog ? "ml-4" : ""}>
                <WorkItemCard
                  item={item}
                  day={day}
                  assignedWorkers={itemWorkers}
                  onClick={canClick ? () => onClickItem?.(item.id) : undefined}
                  isAssignable={canClick}
                  compact={isDone}
                />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-[10px] text-center py-4 italic" style={{ color: "var(--text-faint)" }}>Empty</div>
        )}
      </div>
    </div>
  );
}
