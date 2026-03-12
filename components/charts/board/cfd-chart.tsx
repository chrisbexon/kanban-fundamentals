"use client";

/**
 * Cumulative Flow Diagram for Board Designer
 *
 * Stacked area chart showing cumulative item counts per column over time.
 * Dynamic columns derived from board definition (not hardcoded).
 */

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { BoardDefinition, BoardSnapshot } from "@/types/board";
import { cfdData } from "@/lib/stats/board-stats";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface BoardCfdChartProps {
  snapshots: BoardSnapshot[];
  definition: BoardDefinition;
  swimlaneId?: string;
  height?: number;
}

export function BoardCfdChart({ snapshots, definition, swimlaneId, height = 240 }: BoardCfdChartProps) {
  const data = cfdData(snapshots, definition, swimlaneId);
  if (data.length < 2) return null;

  // Build areas in reverse column order (first column = top of stack = drawn last)
  const cols = [...definition.columns].reverse();

  return (
    <ResponsiveContainer width="100%" height={height}>
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
        {cols.map((col) => (
          <Area
            key={col.id}
            type="monotone"
            dataKey={col.id}
            stackId="1"
            stroke={col.color}
            fill={`${col.color}20`}
            name={col.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
