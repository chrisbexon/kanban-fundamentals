"use client";

import { useMemo } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ThroughputDay } from "@/types/flow-metrics";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TICK_SM, CHART_LABEL } from "@/lib/chart-theme";

interface FlowThroughputChartProps {
  data: ThroughputDay[];
}

export function FlowThroughputChart({ data }: FlowThroughputChartProps) {
  const chartData = useMemo(() => {
    const window = 7;
    return data.map((d, i) => {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      const avg = slice.reduce((s, x) => s + x.count, 0) / slice.length;
      return {
        date: d.date.slice(5), // MM-DD
        fullDate: d.date,
        count: d.count,
        rollingAvg: Math.round(avg * 100) / 100,
      };
    });
  }, [data]);

  if (data.length === 0) return null;

  // Show every Nth label to avoid overcrowding
  const interval = Math.max(1, Math.floor(chartData.length / 15));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis
          dataKey="date"
          stroke={CHART_AXIS}
          tick={CHART_TICK_SM}
          interval={interval}
          label={{ value: "Date", position: "insideBottom", offset: -8, style: CHART_LABEL }}
        />
        <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
        <Tooltip
          {...CHART_TOOLTIP}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload;
            return item?.fullDate || label;
          }}
        />
        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        <Bar dataKey="count" fill="#3b82f6" fillOpacity={0.5} radius={[2, 2, 0, 0]} name="Daily" />
        <Line type="monotone" dataKey="rollingAvg" stroke="#f59e0b" strokeWidth={2} dot={false} name="7-day Avg" connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
