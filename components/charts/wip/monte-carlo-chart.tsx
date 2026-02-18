"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { monteCarloHowMany, monteCarloWhen } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TICK_SM, CHART_LABEL } from "@/lib/chart-theme";

interface MonteCarloChartProps {
  items: WipWorkItem[];
  mode: "howMany" | "when";
  daysOrTarget: number;
}

export function MonteCarloChart({ items, mode, daysOrTarget }: MonteCarloChartProps) {
  const data = mode === "howMany"
    ? monteCarloHowMany(items, daysOrTarget, 500)
    : monteCarloWhen(items, daysOrTarget, 500);

  if (data.length === 0) {
    return <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>Not enough data for Monte Carlo simulation</div>;
  }

  // Find percentile markers
  const p50 = data.find((d) => d.cumPct >= 50)?.bucket ?? 0;
  const p85 = data.find((d) => d.cumPct >= 85)?.bucket ?? 0;
  const p95 = data.find((d) => d.cumPct >= 95)?.bucket ?? 0;

  const xLabel = mode === "howMany" ? "Items Completed" : "Days Needed";

  return (
    <div>
      <div className="flex gap-3 mb-2 text-[10px]">
        <span className="text-blue-400">50th: <strong>{p50}</strong></span>
        <span className="text-amber-400">85th: <strong>{p85}</strong></span>
        <span className="text-red-400">95th: <strong>{p95}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="bucket"
            stroke={CHART_AXIS}
            tick={CHART_TICK_SM}
            label={{ value: xLabel, position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
          <Tooltip {...CHART_TOOLTIP} formatter={(value: number, name: string) => [value, name === "count" ? "Simulations" : name]} />
          <ReferenceLine x={p50} stroke="#3b82f640" strokeDasharray="4 4" />
          <ReferenceLine x={p85} stroke="#f59e0b40" strokeDasharray="4 4" />
          <ReferenceLine x={p95} stroke="#ef444440" strokeDasharray="4 4" />
          <Bar dataKey="count" fill="#8b5cf6" fillOpacity={0.6} radius={[2, 2, 0, 0]} name="Simulations" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
