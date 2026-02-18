"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import type { SimulationRun } from "@/types/penny-game";
import { getBatchColor } from "@/lib/constants/penny-game";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface CycleTimeChartProps {
  runs: SimulationRun[];
}

export function CycleTimeChart({ runs }: CycleTimeChartProps) {
  const cyD = runs.map((r) => ({
    name: `Batch ${r.bs}`,
    bs: r.bs,
    ct: parseFloat(r.ac),
    wt: parseFloat(r.aw),
    color: getBatchColor(r.bs),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={cyD} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis
          dataKey="name"
          stroke={CHART_AXIS}
          tick={CHART_TICK}
        />
        <YAxis
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          label={{ value: "Ticks", angle: -90, position: "insideLeft", style: CHART_LABEL }}
        />
        <Tooltip {...CHART_TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="ct" name="Cycle Time" radius={[4, 4, 0, 0] as [number, number, number, number]}>
          {cyD.map((d, i) => (
            <Cell key={i} fill={d.color} fillOpacity={0.75} />
          ))}
        </Bar>
        <Bar dataKey="wt" name="Wait Time" radius={[4, 4, 0, 0] as [number, number, number, number]}>
          {cyD.map((_, i) => (
            <Cell key={i} fill="#ef4444" fillOpacity={0.45} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
