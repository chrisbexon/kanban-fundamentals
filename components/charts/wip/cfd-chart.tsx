"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { DaySnapshot } from "@/types/wip-game";
import { cfdData } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface CfdChartProps {
  snapshots: DaySnapshot[];
  showLittlesLaw?: boolean;
}

export function CfdChart({ snapshots, showLittlesLaw = false }: CfdChartProps) {
  const data = cfdData(snapshots);
  if (data.length === 0) return null;

  // Compute Little's Law metrics from the data
  // Use the last data point for the vertical (WIP) line
  // and approximate avg lead time as horizontal distance between arrival and done curves
  const lastPoint = data[data.length - 1];
  const midDay = data[Math.floor(data.length / 2)]?.day ?? lastPoint.day;

  // Average WIP across all points (items between backlog-entry and done)
  const avgWip = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.redActive + d.redFinished + d.blueActive + d.blueFinished + d.green, 0) / data.length * 10) / 10
    : 0;

  // Average throughput (done items per day)
  const firstDay = data[0]?.day ?? 0;
  const lastDay = lastPoint?.day ?? 0;
  const totalDone = lastPoint?.done ?? 0;
  const firstDone = data[0]?.done ?? 0;
  const span = lastDay - firstDay;
  const avgThroughput = span > 0 ? Math.round(((totalDone - firstDone) / span) * 100) / 100 : 0;

  // Little's Law: Avg Lead Time = Avg WIP / Avg Throughput
  const avgLeadTime = avgThroughput > 0 ? Math.round((avgWip / avgThroughput) * 10) / 10 : 0;

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="day"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Day", position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
          <Tooltip {...CHART_TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Area type="monotone" dataKey="done" stackId="1" stroke="#a3e635" fill="#a3e63520" name="Done" />
          <Area type="monotone" dataKey="green" stackId="1" stroke="#22c55e" fill="#22c55e20" name="Green" />
          <Area type="monotone" dataKey="blueFinished" stackId="1" stroke="#60a5fa" fill="#60a5fa15" name="Blue Fin" />
          <Area type="monotone" dataKey="blueActive" stackId="1" stroke="#3b82f6" fill="#3b82f620" name="Blue Act" />
          <Area type="monotone" dataKey="redFinished" stackId="1" stroke="#f87171" fill="#f8717115" name="Red Fin" />
          <Area type="monotone" dataKey="redActive" stackId="1" stroke="#ef4444" fill="#ef444420" name="Red Act" />
          <Area type="monotone" dataKey="backlog" stackId="1" stroke="#64748b" fill="#64748b15" name="Backlog" />
          {showLittlesLaw && (
            <ReferenceLine
              x={midDay}
              stroke="#fbbf2480"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{ value: `WIP ≈ ${avgWip}`, position: "top", style: { fontSize: 10, fill: "#fbbf24", fontWeight: 700 } }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      {showLittlesLaw && (
        <div
          className="mt-2 rounded-lg px-3 py-2 flex flex-wrap gap-4 text-xs"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
        >
          <div className="font-bold text-amber-400">Little&apos;s Law</div>
          <div style={{ color: "var(--text-secondary)" }}>
            Avg Lead Time = Avg WIP &divide; Avg Throughput
          </div>
          <div className="flex gap-3 font-mono">
            <span className="text-amber-300">{avgLeadTime}d</span>
            <span style={{ color: "var(--text-muted)" }}>=</span>
            <span className="text-amber-300">{avgWip}</span>
            <span style={{ color: "var(--text-muted)" }}>&divide;</span>
            <span className="text-amber-300">{avgThroughput}/d</span>
          </div>
        </div>
      )}
    </div>
  );
}
