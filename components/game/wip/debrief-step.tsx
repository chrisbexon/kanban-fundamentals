"use client";

import type { WipWorkItem, DaySnapshot, WipSettings } from "@/types/wip-game";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { DashboardPanel } from "@/components/charts/wip/dashboard-panel";
import { CfdChart } from "@/components/charts/wip/cfd-chart";
import { CtScatterChart } from "@/components/charts/wip/ct-scatter-chart";
import { CtHistogramChart } from "@/components/charts/wip/ct-histogram-chart";
import { WipThroughputChart } from "@/components/charts/wip/throughput-chart";
import { AgingWipChart } from "@/components/charts/wip/aging-wip-chart";
import { FlowEfficiencyChart } from "@/components/charts/wip/flow-efficiency-chart";
import { HeatmapChart } from "@/components/charts/wip/heatmap-chart";
import { WipRunChart } from "@/components/charts/wip/wip-run-chart";
import { MonteCarloChart } from "@/components/charts/wip/monte-carlo-chart";

interface ChartCardProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
}

function ChartCard({ title, desc, children }: ChartCardProps) {
  return (
    <Card>
      <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</div>
      {desc && <div className="text-xs mb-3.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</div>}
      {children}
    </Card>
  );
}

interface WipDebriefStepProps {
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
  settings: WipSettings;
  currentDay: number;
  onNext: () => void;
  onBack: () => void;
}

export function WipDebriefStep({ items, snapshots, settings, currentDay, onNext, onBack }: WipDebriefStepProps) {
  const totalWipLimit = settings.wipLimits.red + settings.wipLimits.blue + settings.wipLimits.green;
  const minDay = snapshots.length > 0 ? snapshots[0].day : 1;
  const backlogCount = items.filter((it) => it.location === "backlog").length;

  return (
    <div className="fade-up max-w-[960px]">
      <StepHeader
        tag="Debrief"
        tagColor="#10b981"
        title="Analysing Your Flow"
        desc="Let's examine what happened on your board. These are the same charts professional Kanban teams use to understand and optimise their systems."
      />

      {/* Dashboard metrics */}
      <div className="mb-5">
        <DashboardPanel items={items} currentDay={currentDay} />
      </div>

      <div className="flex flex-col gap-5">
        {/* CFD */}
        <ChartCard
          title="Cumulative Flow Diagram"
          desc="Each band represents a stage. Parallel bands = steady flow. Widening bands = bottleneck forming. The vertical distance between bands shows WIP."
        >
          <CfdChart snapshots={snapshots} />
        </ChartCard>

        {/* Cycle Time Scatter */}
        <ChartCard
          title="Cycle Time Scatterplot"
          desc="Each dot is a completed item. Percentile lines help set realistic expectations. Items above the SLE line missed the Service Level Expectation."
        >
          <CtScatterChart items={items} />
        </ChartCard>

        {/* Cycle Time Histogram */}
        <ChartCard
          title="Cycle Time Distribution"
          desc="How cycle times are spread. A tight distribution means predictable delivery. A long tail signals outliers and variability."
        >
          <CtHistogramChart items={items} />
        </ChartCard>

        {/* Throughput */}
        <ChartCard
          title="Throughput"
          desc="Daily items completed (bars) with a 5-day rolling average (line). Stable throughput is a sign of a healthy system."
        >
          <WipThroughputChart items={items} minDay={minDay} maxDay={currentDay} />
        </ChartCard>

        {/* Aging WIP */}
        <ChartCard
          title="Aging Work In Progress"
          desc="Current age of every in-progress item. Items approaching the red SLE line need attention before they become outliers."
        >
          <AgingWipChart items={items} currentDay={currentDay} />
        </ChartCard>

        {/* Flow Efficiency */}
        <ChartCard
          title="Flow Efficiency"
          desc="For each completed item: green = time spent being worked on, red = time spent waiting. Low efficiency means most time is spent in queues."
        >
          <FlowEfficiencyChart items={items} />
        </ChartCard>

        {/* Heat Map */}
        <ChartCard
          title="WIP Heat Map"
          desc="Item count by stage over time. Hot spots reveal where work accumulated. Cool spots show underutilised capacity."
        >
          <HeatmapChart snapshots={snapshots} />
        </ChartCard>

        {/* WIP Run Chart */}
        <ChartCard
          title="WIP Run Chart"
          desc="Total work in progress over time with the aggregate WIP limit reference. Staying below the limit creates predictable flow."
        >
          <WipRunChart snapshots={snapshots} totalWipLimit={totalWipLimit} />
        </ChartCard>

        {/* Monte Carlo: How Many */}
        <ChartCard
          title="Monte Carlo: How Many in 15 Days?"
          desc="Using your historical throughput, how many items could be completed in the next 15 days? Based on 500 simulations."
        >
          <MonteCarloChart items={items} mode="howMany" daysOrTarget={15} />
        </ChartCard>

        {/* Monte Carlo: When */}
        <ChartCard
          title={`Monte Carlo: When Will ${backlogCount} Backlog Items Be Done?`}
          desc={`How many days to complete the current ${backlogCount} backlog items? Based on 500 simulations.`}
        >
          <MonteCarloChart items={items} mode="when" daysOrTarget={Math.max(backlogCount, 5)} />
        </ChartCard>

        {/* Insight */}
        <Card accent="139,92,246">
          <div className="text-sm font-bold text-violet-400 mb-2.5">The Kanban Principle</div>
          <div className="text-[13px] text-violet-300 leading-[1.75]">
            <strong>Limit work in progress to limit lead time.</strong> The charts above demonstrate
            that controlling WIP is the single most powerful lever for improving flow. Less WIP means
            shorter queues, faster feedback, earlier delivery, and more predictable outcomes. This is
            why WIP limits are the <em>defining practice</em> of the Kanban Method.
          </div>
        </Card>
      </div>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Simulation</Btn>
        <Btn primary onClick={onNext}>Take the Quiz &rarr;</Btn>
      </div>
    </div>
  );
}
