"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import type { FlowPoint } from "@/types/littles-law";
import { TICKS_PER_SECOND } from "@/lib/constants/littles-law";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_LABEL } from "@/lib/chart-theme";

interface FlowChartProps {
  flowData: FlowPoint[];
  avgCycleTimeSec: number;
}

export function FlowChart({ flowData, avgCycleTimeSec }: FlowChartProps) {
  // Convert to minutes for display
  const data = flowData.map((p) => ({
    time: Math.round(p.tick / TICKS_PER_SECOND / 6) / 10, // minutes with 1 decimal
    arrivals: p.arrivals,
    departures: p.departures,
    wip: p.wip,
  }));

  if (data.length < 2) {
    return (
      <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
        Start the simulation to see the flow chart
      </div>
    );
  }

  // Find a representative point to annotate WIP gap
  const midIdx = Math.floor(data.length * 0.6);
  const midPoint = data[midIdx];

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="time"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Time (minutes)", position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK} label={{ value: "Cumulative Count", angle: -90, position: "insideLeft", style: CHART_LABEL }} />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = { arrivals: "Arrivals", departures: "Departures", wip: "WIP" };
              return [value, labels[name] ?? name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Line type="monotone" dataKey="arrivals" stroke="#3b82f6" strokeWidth={2} dot={false} name="Arrivals" />
          <Line type="monotone" dataKey="departures" stroke="#22c55e" strokeWidth={2} dot={false} name="Departures" />
        </LineChart>
      </ResponsiveContainer>

      {/* Annotation explaining the chart */}
      <div
        className="mt-2 rounded-lg px-3 py-2 flex flex-wrap gap-4 items-center text-[11px]"
        style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] rounded" style={{ background: "#3b82f6" }} />
          <span style={{ color: "var(--text-secondary)" }}>Arrival rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] rounded" style={{ background: "#22c55e" }} />
          <span style={{ color: "var(--text-secondary)" }}>Departure rate (throughput)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: "var(--text-muted)" }}>&uarr;&darr;</span>
          <span style={{ color: "var(--text-secondary)" }}>Vertical gap = <strong className="text-blue-400">WIP</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: "var(--text-muted)" }}>&larr;&rarr;</span>
          <span style={{ color: "var(--text-secondary)" }}>Horizontal gap &asymp; <strong className="text-amber-400">Avg Cycle Time</strong></span>
        </div>
      </div>
    </div>
  );
}
