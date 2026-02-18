"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { throughputPerDay } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface WipThroughputChartProps {
  items: WipWorkItem[];
  minDay: number;
  maxDay: number;
}

export function WipThroughputChart({ items, minDay, maxDay }: WipThroughputChartProps) {
  const data = throughputPerDay(items, minDay, maxDay);
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
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
        <Bar dataKey="count" fill="#3b82f6" fillOpacity={0.6} radius={[2, 2, 0, 0]} name="Daily" />
        <Line type="monotone" dataKey="rollingAvg" stroke="#f59e0b" strokeWidth={2} dot={false} name="5-day Avg" connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
