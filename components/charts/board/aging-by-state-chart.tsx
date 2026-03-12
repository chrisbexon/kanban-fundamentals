"use client";

/**
 * Aging WIP by Workflow State — Probability-Based
 *
 * X axis: workflow states (columns), excluding backlog and done.
 * Y axis: age in days.
 *
 * Background bands per column show the probability of meeting the SLE
 * given the item's current position in the workflow:
 *   - Green  (95%+): comfortable — plenty of time remaining
 *   - Amber  (85%):  on track but watch
 *   - Orange (70%):  at risk — running out of budget
 *   - Red    (50%):  likely to breach SLE
 *   - Above red:     almost certainly breaching
 *
 * Items further through the workflow can afford to be older (less remaining
 * work), so the bands shift upward as items progress right.
 *
 * Each in-progress work item is shown as a circle at its current age and
 * column position.
 */

import React from "react";
import type { BoardWorkItem, BoardDefinition } from "@/types/board";
import { itemAge, getWorkflowColumns } from "@/types/board";

interface AgingByStateChartProps {
  items: BoardWorkItem[];
  definition: BoardDefinition;
  currentDay: number;
  height?: number;
}

/** Calculate age thresholds per column for probability bands.
 *  progress = (colIndex + 1) / totalColumns — how far through the workflow.
 *  Thresholds represent the age below which an item has N% chance of meeting SLE. */
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
  { label: "95%", color: "#22c55e", opacity: 0.18 },   // green
  { label: "85%", color: "#f59e0b", opacity: 0.15 },   // amber
  { label: "70%", color: "#f97316", opacity: 0.15 },   // orange
  { label: "50%", color: "#ef4444", opacity: 0.12 },   // red
];

function dotColor(age: number, thresholds: ReturnType<typeof bandThresholds>): string {
  if (age <= thresholds.p95) return "#22c55e";
  if (age <= thresholds.p85) return "#84cc16";
  if (age <= thresholds.p70) return "#f59e0b";
  if (age <= thresholds.p50) return "#f97316";
  return "#ef4444";
}

export function AgingByStateChart({ items, definition, currentDay, height = 240 }: AgingByStateChartProps) {
  const workflowCols = getWorkflowColumns(definition);
  if (workflowCols.length === 0) return null;

  const sleDays = definition.settings.sleDays;

  // Get all WIP items (committed, not done, in workflow columns)
  const workflowColIds = new Set(workflowCols.map((c) => c.id));
  const wipItems = items
    .filter((it) => workflowColIds.has(it.columnId) && it.commitDay !== null && it.doneDay === null)
    .map((it) => ({
      ...it,
      age: itemAge(it, currentDay),
      colIdx: workflowCols.findIndex((c) => c.id === it.columnId),
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
  const N = workflowCols.length;

  // Group items by column for dot positioning
  const itemsByCol: Record<string, typeof wipItems> = {};
  for (const item of wipItems) {
    if (!itemsByCol[item.columnId]) itemsByCol[item.columnId] = [];
    itemsByCol[item.columnId].push(item);
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
            <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{
              bottom: `${28 + (sleDays / maxAge) * CHART_HEIGHT}px`,
              borderTop: "1.5px dashed #ef444460",
            }}>
              <span className="absolute right-0 text-[7px] font-bold" style={{ color: "#ef4444", top: -10 }}>
                SLE {sleDays}d
              </span>
            </div>
          )}

          {/* Column groups with probability bands */}
          <div className="flex h-full">
            {workflowCols.map((col, ci) => {
              const thresholds = bandThresholds(ci, N, sleDays);
              const colItems = itemsByCol[col.id] ?? [];

              // Band heights as percentages of chart
              const bandTops = [
                { pct: thresholds.p95 / maxAge, ...BAND_COLORS[0] },
                { pct: thresholds.p85 / maxAge, ...BAND_COLORS[1] },
                { pct: thresholds.p70 / maxAge, ...BAND_COLORS[2] },
                { pct: thresholds.p50 / maxAge, ...BAND_COLORS[3] },
              ];

              return (
                <div key={col.id} className="flex-1 relative"
                  style={{ borderRight: ci < N - 1 ? "1px dashed var(--border-faint)" : "none" }}>

                  {/* Red fill from p50 to top (breach zone) */}
                  {(() => {
                    const p50Pct = Math.min(1, bandTops[3].pct);
                    return p50Pct < 1 ? (
                      <div className="absolute left-0 right-0"
                        style={{
                          bottom: `${28 + p50Pct * CHART_HEIGHT}px`,
                          top: 0,
                          background: "#ef4444",
                          opacity: 0.10,
                        }} />
                    ) : null;
                  })()}

                  {/* Probability bands (stacked from bottom) */}
                  {bandTops.map((band, bi) => {
                    const prevTop = bi > 0 ? bandTops[bi - 1].pct : 0;
                    const bandHeight = Math.min(1, band.pct) - prevTop;
                    if (bandHeight <= 0) return null;
                    return (
                      <div key={bi} className="absolute left-0 right-0"
                        style={{
                          bottom: `${28 + prevTop * CHART_HEIGHT}px`,
                          height: `${bandHeight * CHART_HEIGHT}px`,
                          background: band.color,
                          opacity: band.opacity,
                        }} />
                    );
                  })}

                  {/* Item dots */}
                  {colItems.map((item, ii) => {
                    const yPct = item.age / maxAge;
                    const color = dotColor(item.age, thresholds);
                    // Spread dots horizontally within column
                    const totalInCol = colItems.length;
                    const xPct = totalInCol <= 1 ? 50 : 20 + (ii / (totalInCol - 1)) * 60;

                    return (
                      <div key={item.id}
                        title={`${item.id}: ${item.age}d in ${col.name}${item.blocked ? " (BLOCKED)" : ""}`}
                        className="absolute z-10"
                        style={{
                          left: `${xPct}%`,
                          bottom: `${28 + yPct * CHART_HEIGHT}px`,
                          transform: "translate(-50%, 50%)",
                        }}>
                        <div className="rounded-full flex items-center justify-center"
                          style={{
                            width: 14,
                            height: 14,
                            background: color,
                            border: item.blocked ? "2px solid #ef4444" : `2px solid ${color}`,
                            boxShadow: item.blocked ? "0 0 6px rgba(239,68,68,0.4)" : `0 0 4px ${color}40`,
                            opacity: 0.9,
                          }}>
                          <span className="text-[5px] font-bold" style={{ color: "#fff" }}>
                            {item.age}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Column label at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[28px] flex items-center justify-center"
                    style={{ background: "var(--bg-deeper)" }}>
                    <span className="text-[8px] font-bold truncate px-1" style={{ color: col.color }}>
                      {col.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1.5">
        {[
          { label: "95%+ chance", color: "#22c55e" },
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
