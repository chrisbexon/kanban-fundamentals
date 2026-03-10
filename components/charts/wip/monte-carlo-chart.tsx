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

  // Build plain-language interpretation
  const interpretation = mode === "howMany"
    ? `Based on your throughput so far, there's an 85% chance your team will complete at least **${p85} items** in the next ${daysOrTarget} days. A coin-flip estimate (50%) gives ${p50} items, and if things go well (95%) you could reach ${p95}.`
    : `There's an 85% chance your team will finish these items within **${p85} days**. The most likely outcome (50%) is around ${p50} days, and in the worst case (95%) it could take up to ${p95} days.`;

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
      <div
        className="mt-2.5 rounded-lg px-3 py-2 text-xs leading-relaxed"
        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "var(--text-secondary)" }}
      >
        {interpretation}
      </div>
    </div>
  );
}
