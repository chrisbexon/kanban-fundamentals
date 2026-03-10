"use client";

import { useMemo } from "react";
import type { CalendarCell, MCMode } from "@/types/flow-metrics";

interface MCCalendarHeatmapProps {
  cells: CalendarCell[];
  mode: MCMode;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function probColor(p: number): string {
  if (p >= 95) return "#166534";
  if (p >= 85) return "#22c55e";
  if (p >= 70) return "#eab308";
  if (p >= 50) return "#f59e0b";
  return "#ef4444";
}

function probBg(p: number): string {
  if (p >= 95) return "rgba(22,101,52,0.25)";
  if (p >= 85) return "rgba(34,197,94,0.2)";
  if (p >= 70) return "rgba(234,179,8,0.15)";
  if (p >= 50) return "rgba(245,158,11,0.12)";
  if (p > 0) return "rgba(239,68,68,0.12)";
  return "rgba(255,255,255,0.03)";
}

interface CalendarMonth {
  year: number;
  month: number; // 0-based
  label: string;
  weeks: (CalendarCell | null)[][]; // 7-element rows, null = empty
}

export function MCCalendarHeatmap({ cells, mode }: MCCalendarHeatmapProps) {
  const months = useMemo(() => {
    if (cells.length === 0) return [];

    // Index cells by date string for O(1) lookup
    const cellMap = new Map<string, CalendarCell>();
    for (const c of cells) {
      cellMap.set(c.date, c);
    }

    // Find the range of months to display
    const firstDate = new Date(cells[0].date + "T00:00");
    const lastDate = new Date(cells[cells.length - 1].date + "T00:00");

    const result: CalendarMonth[] = [];
    let y = firstDate.getFullYear();
    let m = firstDate.getMonth();
    const endY = lastDate.getFullYear();
    const endM = lastDate.getMonth();

    while (y < endY || (y === endY && m <= endM)) {
      const label = new Date(y, m, 1).toLocaleString("en", { month: "long", year: "numeric" });
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      // Build weeks (Mon=0 ... Sun=6)
      const weeks: (CalendarCell | null)[][] = [];
      let currentWeek: (CalendarCell | null)[] = [];

      // First day of month — what day of week? (convert JS Sun=0 to Mon=0)
      const firstDow = new Date(y, m, 1).getDay();
      const mondayBased = firstDow === 0 ? 6 : firstDow - 1;

      // Pad start of first week
      for (let i = 0; i < mondayBased; i++) {
        currentWeek.push(null);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const cell = cellMap.get(dateStr) || null;
        currentWeek.push(cell);

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Pad end of last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      result.push({ year: y, month: m, label, weeks });

      // Next month
      m++;
      if (m > 11) { m = 0; y++; }
    }

    return result;
  }, [cells]);

  if (cells.length === 0) {
    return (
      <div className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
        No calendar data available
      </div>
    );
  }

  const subtitle = mode === "when"
    ? "Probability of completion by this date"
    : "Probability of reaching target by this date";

  return (
    <div>
      <div className="text-[11px] mb-4" style={{ color: "var(--text-tertiary)" }}>{subtitle}</div>

      <div className="flex flex-wrap gap-5">
        {months.map((mo) => (
          <div key={`${mo.year}-${mo.month}`} className="flex-shrink-0">
            {/* Month title */}
            <div className="text-[11px] font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
              {mo.label}
            </div>

            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((l) => (
                <div
                  key={l}
                  className="text-[8px] font-mono text-center"
                  style={{ color: "var(--text-muted)", width: 36 }}
                >
                  {l}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {mo.weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((cell, ci) => {
                  if (!cell) {
                    return <div key={ci} style={{ width: 36, height: 36 }} />;
                  }

                  const day = parseInt(cell.date.slice(8), 10);
                  const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
                  const hasProb = cell.probability > 0;

                  return (
                    <div
                      key={ci}
                      title={`${cell.date}: ${cell.probability}%`}
                      className="rounded-md flex flex-col items-center justify-center cursor-default transition-all relative"
                      style={{
                        width: 36,
                        height: 36,
                        background: hasProb ? probBg(cell.probability) : "rgba(255,255,255,0.02)",
                        opacity: isWeekend ? 0.45 : 1,
                        border: cell.probability >= 85
                          ? `1px solid ${probColor(cell.probability)}40`
                          : "1px solid var(--border-hairline, rgba(255,255,255,0.04))",
                      }}
                    >
                      <div
                        className="text-[10px] font-mono leading-none"
                        style={{ color: hasProb ? probColor(cell.probability) : "var(--text-muted)" }}
                      >
                        {day}
                      </div>
                      {hasProb && (
                        <div
                          className="text-[8px] font-mono font-bold leading-none mt-0.5"
                          style={{ color: probColor(cell.probability) }}
                        >
                          {cell.probability}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }} />
          &lt;50%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }} />
          50-70%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }} />
          70-85%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }} />
          85-95%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(22,101,52,0.25)", border: "1px solid rgba(22,101,52,0.5)" }} />
          95%+
        </span>
      </div>
    </div>
  );
}
