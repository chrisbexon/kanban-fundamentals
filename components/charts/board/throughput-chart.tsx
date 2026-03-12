"use client";

/**
 * Throughput Run Chart for Board Designer
 *
 * Bar chart of daily throughput with a rolling 5-day average line.
 */

import React from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { BoardWorkItem } from "@/types/board";
import { throughputPerDay } from "@/lib/stats/board-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface BoardThroughputChartProps {
  items: BoardWorkItem[];
  currentDay: number;
  height?: number;
}

export function BoardThroughputChart({ items, currentDay, height = 240 }: BoardThroughputChartProps) {
  const data = throughputPerDay(items, 1, currentDay);
  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
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
