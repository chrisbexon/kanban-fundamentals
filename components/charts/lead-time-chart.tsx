"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK_SM, CHART_LABEL_SM } from "@/lib/chart-theme";

interface LeadTimeChartProps {
  batchSize: number;
  cycleTimes: number[];
  color: string;
}

export function LeadTimeChart({ batchSize, cycleTimes, color }: LeadTimeChartProps) {
  const mn = Math.min(...cycleTimes);
  const mx = Math.max(...cycleTimes);
  const buckets: { value: number; count: number }[] = [];
  for (let v = mn; v <= mx; v++) {
    buckets.push({ value: v, count: cycleTimes.filter((c) => c === v).length });
  }

  return (
    <div className="flex-[1_1_240px] min-w-0">
      <div className="text-[11px] font-bold mb-2 text-center" style={{ color }}>
        Batch {batchSize}
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={buckets} margin={{ top: 5, right: 5, bottom: 15, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="value"
            stroke={CHART_AXIS}
            tick={CHART_TICK_SM}
            label={{ value: "Lead Time", position: "insideBottom", offset: -6, style: CHART_LABEL_SM }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK_SM} allowDecimals={false} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="count" name="Items" radius={[3, 3, 0, 0] as [number, number, number, number]}>
            {buckets.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.65} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
