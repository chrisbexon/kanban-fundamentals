"use client";

import React from "react";
import type { BoardWorkItem, ItemTypeDefinition, BoardSettings } from "@/types/board";
import { itemAge } from "@/types/board";

interface BoardCardProps {
  item: BoardWorkItem;
  itemType: ItemTypeDefinition | undefined;
  currentDay: number;
  settings: BoardSettings;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
}

export function BoardCard({ item, itemType, currentDay, settings, onDragStart }: BoardCardProps) {
  const age = itemAge(item, currentDay);
  const isCommitted = item.commitDay !== null;
  const isDone = item.doneDay !== null;
  const color = itemType?.color ?? "#64748b";

  const ageWarning = isCommitted && !isDone && age >= settings.ageWarningDays;
  const ageCritical = isCommitted && !isDone && age >= settings.ageCriticalDays;
  const sleBreaching = isCommitted && !isDone && age >= settings.sleDays;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      className="rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
      style={{
        background: "var(--bg-surface)",
        border: ageCritical
          ? "1px solid rgba(239,68,68,0.5)"
          : ageWarning
            ? "1px solid rgba(245,158,11,0.4)"
            : "1px solid var(--border-faint)",
        boxShadow: sleBreaching ? "0 0 8px rgba(239,68,68,0.2)" : undefined,
      }}
    >
      {/* Colour strip */}
      <div style={{ height: 4, background: color }} />

      <div className="px-2 py-1.5">
        {/* Type badge + ID */}
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[10px]">{itemType?.icon ?? "\u{1F4E6}"}</span>
          <span className="text-[8px] font-bold font-mono uppercase" style={{ color }}>
            {item.id}
          </span>
        </div>

        {/* Title */}
        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
          {item.title}
        </div>

        {/* Age (only show for committed, non-done items) */}
        {isCommitted && !isDone && (
          <div className="flex items-center gap-1 mt-1">
            <div
              className="text-[8px] font-mono font-bold px-1 rounded"
              style={{
                color: ageCritical ? "#ef4444" : ageWarning ? "#f59e0b" : "var(--text-muted)",
                background: ageCritical ? "rgba(239,68,68,0.08)" : ageWarning ? "rgba(245,158,11,0.08)" : "transparent",
              }}
            >
              {age}d
            </div>
            {sleBreaching && (
              <span className="text-[7px] font-bold" style={{ color: "#ef4444" }}>SLE</span>
            )}
          </div>
        )}

        {/* Done indicator */}
        {isDone && (
          <div className="text-[8px] font-bold mt-1" style={{ color: "#22c55e" }}>
            &#x2713; {item.doneDay! - (item.commitDay ?? item.doneDay!)}d
          </div>
        )}

        {/* Blocked indicator */}
        {item.blocked && (
          <div className="text-[7px] font-bold mt-0.5 px-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            BLOCKED
          </div>
        )}
      </div>
    </div>
  );
}
