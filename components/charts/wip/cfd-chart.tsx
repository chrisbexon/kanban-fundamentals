"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DaySnapshot } from "@/types/wip-game";
import { cfdData } from "@/lib/stats/wip-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface CfdChartProps {
  snapshots: DaySnapshot[];
}

export function CfdChart({ snapshots }: CfdChartProps) {
  const data = cfdData(snapshots);
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
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
        <Area type="monotone" dataKey="done" stackId="1" stroke="#a3e635" fill="#a3e63520" name="Done" />
        <Area type="monotone" dataKey="green" stackId="1" stroke="#22c55e" fill="#22c55e20" name="Green" />
        <Area type="monotone" dataKey="blueFinished" stackId="1" stroke="#60a5fa" fill="#60a5fa15" name="Blue Fin" />
        <Area type="monotone" dataKey="blueActive" stackId="1" stroke="#3b82f6" fill="#3b82f620" name="Blue Act" />
        <Area type="monotone" dataKey="redFinished" stackId="1" stroke="#f87171" fill="#f8717115" name="Red Fin" />
        <Area type="monotone" dataKey="redActive" stackId="1" stroke="#ef4444" fill="#ef444420" name="Red Act" />
        <Area type="monotone" dataKey="backlog" stackId="1" stroke="#64748b" fill="#64748b15" name="Backlog" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
