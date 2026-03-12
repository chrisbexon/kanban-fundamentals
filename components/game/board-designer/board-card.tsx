"use client";

import React from "react";
import type { BoardWorkItem, ItemTypeDefinition, BoardSettings, RunMode } from "@/types/board";
import { itemAge } from "@/types/board";

interface BoardCardProps {
  item: BoardWorkItem;
  itemType: ItemTypeDefinition | undefined;
  currentDay: number;
  settings: BoardSettings;
  runMode: RunMode;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onTouchStart?: (itemId: string, e: React.TouchEvent) => void;
}

/** Continuous age color based on % of SLE target */
function ageBorderColor(age: number, sleDays: number): string {
  if (age <= 0) return "var(--border-faint)";
  const pct = age / sleDays;
  if (pct < 0.5) return "#22c55e";       // green: comfortable
  if (pct < 0.75) return "#f59e0b";      // amber: watch
  if (pct < 1.0) return "#f97316";       // orange: at risk
  return "#ef4444";                       // red: breaching SLE
}

export function BoardCard({ item, itemType, currentDay, settings, runMode, onDragStart, onTouchStart }: BoardCardProps) {
  const age = itemAge(item, currentDay);
  const isCommitted = item.commitDay !== null;
  const isDone = item.doneDay !== null;
  const color = itemType?.color ?? "#64748b";
  const cls = item.classOfService ?? "standard";
  const isAuto = runMode === "auto";

  const sleBreaching = isCommitted && !isDone && age >= settings.sleDays;
  const borderColor = isCommitted && !isDone
    ? ageBorderColor(age, settings.sleDays)
    : "var(--border-faint)";

  // Due date risk for regulatory items
  const daysUntilDue = item.dueDay !== null ? item.dueDay - currentDay : null;
  const dueAtRisk = daysUntilDue !== null && daysUntilDue <= 3 && !isDone;

  return (
    <div
      draggable={runMode === "manual"}
      onDragStart={(e) => onDragStart(e, item.id)}
      onTouchStart={onTouchStart ? (e) => onTouchStart(item.id, e) : undefined}
      className="rounded-lg overflow-hidden flex-shrink-0 transition-all hover:scale-[1.02]"
      style={{
        background: "var(--bg-surface)",
        border: `1.5px solid ${borderColor}`,
        boxShadow: sleBreaching ? `0 0 8px ${borderColor}40` : undefined,
        cursor: runMode === "manual" ? "grab" : "default",
      }}
    >
      {/* Colour strip */}
      <div style={{ height: 3, background: color }} />

      <div className="px-1.5 py-1">
        {/* Row 1: Type badge + ID + Class of service */}
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[9px]">{itemType?.icon ?? "\u{1F4E6}"}</span>
          <span className="text-[8px] font-bold font-mono uppercase" style={{ color }}>
            {item.id}
          </span>
          {/* Class of service badge */}
          {cls === "regulatory" && (
            <span className="text-[7px] font-bold px-1 rounded ml-auto"
              style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
              REG
            </span>
          )}
          {cls === "expedite" && (
            <span className="text-[7px] font-bold px-1 rounded ml-auto"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              EXP
            </span>
          )}
        </div>

        {/* Title */}
        <div className="text-[9px] font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
          {item.title}
        </div>

        {/* Work progress bar (auto mode, active items only) */}
        {isAuto && item.workTotal > 0 && !isDone && (
          <div className="mt-0.5 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deeper)" }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(5, ((item.workTotal - item.workRemaining) / item.workTotal) * 100)}%`,
                background: item.blocked ? "#ef4444" : color,
              }} />
          </div>
        )}

        {/* Age + due date */}
        {isCommitted && !isDone && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="text-[8px] font-mono font-bold px-0.5 rounded"
              style={{ color: borderColor, background: sleBreaching ? `${borderColor}12` : "transparent" }}>
              {age}d
            </div>
            {sleBreaching && (
              <span className="text-[7px] font-bold" style={{ color: "#ef4444" }}>SLE</span>
            )}
            {item.dueDay !== null && (
              <span className="text-[7px] font-bold ml-auto"
                style={{ color: dueAtRisk ? "#ef4444" : "var(--text-muted)" }}>
                Due d{item.dueDay}
              </span>
            )}
          </div>
        )}

        {/* Done indicator */}
        {isDone && (
          <div className="text-[8px] font-bold mt-0.5" style={{ color: "#22c55e" }}>
            &#x2713; {item.doneDay! - (item.commitDay ?? item.doneDay!)}d
          </div>
        )}

        {/* Blocked indicator */}
        {item.blocked && (
          <div className="text-[7px] font-bold mt-0.5 px-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            BLOCKED{isAuto && item.blockerEffort > 0 ? ` (${item.blockerEffort}d)` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
