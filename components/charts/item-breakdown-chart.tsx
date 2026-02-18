"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ItemBreakdownData } from "@/types/penny-game";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK_SM, CHART_LABEL_SM } from "@/lib/chart-theme";

interface ItemBreakdownChartProps {
  label: string;
  data: ItemBreakdownData[];
  color: string;
}

export function ItemBreakdownChart({ label, data, color }: ItemBreakdownChartProps) {
  return (
    <div className="flex-[1_1_280px] min-w-0">
      <div className="text-[11px] font-bold mb-2 text-center" style={{ color }}>
        {label}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 15, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="id"
            stroke={CHART_AXIS}
            tick={CHART_TICK_SM}
            label={{ value: "Coin #", position: "insideBottom", offset: -6, style: CHART_LABEL_SM }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK_SM} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="workTime" name="Work" stackId="a" fill="#22c55e" fillOpacity={0.65} />
          <Bar dataKey="waitTime" name="Wait" stackId="a" fill="#ef4444" fillOpacity={0.45} radius={[3, 3, 0, 0] as [number, number, number, number]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
