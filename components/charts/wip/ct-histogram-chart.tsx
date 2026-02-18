"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { cycleTimeHistogram } from "@/lib/stats/wip-game-stats";
import { SLE_DAYS } from "@/lib/constants/wip-game";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface CtHistogramChartProps {
  items: WipWorkItem[];
}

export function CtHistogramChart({ items }: CtHistogramChartProps) {
  const data = cycleTimeHistogram(items);
  if (data.length === 0) return <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No completed items yet</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis
          dataKey="bucket"
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          label={{ value: "Cycle Time (days)", position: "insideBottom", offset: -8, style: CHART_LABEL }}
        />
        <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
        <Tooltip {...CHART_TOOLTIP} />
        <ReferenceLine x={SLE_DAYS} stroke="#22c55e40" strokeDasharray="4 4" label={{ value: "SLE", position: "top", style: { fontSize: 9, fill: "#22c55e" } }} />
        <Bar dataKey="count" fill="#8b5cf6" fillOpacity={0.7} radius={[3, 3, 0, 0]} name="Items" />
      </BarChart>
    </ResponsiveContainer>
  );
}
