"use client";

/**
 * Aging WIP by Workflow State
 *
 * Shows each in-progress work item positioned by its current workflow state
 * (X axis = workflow columns, Y axis = age in days). Color-coded bars indicate
 * likelihood of meeting SLE:
 *   - Green: on track (age < 50% SLE)
 *   - Amber: watch (50-75% SLE)
 *   - Orange: at risk (75-100% SLE)
 *   - Red: breaching SLE (> 100%)
 *
 * Only shows WIP items (excludes Backlog and Done).
 * Inspired by Kanban practitioner aging charts.
 */

import React from "react";
import type { BoardWorkItem, BoardDefinition } from "@/types/board";
import { itemAge, getWorkflowColumns } from "@/types/board";

interface AgingByStateChartProps {
  items: BoardWorkItem[];
  definition: BoardDefinition;
  currentDay: number;
}

function ageColor(age: number, sleDays: number): string {
  const pct = age / sleDays;
  if (pct < 0.5) return "#22c55e";
  if (pct < 0.75) return "#f59e0b";
  if (pct < 1.0) return "#f97316";
  return "#ef4444";
}

export function AgingByStateChart({ items, definition, currentDay }: AgingByStateChartProps) {
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
    }))
    .sort((a, b) => b.age - a.age);

  if (wipItems.length === 0) {
    return (
      <div className="text-[10px] text-center py-6" style={{ color: "var(--text-muted)" }}>
        No items in progress
      </div>
    );
  }

  const maxAge = Math.max(...wipItems.map((it) => it.age), sleDays + 2);

  // Group items by column for positioning
  const itemsByCol: Record<string, typeof wipItems> = {};
  for (const item of wipItems) {
    const colId = item.columnId;
    if (!itemsByCol[colId]) itemsByCol[colId] = [];
    itemsByCol[colId].push(item);
  }

  const CHART_HEIGHT = 200;
  const COL_WIDTH = Math.floor(100 / workflowCols.length);
  const BAR_WIDTH = 18;
  const BAR_GAP = 2;

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
          <div className="absolute left-0 right-0" style={{
            bottom: `${28 + (sleDays / maxAge) * CHART_HEIGHT}px`,
            borderTop: "1.5px dashed #ef444450",
          }}>
            <span className="absolute right-0 text-[7px] font-bold" style={{ color: "#ef4444", top: -10 }}>
              SLE {sleDays}d
            </span>
          </div>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <div key={pct} className="absolute left-0 right-0"
              style={{ bottom: `${28 + pct * CHART_HEIGHT}px`, borderTop: "1px solid var(--border-faint)", opacity: 0.3 }} />
          ))}

          {/* Column groups */}
          <div className="flex h-full">
            {workflowCols.map((col, ci) => {
              const colItems = itemsByCol[col.id] ?? [];
              return (
                <div key={col.id} className="flex-1 relative"
                  style={{ borderRight: ci < workflowCols.length - 1 ? "1px dashed var(--border-faint)" : "none" }}>

                  {/* Column label at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[28px] flex items-center justify-center">
                    <span className="text-[8px] font-bold truncate px-1" style={{ color: col.color }}>
                      {col.name}
                    </span>
                  </div>

                  {/* Item bars */}
                  <div className="absolute left-0 right-0 bottom-[28px] flex items-end justify-center gap-[2px]"
                    style={{ height: CHART_HEIGHT }}>
                    {colItems.map((item, ii) => {
                      const barHeight = Math.max(4, (item.age / maxAge) * CHART_HEIGHT);
                      const color = ageColor(item.age, sleDays);
                      const itemType = definition.itemTypes.find((t) => t.id === item.typeId);
                      return (
                        <div key={item.id}
                          title={`${item.id}: ${item.age}d (${col.name})`}
                          className="relative flex flex-col items-center"
                          style={{ width: BAR_WIDTH }}>
                          <div className="rounded-t-sm transition-all"
                            style={{
                              width: BAR_WIDTH,
                              height: barHeight,
                              background: color,
                              opacity: item.blocked ? 0.5 : 0.8,
                              border: item.blocked ? "1px dashed #ef4444" : "none",
                            }} />
                          <span className="text-[6px] font-mono font-bold mt-0.5 truncate" style={{ color: "var(--text-muted)", maxWidth: BAR_WIDTH }}>
                            {item.id}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1">
        {[
          { label: "On track", color: "#22c55e" },
          { label: "Watch", color: "#f59e0b" },
          { label: "At risk", color: "#f97316" },
          { label: "Breaching", color: "#ef4444" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: l.color, opacity: 0.8 }} />
            <span className="text-[7px] font-bold" style={{ color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
