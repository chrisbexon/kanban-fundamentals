"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { GameSnapshot } from "@/types/penny-game";
import { TOTAL_ITEMS, getBatchColor } from "@/lib/constants/penny-game";
import { throughputData } from "@/lib/stats/penny-game-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface ThroughputChartProps {
  snaps: GameSnapshot[];
}

export function ThroughputChart({ snaps }: ThroughputChartProps) {
  const maxT = Math.max(...snaps.map((s) => s.ticks), 1);
  const tpSeries = snaps.map((s) => ({
    bs: s.bs,
    data: throughputData(s.items, s.ticks),
    color: getBatchColor(s.bs),
  }));

  const merged: Record<string, number>[] = [];
  for (let t = 0; t <= maxT; t++) {
    const pt: Record<string, number> = { tick: t };
    tpSeries.forEach((s, i) => {
      const d = s.data.find((d) => d.tick === t);
      pt[`b${s.bs}_${i}`] = d ? d.done : t > (s.data[s.data.length - 1]?.tick ?? 0) ? TOTAL_ITEMS : 0;
    });
    merged.push(pt);
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={merged} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis
          dataKey="tick"
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          label={{ value: "Tick", position: "insideBottom", offset: -8, style: CHART_LABEL }}
        />
        <YAxis
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          domain={[0, TOTAL_ITEMS]}
        />
        <Tooltip {...CHART_TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {tpSeries.map((s, i) => (
          <Line
            key={i}
            type="stepAfter"
            dataKey={`b${s.bs}_${i}`}
            stroke={s.color}
            strokeWidth={2.5}
            dot={false}
            name={`Batch ${s.bs}`}
          />
        ))}
        <ReferenceLine y={TOTAL_ITEMS} stroke="#22c55e1a" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}
