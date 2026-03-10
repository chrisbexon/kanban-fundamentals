"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { MCBucket, MCMode } from "@/types/flow-metrics";
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TICK_SM, CHART_LABEL } from "@/lib/chart-theme";

// Confidence-level colours (consistent across both modes)
// Higher confidence = greener (safer forecast)
const C50 = "#3b82f6";  // blue  — coin flip
const C85 = "#f59e0b";  // amber — good forecast
const C95 = "#22c55e";  // green — high confidence

interface MCDistributionChartProps {
  buckets: MCBucket[];
  mode: MCMode;
  p50: number;
  p85: number;
  p95: number;
  targetItems?: number;
  forecastDays?: number;
}

export function MCDistributionChart({ buckets, mode, p50, p85, p95, targetItems, forecastDays }: MCDistributionChartProps) {
  if (buckets.length === 0) {
    return (
      <div className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
        Not enough throughput data for Monte Carlo simulation
      </div>
    );
  }

  const xLabel = mode === "howMany" ? "Items Completed" : "Days Needed";
  const unit = mode === "howMany" ? "items" : "days";

  const interpretation = mode === "when"
    ? `There's an 85% chance the ${targetItems} items will be done within ${p85} days. The 50/50 estimate is ${p50} days, and a conservative 95% forecast gives ${p95} days.`
    : `In ${forecastDays} days, there's an 85% chance of completing at least ${p85} items. The 50/50 estimate is ${p50} items, and a very conservative 95% gives at least ${p95} items.`;

  return (
    <div>
      {/* Percentile summary with plain-language hints */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: C95 }} />
          <span className="text-[11px] font-mono" style={{ color: C95 }}>
            95%: <strong>{p95}</strong> {unit}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-dimmer)" }}>&mdash; high confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: C85 }} />
          <span className="text-[11px] font-mono" style={{ color: C85 }}>
            85%: <strong>{p85}</strong> {unit}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-dimmer)" }}>&mdash; good forecast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: C50 }} />
          <span className="text-[11px] font-mono" style={{ color: C50 }}>
            50%: <strong>{p50}</strong> {unit}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-dimmer)" }}>&mdash; coin flip</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={buckets} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="bucket"
            stroke={CHART_AXIS}
            tick={CHART_TICK_SM}
            label={{ value: xLabel, position: "insideBottom", offset: -8, style: CHART_LABEL }}
          />
          <YAxis stroke={CHART_AXIS} tick={CHART_TICK} />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value: number, name: string) => {
              if (name === "Simulations") return [value, name];
              return [value, name];
            }}
            labelFormatter={(label) => `${xLabel}: ${label}`}
          />
          <ReferenceLine x={p95} stroke={C95} strokeWidth={2} strokeDasharray="6 4" label={{ value: "95%", position: "top", fill: C95, fontSize: 10 }} />
          <ReferenceLine x={p85} stroke={C85} strokeWidth={2} strokeDasharray="6 4" label={{ value: "85%", position: "top", fill: C85, fontSize: 10 }} />
          <ReferenceLine x={p50} stroke={C50} strokeWidth={2} strokeDasharray="6 4" label={{ value: "50%", position: "top", fill: C50, fontSize: 10 }} />
          <Bar dataKey="count" fill="#8b5cf6" fillOpacity={0.6} radius={[2, 2, 0, 0]} name="Simulations" />
        </BarChart>
      </ResponsiveContainer>
      <div
        className="mt-2.5 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "var(--text-secondary)" }}
      >
        {interpretation}
      </div>
    </div>
  );
}
