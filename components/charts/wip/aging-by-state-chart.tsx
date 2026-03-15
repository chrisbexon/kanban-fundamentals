"use client";

/**
 * Aging WIP by Workflow State — Probability-Based (Kanban Game version)
 *
 * Adapted from the Board Designer's AgingByStateChart to work with the
 * Kanban Game's WipWorkItem data model.
 *
 * X axis: workflow states (red-active → red-finished → blue-active → blue-finished → green)
 * Y axis: age in days
 *
 * Background bands per column show probability of meeting SLE given current position:
 *   - Green  (95%+): comfortable
 *   - Amber  (85%):  on track
 *   - Orange (70%):  at risk
 *   - Red    (50%):  likely breach
 *   - Above red:     almost certainly breaching
 */

import type { WipWorkItem, WipLocation } from "@/types/wip-game";
import { COLUMN_DEFS, SLE_DAYS as DEFAULT_SLE } from "@/lib/constants/wip-game";

interface AgingByStateChartProps {
  items: WipWorkItem[];
  currentDay: number;
  sleDays?: number;
  height?: number;
}

// Workflow columns (excluding backlog and done)
const WORKFLOW_LOCATIONS: WipLocation[] = [
  "red-active", "red-finished", "blue-active", "blue-finished", "green",
];

function bandThresholds(colIndex: number, totalCols: number, sleDays: number) {
  const progress = (colIndex + 1) / totalCols;
  return {
    p95: sleDays * progress * 0.50,
    p85: sleDays * progress * 0.70,
    p70: sleDays * progress * 0.85,
    p50: sleDays * progress * 1.00,
  };
}

const BAND_COLORS = [
  { label: "95%", color: "#22c55e", opacity: 0.18 },
  { label: "85%", color: "#f59e0b", opacity: 0.15 },
  { label: "70%", color: "#f97316", opacity: 0.15 },
  { label: "50%", color: "#ef4444", opacity: 0.12 },
];

function dotColor(age: number, thresholds: ReturnType<typeof bandThresholds>): string {
  if (age <= thresholds.p95) return "#22c55e";
  if (age <= thresholds.p85) return "#84cc16";
  if (age <= thresholds.p70) return "#f59e0b";
  if (age <= thresholds.p50) return "#f97316";
  return "#ef4444";
}

export function WipAgingByStateChart({ items, currentDay, sleDays = DEFAULT_SLE, height = 240 }: AgingByStateChartProps) {
  const N = WORKFLOW_LOCATIONS.length;

  // Get in-progress items with age and column index
  const wipItems = items
    .filter((it) => WORKFLOW_LOCATIONS.includes(it.location) && it.dayStarted !== null && it.dayDone === null)
    .map((it) => ({
      ...it,
      age: currentDay - (it.dayStarted ?? currentDay),
      colIdx: WORKFLOW_LOCATIONS.indexOf(it.location),
    }));

  if (wipItems.length === 0) {
    return (
      <div className="text-[10px] text-center py-6" style={{ color: "var(--text-muted)" }}>
        No items in progress
      </div>
    );
  }

  const maxAge = Math.max(...wipItems.map((it) => it.age), sleDays + 2);
  const CHART_HEIGHT = height - 40;

  // Group items by column for dot positioning
  const itemsByCol: Record<string, typeof wipItems> = {};
  for (const item of wipItems) {
    const loc = item.location;
    if (!itemsByCol[loc]) itemsByCol[loc] = [];
    itemsByCol[loc].push(item);
  }

  return (
    <div>
      <div className="relative" style={{ height: CHART_HEIGHT + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-[28px] w-[30px] flex flex-col justify-between text-right pr-1">
          <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>{maxAge}d</span>
          <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>{Math.round(maxAge / 2)}d</span>
          <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-[32px] right-0 top-0 bottom-0">
          {/* SLE reference line */}
          {sleDays <= maxAge && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{
                bottom: `${28 + (sleDays / maxAge) * CHART_HEIGHT}px`,
                borderTop: "1.5px dashed #ef444460",
              }}
            >
              <span className="absolute right-0 text-[7px] font-bold" style={{ color: "#ef4444", top: -10 }}>
                SLE {sleDays}d
              </span>
            </div>
          )}

          {/* Column groups with probability bands */}
          <div className="flex h-full">
            {WORKFLOW_LOCATIONS.map((loc, ci) => {
              const colDef = COLUMN_DEFS.find((c) => c.location === loc)!;
              const thresholds = bandThresholds(ci, N, sleDays);
              const colItems = itemsByCol[loc] ?? [];

              const bandTops = [
                { pct: thresholds.p95 / maxAge, ...BAND_COLORS[0] },
                { pct: thresholds.p85 / maxAge, ...BAND_COLORS[1] },
                { pct: thresholds.p70 / maxAge, ...BAND_COLORS[2] },
                { pct: thresholds.p50 / maxAge, ...BAND_COLORS[3] },
              ];

              return (
                <div
                  key={loc}
                  className="flex-1 relative"
                  style={{ borderRight: ci < N - 1 ? "1px dashed var(--border-faint)" : "none" }}
                >
                  {/* Red fill from p50 to top (breach zone) */}
                  {(() => {
                    const p50Pct = Math.min(1, bandTops[3].pct);
                    return p50Pct < 1 ? (
                      <div
                        className="absolute left-0 right-0"
                        style={{
                          bottom: `${28 + p50Pct * CHART_HEIGHT}px`,
                          top: 0,
                          background: "#ef4444",
                          opacity: 0.10,
                        }}
                      />
                    ) : null;
                  })()}

                  {/* Probability bands */}
                  {bandTops.map((band, bi) => {
                    const prevTop = bi > 0 ? bandTops[bi - 1].pct : 0;
                    const bandHeight = Math.min(1, band.pct) - prevTop;
                    if (bandHeight <= 0) return null;
                    return (
                      <div
                        key={bi}
                        className="absolute left-0 right-0"
                        style={{
                          bottom: `${28 + prevTop * CHART_HEIGHT}px`,
                          height: `${bandHeight * CHART_HEIGHT}px`,
                          background: band.color,
                          opacity: band.opacity,
                        }}
                      />
                    );
                  })}

                  {/* Item dots */}
                  {colItems.map((item, ii) => {
                    const yPct = item.age / maxAge;
                    const color = dotColor(item.age, thresholds);
                    const totalInCol = colItems.length;
                    const xPct = totalInCol <= 1 ? 50 : 20 + (ii / (totalInCol - 1)) * 60;

                    return (
                      <div
                        key={`${item.id}-${ii}`}
                        title={`${item.id}: ${item.age}d in ${colDef.label}${item.blocked ? " (BLOCKED)" : ""}`}
                        className="absolute z-10"
                        style={{
                          left: `${xPct}%`,
                          bottom: `${28 + yPct * CHART_HEIGHT}px`,
                          transform: "translate(-50%, 50%)",
                        }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 18,
                            height: 18,
                            background: color,
                            border: item.blocked ? "2px solid #ef4444" : `2px solid ${color}`,
                            boxShadow: item.blocked
                              ? "0 0 6px rgba(239,68,68,0.4)"
                              : `0 0 4px ${color}40`,
                            opacity: 0.9,
                          }}
                        >
                          <span className="text-[6px] font-bold" style={{ color: "#fff" }}>
                            {item.age}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Column label at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[28px] flex items-center justify-center"
                    style={{ borderTop: "1px solid var(--border-faint)" }}
                  >
                    <span className="text-[8px] font-bold truncate px-1" style={{ color: colDef.color }}>
                      {colDef.shortLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1.5 flex-wrap">
        {[
          { label: "95%+ SLE met", color: "#22c55e" },
          { label: "85%", color: "#f59e0b" },
          { label: "70%", color: "#f97316" },
          { label: "50%", color: "#ef4444" },
          { label: "<50% (breach)", color: "#ef4444" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color, opacity: 0.5 }} />
            <span className="text-[7px] font-bold" style={{ color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ border: "2px solid #ef4444", background: "transparent" }} />
          <span className="text-[7px] font-bold" style={{ color: "var(--text-muted)" }}>Blocked</span>
        </div>
      </div>
    </div>
  );
}
