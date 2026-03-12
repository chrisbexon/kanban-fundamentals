"use client";

/**
 * Cycle Time Scatter Chart for Board Designer
 *
 * Each completed item is a dot: X = day done, Y = cycle time.
 * Color-coded by status: standard (purple), expedite (red), was-blocked (amber).
 * Percentile reference lines (p50, p85, p95) and SLE target.
 */

import React from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import type { BoardWorkItem } from "@/types/board";
import { cycleTimeScatterExtended, type BoardCycleTimePoint } from "@/lib/stats/board-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface BoardCtScatterChartProps {
  items: BoardWorkItem[];
  sleDays: number;
  height?: number;
}

function dotColor(point: BoardCycleTimePoint): string {
  if (point.isExpedite) return "#ef4444";   // red — expedite
  if (point.wasBlocked) return "#f59e0b";   // amber — was blocked
  return "#8b5cf6";                         // purple — standard
}

function dotLabel(point: BoardCycleTimePoint): string {
  if (point.isExpedite) return "Expedite";
  if (point.wasBlocked) return "Blocked";
  return "Standard";
}

export function BoardCtScatterChart({ items, sleDays, height = 240 }: BoardCtScatterChartProps) {
  const data = cycleTimeScatterExtended(items);
  if (data.length === 0) {
    return (
      <div className="text-[10px] text-center py-6" style={{ color: "var(--text-muted)" }}>
        No completed items yet
      </div>
    );
  }

  const cts = data.map((d) => d.cycleTime);
  const sorted = [...cts].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
  const p85 = sorted[Math.floor(sorted.length * 0.85)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;

  const hasExpedite = data.some((d) => d.isExpedite);
  const hasBlocked = data.some((d) => d.wasBlocked);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 65, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="dayDone"
            type="number"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Day Done", position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis
            dataKey="cycleTime"
            type="number"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Cycle Time (days)", angle: -90, position: "insideLeft", style: CHART_LABEL }}
          />
          <Tooltip
            {...CHART_TOOLTIP}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as BoardCycleTimePoint;
              // Find all items at the same coordinates
              const colocated = data.filter((p) => p.dayDone === d.dayDone && p.cycleTime === d.cycleTime);
              return (
                <div className="rounded-lg px-2 py-1.5 text-[10px]" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: 160, overflowY: "auto" }}>
                  {colocated.map((p) => (
                    <div key={p.itemId} className="font-bold" style={{ color: dotColor(p) }}>
                      {p.itemId} — {dotLabel(p)}
                    </div>
                  ))}
                  <div style={{ color: "#94a3b8" }}>Cycle Time: {d.cycleTime}d | Done: Day {d.dayDone}</div>
                  {colocated.length > 1 && (
                    <div style={{ color: "#64748b" }}>{colocated.length} items at this point</div>
                  )}
                </div>
              );
            }}
          />
          <ReferenceLine y={p50} stroke="#3b82f630" strokeDasharray="4 4" label={{ value: `p50: ${p50}d`, position: "right", style: { fontSize: 9, fill: "#3b82f6" } }} />
          <ReferenceLine y={p85} stroke="#f59e0b30" strokeDasharray="4 4" label={{ value: `p85: ${p85}d`, position: "right", style: { fontSize: 9, fill: "#f59e0b" } }} />
          <ReferenceLine y={p95} stroke="#ef444430" strokeDasharray="4 4" label={{ value: `p95: ${p95}d`, position: "right", style: { fontSize: 9, fill: "#ef4444" } }} />
          <ReferenceLine y={sleDays} stroke="#22c55e30" strokeDasharray="6 3" label={{ value: `SLE: ${sleDays}d`, position: "right", style: { fontSize: 9, fill: "#22c55e" } }} />
          <Scatter data={data} fillOpacity={0.8}>
            {data.map((d, i) => (
              <Cell key={i} fill={dotColor(d)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legend */}
      {(hasExpedite || hasBlocked) && (
        <div className="flex items-center gap-3 mt-1 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6" }} />
            <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Standard</span>
          </div>
          {hasBlocked && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Was Blocked</span>
            </div>
          )}
          {hasExpedite && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Expedite</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
