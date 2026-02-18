"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { cycleTimeScatter } from "@/lib/stats/wip-game-stats";
import { SLE_DAYS } from "@/lib/constants/wip-game";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface CtScatterChartProps {
  items: WipWorkItem[];
}

export function CtScatterChart({ items }: CtScatterChartProps) {
  const data = cycleTimeScatter(items);
  if (data.length === 0) return <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No completed items yet</div>;

  const cts = data.map((d) => d.cycleTime);
  const sorted = [...cts].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
  const p85 = sorted[Math.floor(sorted.length * 0.85)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
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
        <Tooltip {...CHART_TOOLTIP} formatter={(value: number, name: string) => [value, name === "cycleTime" ? "Cycle Time" : name]} />
        <ReferenceLine y={p50} stroke="#3b82f630" strokeDasharray="4 4" label={{ value: `p50: ${p50}d`, position: "right", style: { fontSize: 9, fill: "#3b82f6" } }} />
        <ReferenceLine y={p85} stroke="#f59e0b30" strokeDasharray="4 4" label={{ value: `p85: ${p85}d`, position: "right", style: { fontSize: 9, fill: "#f59e0b" } }} />
        <ReferenceLine y={p95} stroke="#ef444430" strokeDasharray="4 4" label={{ value: `p95: ${p95}d`, position: "right", style: { fontSize: 9, fill: "#ef4444" } }} />
        <ReferenceLine y={SLE_DAYS} stroke="#22c55e30" strokeDasharray="6 3" label={{ value: `SLE: ${SLE_DAYS}d`, position: "right", style: { fontSize: 9, fill: "#22c55e" } }} />
        <Scatter data={data} fill="#8b5cf6" fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
