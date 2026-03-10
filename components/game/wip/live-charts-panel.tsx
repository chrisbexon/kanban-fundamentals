"use client";

import type { WipWorkItem, DaySnapshot, WipSettings } from "@/types/wip-game";
import { Card } from "@/components/ui/card";
import { CfdChart } from "@/components/charts/wip/cfd-chart";
import { CtScatterChart } from "@/components/charts/wip/ct-scatter-chart";
import { WipThroughputChart } from "@/components/charts/wip/throughput-chart";
import { AgingWipChart } from "@/components/charts/wip/aging-wip-chart";
import { WipRunChart } from "@/components/charts/wip/wip-run-chart";

interface LiveChartsPanelProps {
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
  settings: WipSettings;
  currentDay: number;
}

function ChartCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</div>
      {desc && <div className="text-xs mb-3.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</div>}
      {children}
    </Card>
  );
}

export function LiveChartsPanel({ items, snapshots, settings, currentDay }: LiveChartsPanelProps) {
  const totalWipLimit = settings.wipLimits.red + settings.wipLimits.blue + settings.wipLimits.green;
  const minDay = snapshots.length > 0 ? snapshots[0].day : 1;

  return (
    <div className="fade-up flex flex-col gap-4 mt-3">
      <ChartCard
        title="Cumulative Flow Diagram"
        desc="Vertical distance between bands = WIP. Horizontal distance = approximate lead time."
      >
        <CfdChart snapshots={snapshots} showLittlesLaw />
      </ChartCard>

      <ChartCard
        title="Cycle Time Scatterplot"
        desc="Each dot is a completed item plotted by the day it finished."
      >
        <CtScatterChart items={items} sleDays={settings.sleDays} />
      </ChartCard>

      <ChartCard
        title="Throughput"
        desc="Daily items completed with 5-day rolling average."
      >
        <WipThroughputChart items={items} minDay={minDay} maxDay={currentDay} />
      </ChartCard>

      <ChartCard
        title="Aging Work In Progress"
        desc="Current age of every in-progress item."
      >
        <AgingWipChart items={items} currentDay={currentDay} sleDays={settings.sleDays} />
      </ChartCard>

      <ChartCard
        title="WIP Run Chart"
        desc="Total WIP over time against your aggregate limit."
      >
        <WipRunChart snapshots={snapshots} totalWipLimit={totalWipLimit} />
      </ChartCard>
    </div>
  );
}
