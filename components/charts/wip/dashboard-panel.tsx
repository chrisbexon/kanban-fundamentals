"use client";

import type { WipWorkItem } from "@/types/wip-game";
import { dashboardMetrics } from "@/lib/stats/wip-game-stats";
import { SLE_DAYS } from "@/lib/constants/wip-game";

interface DashboardPanelProps {
  items: WipWorkItem[];
  currentDay: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  sub?: string;
}

function MetricCard({ label, value, unit, color, sub }: MetricCardProps) {
  return (
    <div
      className="pop-in rounded-xl p-4 text-center"
      style={{ background: `${color}08`, border: `1px solid ${color}15` }}
    >
      <div className="text-2xl font-extrabold font-mono" style={{ color }}>
        {value}
        {unit && <span className="text-sm font-normal ml-0.5" style={{ color: "var(--text-tertiary)" }}>{unit}</span>}
      </div>
      <div className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
      {sub && <div className="text-[8px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

export function DashboardPanel({ items, currentDay }: DashboardPanelProps) {
  const m = dashboardMetrics(items, currentDay);

  const sleColor = m.sleMetPct >= 85 ? "#22c55e" : m.sleMetPct >= 70 ? "#f59e0b" : "#ef4444";
  const wipColor = m.currentWip > 11 ? "#ef4444" : m.currentWip > 8 ? "#f59e0b" : "#3b82f6";
  const ageColor = m.avgAge > SLE_DAYS ? "#ef4444" : m.avgAge > SLE_DAYS * 0.7 ? "#f59e0b" : "#22c55e";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <MetricCard
        label="Avg Cycle Time"
        value={m.avgCycleTime}
        unit="days"
        color="#8b5cf6"
      />
      <MetricCard
        label="85th Percentile"
        value={m.p85CycleTime}
        unit="days"
        color="#f59e0b"
        sub={`SLE target: ${SLE_DAYS}d`}
      />
      <MetricCard
        label="Throughput"
        value={m.avgThroughput}
        unit="/day"
        color="#3b82f6"
      />
      <MetricCard
        label="Current WIP"
        value={m.currentWip}
        color={wipColor}
      />
      <MetricCard
        label="SLE Met"
        value={`${m.sleMetPct}%`}
        color={sleColor}
        sub={`\u2264 ${SLE_DAYS} days`}
      />
      <MetricCard
        label="Avg Item Age"
        value={m.avgAge}
        unit="days"
        color={ageColor}
      />
    </div>
  );
}
