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
  roundHistories?: { round: number; items: WipWorkItem[]; settings: WipSettings }[];
  onNext: () => void;
  onBack: () => void;
}

function RoundComparisonCard({ roundHistories }: { roundHistories: { round: number; items: WipWorkItem[]; settings: WipSettings }[] }) {
  if (roundHistories.length === 0) return null;

  const roundStats = roundHistories.map((rh) => {
    const done = rh.items.filter((it) => it.location === "done" && it.dayStarted && it.dayDone);
    const avgCt = done.length > 0
      ? done.reduce((s, it) => s + (it.dayDone! - it.dayStarted!), 0) / done.length
      : 0;
    const totalWipLimit = rh.settings.wipLimits.red + rh.settings.wipLimits.blue + rh.settings.wipLimits.green;
    return {
      round: rh.round,
      delivered: done.length,
      avgCycleTime: avgCt,
      wipLimit: totalWipLimit,
      limits: rh.settings.wipLimits,
    };
  });

  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b"];

  return (
    <div
      className="rounded-xl p-4 mb-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Round Comparison
      </div>
      <div className="grid grid-cols-3 gap-3">
        {roundStats.map((rs, i) => (
          <div
            key={rs.round}
            className="rounded-lg p-3 text-center"
            style={{ background: `${colors[i]}08`, border: `1px solid ${colors[i]}20` }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors[i] }}>
              Round {rs.round}
            </div>
            <div className="text-xl font-extrabold font-mono" style={{ color: colors[i] }}>
              {rs.delivered}
            </div>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>items delivered</div>
            <div className="text-sm font-bold font-mono mt-1" style={{ color: "var(--text-secondary)" }}>
              {rs.avgCycleTime.toFixed(1)}d
            </div>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>avg cycle time</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: "var(--text-tertiary)" }}>
              WIP: {rs.limits.red}/{rs.limits.blue}/{rs.limits.green}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WipDebriefStep({ items, snapshots, settings, currentDay, roundHistories, onNext, onBack }: WipDebriefStepProps) {
  const totalWipLimit = settings.wipLimits.red + settings.wipLimits.blue + settings.wipLimits.green;
  const minDay = snapshots.length > 0 ? snapshots[0].day : 1;
  const backlogCount = items.filter((it) => it.location === "backlog").length;

  return (
    <div className="fade-up max-w-[960px]">
      <StepHeader
        tag="Debrief"
        tagColor="#10b981"
        title="Analysing Your Flow Across Three Rounds"
        desc="Let's compare how your approach evolved. Same board, same seed data — the only difference was your strategy."
      />

      {/* Round comparison card */}
      {roundHistories && roundHistories.length > 0 && (
        <RoundComparisonCard roundHistories={roundHistories} />
      )}

      {/* Dashboard metrics */}
      <div className="mb-5">
        <DashboardPanel items={items} currentDay={currentDay} sleDays={settings.sleDays} />
      </div>

      <div className="flex flex-col gap-5">
        {/* CFD */}
        <ChartCard
          title="Cumulative Flow Diagram"
          desc="Each band represents a stage. Parallel bands = steady flow. Widening bands = bottleneck forming. The vertical distance between bands shows WIP."
        >
          <CfdChart snapshots={snapshots} showLittlesLaw />
        </ChartCard>

        {/* Cycle Time Scatter */}
        <ChartCard
          title="Cycle Time Scatterplot"
          desc="Each dot is a completed item. Percentile lines help set realistic expectations. Items above the SLE line missed the Service Level Expectation."
        >
          <CtScatterChart items={items} sleDays={settings.sleDays} />
        </ChartCard>

        {/* Cycle Time Histogram */}
        <ChartCard
          title="Cycle Time Distribution"
          desc="How cycle times are spread. A tight distribution means predictable delivery. A long tail signals outliers and variability."
        >
          <CtHistogramChart items={items} sleDays={settings.sleDays} />
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
          <AgingWipChart items={items} currentDay={currentDay} sleDays={settings.sleDays} />
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

        {/* Forecasting intro */}
        <Card accent="59,130,246">
          <div className="text-sm font-bold text-blue-400 mb-2">Why Is Forecasting Hard?</div>
          <div className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
            Knowledge work is full of surprises. Blockers appear, priorities shift, people are
            off sick, requirements change mid-flow. With so many unknown variables, <strong style={{ color: "var(--text-primary)" }}>promising
            a fixed date is a guess dressed up as a guarantee</strong>.
          </div>
          <div className="text-[13px] leading-[1.75] mt-2" style={{ color: "var(--text-secondary)" }}>
            Monte Carlo simulation takes a different approach. Instead of guessing, it
            asks: <em>&ldquo;Given how work has actually flowed through our system so far, what range of
            outcomes is realistic?&rdquo;</em> It runs hundreds of &ldquo;what if&rdquo; scenarios using your
            real throughput data and shows you the spread of likely results.
          </div>
          <div className="text-[13px] leading-[1.75] mt-2" style={{ color: "var(--text-secondary)" }}>
            This changes the conversation with stakeholders from <strong style={{ color: "#ef4444" }}>&ldquo;It will
            be done on the 15th&rdquo;</strong> to <strong style={{ color: "#22c55e" }}>&ldquo;There&apos;s
            an 85% chance we&apos;ll have this by the 15th&rdquo;</strong> &mdash; honest, data-driven, and
            far more useful for decision-making.
          </div>
        </Card>

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
