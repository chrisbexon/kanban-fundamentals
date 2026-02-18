"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { agingWip } from "@/lib/stats/wip-game-stats";
import { SLE_DAYS, COLUMN_DEFS } from "@/lib/constants/wip-game";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TICK_SM, CHART_LABEL } from "@/lib/chart-theme";

interface AgingWipChartProps {
  items: WipWorkItem[];
  currentDay: number;
}

export function AgingWipChart({ items, currentDay }: AgingWipChartProps) {
  const data = agingWip(items, currentDay);
  if (data.length === 0) return <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No items in progress</div>;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
        <XAxis
          type="number"
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          label={{ value: "Age (days)", position: "insideBottom", offset: -2, style: CHART_LABEL }}
        />
        <YAxis
          dataKey="itemId"
          type="category"
          stroke={CHART_AXIS}
          tick={CHART_TICK_SM}
          width={45}
        />
        <Tooltip {...CHART_TOOLTIP} formatter={(value: number) => [`${value} days`, "Age"]} />
        <ReferenceLine x={SLE_DAYS} stroke="#ef444440" strokeDasharray="4 4" label={{ value: "SLE", position: "top", style: { fontSize: 9, fill: "#ef4444" } }} />
        <Bar dataKey="age" radius={[0, 3, 3, 0]} name="Age">
          {data.map((entry, i) => {
            const col = COLUMN_DEFS.find((c) => c.location === entry.location);
            const color = entry.age > SLE_DAYS ? "#ef4444" : entry.age > SLE_DAYS * 0.7 ? "#f59e0b" : (col?.color ?? "#3b82f6");
            return <Cell key={i} fill={color} fillOpacity={0.7} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
