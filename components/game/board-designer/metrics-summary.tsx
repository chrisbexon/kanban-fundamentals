"use client";

import React from "react";
import type { BoardState } from "@/types/board";
import { dashboardMetrics } from "@/lib/stats/board-stats";

interface MetricsSummaryProps {
  boardState: BoardState;
}

export function MetricsSummary({ boardState }: MetricsSummaryProps) {
  const { definition, items, currentDay } = boardState;
  const m = dashboardMetrics(items, definition, currentDay);
  const doneCount = items.filter((it) => it.doneDay !== null).length;

  if (doneCount === 0) {
    return (
      <div className="text-[11px] text-center py-6" style={{ color: "var(--text-muted)" }}>
        Run a few rounds to see flow metrics here.
      </div>
    );
  }

  const metrics = [
    { label: "Avg Cycle Time", value: `${m.avgCycleTime}d`, color: "#8b5cf6" },
    { label: "P85 Cycle Time", value: `${m.p85CycleTime}d`, color: "#8b5cf6" },
    { label: "Avg Throughput", value: `${m.avgThroughput}/d`, color: "#3b82f6" },
    { label: "Current WIP", value: `${m.currentWip}`, color: "#f59e0b" },
    { label: "Avg Age", value: `${m.avgAge}d`, color: m.avgAge > definition.settings.sleDays ? "#ef4444" : "#22c55e" },
    { label: "SLE Met", value: `${m.sleMetPct}%`, color: m.sleMetPct >= definition.settings.slePercentile ? "#22c55e" : "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-lg p-2 text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}>
          <div className="text-[16px] font-extrabold font-mono" style={{ color: metric.color }}>
            {metric.value}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
}
