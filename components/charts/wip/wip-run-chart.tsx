"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from "recharts";
import type { DaySnapshot } from "@/types/wip-game";
import { wipRunChart } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface WipRunChartProps {
  snapshots: DaySnapshot[];
  totalWipLimit: number;
}

export function WipRunChart({ snapshots, totalWipLimit }: WipRunChartProps) {
  const data = wipRunChart(snapshots, totalWipLimit);
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
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
        <Line type="monotone" dataKey="wip" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Total WIP" />
        <ReferenceLine y={totalWipLimit} stroke="#ef444440" strokeDasharray="6 3" label={{ value: `Limit: ${totalWipLimit}`, position: "right", style: { fontSize: 9, fill: "#ef4444" } }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
