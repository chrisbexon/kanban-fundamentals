"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Btn } from "@/components/ui/button";

/* ── Types ── */
interface WorkItem {
  id: number;
  column: number;      // 0=backlog, 1=analysis, 2=dev, 3=test, 4=done
  progress: number;    // 0-100
  age: number;         // ticks in system
  quality: number;     // 0-100 (push items degrade)
  rework: boolean;     // bounced back
  blocked: boolean;
}

interface SystemState {
  items: WorkItem[];
  nextId: number;
  tick: number;
  done: number;
  totalCycleTime: number;
  reworkCount: number;
  maxQueueSeen: number;
}

const COLUMNS = ["Backlog", "Analysis", "Dev", "Test", "Done"];
const WORK_REQUIRED = [0, 30, 50, 25, 0]; // progress needed per column
const WIP_LIMITS = [Infinity, 2, 3, 2, Infinity]; // pull system limits

function createSystem(): SystemState {
  const items: WorkItem[] = [];
  for (let i = 0; i < 6; i++) {
    items.push({ id: i + 1, column: 0, progress: 0, age: 0, quality: 100, rework: false, blocked: false });
  }
  return { items, nextId: 7, tick: 0, done: 0, totalCycleTime: 0, reworkCount: 0, maxQueueSeen: 0 };
}

function countInColumn(items: WorkItem[], col: number): number {
  return items.filter(i => i.column === col).length;
}

/* ── Push tick: move everything forward regardless ── */
function pushTick(state: SystemState): SystemState {
  const items = state.items.map(i => ({ ...i }));
  let { nextId, done, totalCycleTime, reworkCount, maxQueueSeen } = state;

  // Age all active items
  items.forEach(i => { if (i.column > 0 && i.column < 4) i.age++; });

  // Work on items (spread thin — less progress when overloaded)
  for (let col = 1; col <= 3; col++) {
    const inCol = items.filter(i => i.column === col);
    const workerCapacity = col === 2 ? 18 : 12; // dev has more base capacity
    const progressPerItem = inCol.length > 0 ? Math.max(3, Math.floor(workerCapacity / inCol.length)) : 0;
    inCol.forEach(i => {
      i.progress += progressPerItem;
      // Quality degrades under overload (push pressure)
      if (inCol.length > 3) i.quality = Math.max(20, i.quality - 2);
    });
  }

  // Move completed items forward (PUSH — no capacity check)
  for (let col = 3; col >= 1; col--) {
    items.filter(i => i.column === col && i.progress >= WORK_REQUIRED[col]).forEach(i => {
      // Quality check at test — low quality items bounce back
      if (col === 3 && i.quality < 60 && !i.rework) {
        i.rework = true;
        i.column = 2;
        i.progress = 0;
        reworkCount++;
        return;
      }
      i.column = col + 1;
      i.progress = 0;
      if (i.column === 4) {
        done++;
        totalCycleTime += i.age;
      }
    });
  }

  // Push from backlog (always push if there's work)
  const backlogItems = items.filter(i => i.column === 0);
  if (backlogItems.length > 0) {
    const toPush = backlogItems.slice(0, 2); // push up to 2 per tick
    toPush.forEach(i => { i.column = 1; i.progress = 0; });
  }

  // Spawn new work into backlog
  if (state.tick % 4 === 0 && state.tick > 0) {
    items.push({ id: nextId++, column: 0, progress: 0, age: 0, quality: 100, rework: false, blocked: false });
  }

  // Track max queue
  for (let col = 1; col <= 3; col++) {
    const n = countInColumn(items, col);
    if (n > maxQueueSeen) maxQueueSeen = n;
  }

  return { items, nextId, tick: state.tick + 1, done, totalCycleTime, reworkCount, maxQueueSeen };
}

/* ── Pull tick: respect WIP limits, work right-to-left ── */
function pullTick(state: SystemState): SystemState {
  const items = state.items.map(i => ({ ...i }));
  let { nextId, done, totalCycleTime, maxQueueSeen } = state;
  const { reworkCount } = state;

  // Age all active items
  items.forEach(i => { if (i.column > 0 && i.column < 4) i.age++; });

  // Work on items RIGHT TO LEFT (finishing priority)
  for (let col = 3; col >= 1; col--) {
    const inCol = items.filter(i => i.column === col);
    const workerCapacity = col === 2 ? 18 : 12;
    const progressPerItem = inCol.length > 0 ? Math.max(5, Math.floor(workerCapacity / Math.max(inCol.length, 1))) : 0;
    inCol.forEach(i => { i.progress += progressPerItem; });

    // Swarming: if downstream is blocked/light, upstream workers help
    if (col < 3) {
      const downstream = items.filter(i => i.column === col + 1);
      const upstreamCount = inCol.length;
      if (upstreamCount < WIP_LIMITS[col] && downstream.length > 0) {
        // Help downstream by adding bonus progress
        downstream.forEach(i => { i.progress += 3; });
      }
    }
  }

  // PULL completed items forward (right to left — check capacity first)
  for (let col = 3; col >= 1; col--) {
    items.filter(i => i.column === col && i.progress >= WORK_REQUIRED[col]).forEach(i => {
      const nextCol = col + 1;
      if (nextCol === 4 || countInColumn(items, nextCol) < WIP_LIMITS[nextCol]) {
        i.column = nextCol;
        i.progress = 0;
        if (nextCol === 4) {
          done++;
          totalCycleTime += i.age;
        }
      }
      // Quality stays high — natural gate
    });
  }

  // Pull from backlog only if Analysis has capacity
  if (countInColumn(items, 1) < WIP_LIMITS[1]) {
    const backlogItem = items.find(i => i.column === 0);
    if (backlogItem) {
      backlogItem.column = 1;
      backlogItem.progress = 0;
    }
  }

  // Spawn new work into backlog
  if (state.tick % 4 === 0 && state.tick > 0) {
    items.push({ id: nextId++, column: 0, progress: 0, age: 0, quality: 100, rework: false, blocked: false });
  }

  // Track max queue
  for (let col = 1; col <= 3; col++) {
    const n = countInColumn(items, col);
    if (n > maxQueueSeen) maxQueueSeen = n;
  }

  return { items, nextId, tick: state.tick + 1, done, totalCycleTime, reworkCount, maxQueueSeen };
}

/* ── Visual Components ── */

function ItemDot({ item, isPush }: { item: WorkItem; isPush: boolean }) {
  const ageColor = item.age > 20 ? "#ef4444" : item.age > 10 ? "#f59e0b" : "#22c55e";
  const qualityColor = item.quality < 60 ? "#ef4444" : item.quality < 80 ? "#f59e0b" : "#22c55e";
  const showQuality = isPush && item.column > 0 && item.column < 4;

  return (
    <div
      className="relative rounded-md flex items-center justify-center text-[9px] font-bold font-mono transition-all duration-300"
      style={{
        width: 32,
        height: 28,
        background: item.rework
          ? "rgba(239,68,68,0.15)"
          : `${ageColor}12`,
        border: `1.5px solid ${item.rework ? "#ef4444" : ageColor}`,
        color: item.rework ? "#ef4444" : ageColor,
      }}
    >
      {item.rework ? "\u21A9" : `#${item.id}`}
      {/* Progress bar */}
      {item.column > 0 && item.column < 4 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div
            className="h-full rounded-b transition-all duration-300"
            style={{ width: `${Math.min(100, (item.progress / WORK_REQUIRED[item.column]) * 100)}%`, background: ageColor }}
          />
        </div>
      )}
      {/* Quality indicator for push */}
      {showQuality && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
          style={{ background: qualityColor, border: "1px solid rgba(0,0,0,0.3)" }}
        />
      )}
    </div>
  );
}

function BoardColumn({ name, items, wipLimit, isPush, colIndex }: {
  name: string; items: WorkItem[]; wipLimit?: number; isPush: boolean; colIndex: number;
}) {
  const isActive = colIndex > 0 && colIndex < 4;
  const overLimit = wipLimit !== undefined && wipLimit < Infinity && items.length > wipLimit;
  const atLimit = wipLimit !== undefined && wipLimit < Infinity && items.length === wipLimit;

  return (
    <div className="flex-1 min-w-0">
      {/* Column header */}
      <div className="text-center mb-1.5">
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {name}
        </div>
        {wipLimit !== undefined && wipLimit < Infinity && (
          <div
            className="text-[8px] font-bold font-mono mt-0.5"
            style={{ color: overLimit ? "#ef4444" : atLimit ? "#f59e0b" : "#22c55e" }}
          >
            WIP: {items.length}/{wipLimit}
          </div>
        )}
      </div>
      {/* Column body */}
      <div
        className="rounded-lg p-1.5 flex flex-wrap gap-1 justify-center transition-all duration-300"
        style={{
          minHeight: isActive ? 70 : 40,
          background: overLimit
            ? "rgba(239,68,68,0.06)"
            : isActive
              ? "rgba(255,255,255,0.02)"
              : "transparent",
          border: overLimit
            ? "1px solid rgba(239,68,68,0.15)"
            : isActive
              ? "1px solid var(--border-faint)"
              : "1px solid transparent",
        }}
      >
        {items.map(item => (
          <ItemDot key={item.id} item={item} isPush={isPush} />
        ))}
        {items.length === 0 && isActive && (
          <div className="text-[8px] self-center" style={{ color: "var(--text-muted)" }}>empty</div>
        )}
      </div>
    </div>
  );
}

function SystemBoard({ state, isPush, label, color }: {
  state: SystemState; isPush: boolean; label: string; color: string;
}) {
  const avgCycleTime = state.done > 0 ? Math.round(state.totalCycleTime / state.done) : 0;
  const activeWip = state.items.filter(i => i.column > 0 && i.column < 4).length;

  return (
    <div
      className="rounded-xl p-3 flex-1 min-w-[280px]"
      style={{ background: `${color}06`, border: `1px solid ${color}15` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-6 rounded-full" style={{ background: color }} />
        <div>
          <div className="text-[11px] font-bold" style={{ color }}>{label}</div>
          <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {isPush ? "Work pushed forward regardless of capacity" : "Work pulled only when capacity exists"}
          </div>
        </div>
      </div>

      {/* Direction arrow */}
      <div className="text-center text-[9px] font-bold mb-1.5" style={{ color: isPush ? "#ef4444" : "#22c55e" }}>
        {isPush ? "PUSH \u2192 \u2192 \u2192" : "\u2190 \u2190 \u2190 PULL"}
      </div>

      {/* Board */}
      <div className="flex gap-1 mb-3">
        {COLUMNS.map((col, ci) => (
          <BoardColumn
            key={ci}
            name={col}
            items={state.items.filter(i => i.column === ci)}
            wipLimit={isPush ? undefined : WIP_LIMITS[ci]}
            isPush={isPush}
            colIndex={ci}
          />
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Done", value: state.done, c: "#22c55e" },
          { label: "WIP", value: activeWip, c: "#8b5cf6" },
          { label: "Avg Cycle", value: avgCycleTime > 0 ? `${avgCycleTime}t` : "-", c: "#f59e0b" },
          { label: isPush ? "Rework" : "Max Queue", value: isPush ? state.reworkCount : state.maxQueueSeen, c: isPush ? "#ef4444" : "#3b82f6" },
        ].map(({ label: l, value, c }) => (
          <div key={l} className="text-center rounded-lg py-1.5" style={{ background: `${c}08`, border: `1px solid ${c}12` }}>
            <div className="text-sm font-extrabold font-mono" style={{ color: c }}>{value}</div>
            <div className="text-[7px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Event Log ── */
function EventItem({ tick, text, color }: { tick: number; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2 text-[10px] leading-snug fade-in">
      <span className="font-mono font-bold shrink-0" style={{ color: "var(--text-muted)" }}>t{tick}</span>
      <span style={{ color }}>{text}</span>
    </div>
  );
}

/* ── Main Component ── */
export function ComparisonView() {
  const [pushState, setPushState] = useState<SystemState>(createSystem);
  const [pullState, setPullState] = useState<SystemState>(createSystem);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [events, setEvents] = useState<{ tick: number; text: string; color: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const maxTick = 60;
  const finished = pushState.tick >= maxTick;

  const addEvent = useCallback((tick: number, text: string, color: string) => {
    setEvents(prev => [...prev.slice(-20), { tick, text, color }]);
  }, []);

  useEffect(() => {
    if (running && !finished) {
      timerRef.current = setTimeout(() => {
        setPushState(prev => {
          const next = pushTick(prev);
          // Detect interesting events
          const pushWip = next.items.filter(i => i.column > 0 && i.column < 4).length;
          if (pushWip > 6 && prev.items.filter(i => i.column > 0 && i.column < 4).length <= 6) {
            addEvent(next.tick, "PUSH: WIP exceeds 6 \u2014 workers are overloaded, context switching", "#ef4444");
          }
          if (next.reworkCount > prev.reworkCount) {
            addEvent(next.tick, "PUSH: Quality failure! Item bounced back for rework", "#ef4444");
          }
          return next;
        });
        setPullState(prev => {
          const next = pullTick(prev);
          if (next.done > prev.done && next.done % 3 === 0) {
            addEvent(next.tick, `PULL: ${next.done} items completed \u2014 steady flow maintained`, "#22c55e");
          }
          return next;
        });
      }, speed);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [running, pushState.tick, finished, speed, addEvent]);

  // Auto-scroll events
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setPushState(createSystem());
    setPullState(createSystem());
    setEvents([]);
  }, []);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Btn primary onClick={() => setRunning(!running)} disabled={finished}>
          {finished ? "Finished" : running ? "Pause" : pushState.tick === 0 ? "Start Comparison" : "Resume"}
        </Btn>
        <div className="flex gap-1">
          {[{ s: 800, l: "1x" }, { s: 400, l: "2x" }, { s: 200, l: "4x" }].map(({ s, l }) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="px-2 py-1 rounded text-[10px] font-bold transition-all"
              style={{
                background: speed === s ? "rgba(59,130,246,0.15)" : "transparent",
                color: speed === s ? "#60a5fa" : "var(--text-muted)",
                border: speed === s ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-faint)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono ml-auto" style={{ color: "var(--text-tertiary)" }}>
          Tick {pushState.tick}/{maxTick}
        </span>
        <Btn small onClick={handleReset}>Reset</Btn>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--border-faint)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(pushState.tick / maxTick) * 100}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }}
        />
      </div>

      {/* Side-by-side boards */}
      <div className="flex gap-3 flex-wrap mb-4">
        <SystemBoard state={pushState} isPush label="Push System" color="#ef4444" />
        <SystemBoard state={pullState} isPush={false} label="Pull System" color="#22c55e" />
      </div>

      {/* Event log */}
      {events.length > 0 && (
        <div
          className="rounded-xl p-3 max-h-[120px] overflow-y-auto flex flex-col gap-1.5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            Event Log
          </div>
          {events.map((e, i) => (
            <EventItem key={i} {...e} />
          ))}
          <div ref={eventsEndRef} />
        </div>
      )}

      {/* Final comparison callout */}
      {finished && (
        <div
          className="pop-in rounded-xl p-4 mt-4"
          style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}
        >
          <div className="text-sm font-bold mb-3" style={{ color: "#a78bfa" }}>Final Comparison</div>
          <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
            <div className="font-bold" style={{ color: "var(--text-muted)" }}>&nbsp;</div>
            <div className="font-bold" style={{ color: "#ef4444" }}>Push</div>
            <div className="font-bold" style={{ color: "#22c55e" }}>Pull</div>

            <div style={{ color: "var(--text-secondary)" }}>Completed</div>
            <div className="font-mono font-bold" style={{ color: "#ef4444" }}>{pushState.done}</div>
            <div className="font-mono font-bold" style={{ color: "#22c55e" }}>{pullState.done}</div>

            <div style={{ color: "var(--text-secondary)" }}>Avg Cycle Time</div>
            <div className="font-mono font-bold" style={{ color: "#ef4444" }}>
              {pushState.done > 0 ? `${Math.round(pushState.totalCycleTime / pushState.done)}t` : "-"}
            </div>
            <div className="font-mono font-bold" style={{ color: "#22c55e" }}>
              {pullState.done > 0 ? `${Math.round(pullState.totalCycleTime / pullState.done)}t` : "-"}
            </div>

            <div style={{ color: "var(--text-secondary)" }}>Rework Items</div>
            <div className="font-mono font-bold" style={{ color: "#ef4444" }}>{pushState.reworkCount}</div>
            <div className="font-mono font-bold" style={{ color: "#22c55e" }}>{pullState.reworkCount}</div>

            <div style={{ color: "var(--text-secondary)" }}>Max WIP Seen</div>
            <div className="font-mono font-bold" style={{ color: "#ef4444" }}>{pushState.maxQueueSeen}</div>
            <div className="font-mono font-bold" style={{ color: "#22c55e" }}>{pullState.maxQueueSeen}</div>
          </div>
        </div>
      )}
    </div>
  );
}
