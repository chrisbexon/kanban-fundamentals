"use client";

import type { Worker } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";

interface WorkerTokenProps {
  worker: Worker;
  selected: boolean;
  onClick: () => void;
  onUnassign?: () => void;
}

export function WorkerToken({ worker, selected, onClick, onUnassign }: WorkerTokenProps) {
  const color = STAGE_COLORS[worker.color];
  const assigned = worker.assignedItemId !== null;

  return (
    <button
      onClick={assigned && onUnassign ? onUnassign : onClick}
      className={`relative flex items-center gap-2 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
        selected ? "ring-2 ring-white/40 scale-105" : ""
      }`}
      style={{
        background: assigned ? `${color}15` : selected ? `${color}20` : "var(--bg-surface)",
        border: assigned
          ? `2px solid ${color}40`
          : selected
          ? `2px solid ${color}80`
          : "2px solid var(--border-subtle)",
        opacity: assigned ? 0.7 : 1,
      }}
    >
      {/* Meeple icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
        style={{ background: `${color}25`, color }}
      >
        &#9823;
      </div>
      <div className="text-left">
        <div className="text-[10px] font-bold" style={{ color }}>{worker.name}</div>
        <div className="text-[8px]" style={{ color: "var(--text-tertiary)" }}>
          {assigned ? `→ ${worker.assignedItemId}` : selected ? "Click item" : "Available"}
        </div>
      </div>
      {assigned && onUnassign && (
        <span className="text-[8px] ml-1" style={{ color: "var(--text-muted)" }}>&times;</span>
      )}
    </button>
  );
}
