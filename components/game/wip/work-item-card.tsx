"use client";

import type { WipWorkItem, Worker, WorkColor } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";

interface WorkItemCardProps {
  item: WipWorkItem;
  day: number;
  assignedWorkers: Worker[];
  onClick?: () => void;
  isAssignable?: boolean;
  compact?: boolean;
}

function WorkBarDisplay({ color, required, done }: { color: WorkColor; required: number; done: number }) {
  const pct = required > 0 ? Math.min((done / required) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="text-[8px] font-bold uppercase w-3 text-right"
        style={{ color: STAGE_COLORS[color] }}
      >
        {color[0].toUpperCase()}
      </div>
      <div
        className="flex-1 h-[6px] rounded-full overflow-hidden"
        style={{ background: "var(--bg-interactive)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${pct}%`,
            background: STAGE_COLORS[color],
            opacity: done >= required ? 1 : 0.7,
          }}
        />
      </div>
      <div className="text-[8px] font-mono w-8 text-right" style={{ color: "var(--text-tertiary)" }}>
        {done}/{required}
      </div>
    </div>
  );
}

export function WorkItemCard({ item, day, assignedWorkers, onClick, isAssignable, compact }: WorkItemCardProps) {
  const age = item.dayStarted ? day - item.dayStarted : 0;
  const isExpedite = item.class !== "standard";
  const overdue = item.dueDay !== null && day > item.dueDay && item.location !== "done";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-2.5 transition-all duration-200 ${
        isAssignable ? "cursor-pointer ring-1 ring-blue-500/30 hover:ring-blue-500/60" : "cursor-default"
      } ${item.blocked ? "anim-pulse" : ""}`}
      style={{
        background: item.blocked
          ? "rgba(245,158,11,0.06)"
          : isExpedite
          ? "rgba(168,85,247,0.06)"
          : "var(--bg-surface)",
        border: item.blocked
          ? "1px solid rgba(245,158,11,0.2)"
          : overdue
          ? "1px solid rgba(239,68,68,0.3)"
          : isExpedite
          ? "1px solid rgba(168,85,247,0.2)"
          : "1px solid var(--border-subtle)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold font-mono" style={{ color: "var(--text-secondary)" }}>{item.id}</span>
          {isExpedite && (
            <span
              className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{
                background: item.class === "security" ? "rgba(239,68,68,0.15)" : "rgba(168,85,247,0.15)",
                color: item.class === "security" ? "#f87171" : "#c084fc",
              }}
            >
              {item.class}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {item.blocked && (
            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
              Blocked
            </span>
          )}
          {item.dayStarted !== null && (
            <span
              className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
              style={{
                background: age > 12 ? "rgba(239,68,68,0.12)" : age > 8 ? "rgba(245,158,11,0.12)" : "var(--bg-interactive)",
                color: age > 12 ? "#f87171" : age > 8 ? "#fbbf24" : "var(--text-tertiary)",
              }}
            >
              {age}d
            </span>
          )}
        </div>
      </div>

      {/* Work bars */}
      {!compact && (
        <div className="flex flex-col gap-1">
          <WorkBarDisplay color="red" required={item.work.red.required} done={item.work.red.done} />
          <WorkBarDisplay color="blue" required={item.work.blue.required} done={item.work.blue.done} />
          <WorkBarDisplay color="green" required={item.work.green.required} done={item.work.green.done} />
        </div>
      )}

      {/* Blocker progress */}
      {item.blocked && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[8px] font-bold text-amber-400">UNBLOCK</span>
          <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(245,158,11,0.1)" }}>
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
              style={{ width: `${(item.blockerWork.done / item.blockerWork.required) * 100}%` }}
            />
          </div>
          <span className="text-[8px] font-mono text-amber-500">{item.blockerWork.done}/{item.blockerWork.required}</span>
        </div>
      )}

      {/* Assigned workers */}
      {assignedWorkers.length > 0 && (
        <div className="mt-1.5 flex gap-1">
          {assignedWorkers.map((w) => (
            <span
              key={w.id}
              className="text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${STAGE_COLORS[w.color]}20`, color: STAGE_COLORS[w.color] }}
            >
              {w.name}
            </span>
          ))}
        </div>
      )}

      {/* Due date */}
      {item.dueDay !== null && item.location !== "done" && (
        <div
          className="mt-1 text-[8px] font-bold"
          style={{ color: overdue ? "#ef4444" : day >= item.dueDay - 2 ? "#fbbf24" : "var(--text-tertiary)" }}
        >
          Due: Day {item.dueDay} {overdue && "(OVERDUE)"}
        </div>
      )}
    </button>
  );
}
