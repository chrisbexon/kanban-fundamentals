"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WipWorkItem } from "@/types/wip-game";
import { flowEfficiency } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface FlowEfficiencyChartProps {
  items: WipWorkItem[];
}

export function FlowEfficiencyChart({ items }: FlowEfficiencyChartProps) {
  const data = flowEfficiency(items);
  if (data.length === 0) return <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No completed items yet</div>;

  const avgEff = Math.round(data.reduce((s, d) => s + d.efficiency, 0) / data.length);

  return (
    <div>
      <div className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)" }}>
        Average flow efficiency: <span className="font-bold text-violet-400">{avgEff}%</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="itemId"
            stroke={CHART_AXIS}
            tick={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}
            label={{ value: "Work Item", position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
          <Tooltip {...CHART_TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Bar dataKey="workTime" stackId="1" fill="#22c55e" fillOpacity={0.7} name="Work Time" radius={[0, 0, 0, 0]} />
          <Bar dataKey="waitTime" stackId="1" fill="#ef4444" fillOpacity={0.5} name="Wait Time" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
