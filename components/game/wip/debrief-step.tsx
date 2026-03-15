"use client";

import type { WipWorkItem, DaySnapshot, WipSettings } from "@/types/wip-game";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { CfdChart } from "@/components/charts/wip/cfd-chart";
import { CtScatterChart } from "@/components/charts/wip/ct-scatter-chart";
import { CtHistogramChart } from "@/components/charts/wip/ct-histogram-chart";
import { WipThroughputChart } from "@/components/charts/wip/throughput-chart";
import { AgingWipChart } from "@/components/charts/wip/aging-wip-chart";
import { WipAgingByStateChart } from "@/components/charts/wip/aging-by-state-chart";
import { FlowEfficiencyChart } from "@/components/charts/wip/flow-efficiency-chart";
import { HeatmapChart } from "@/components/charts/wip/heatmap-chart";
import { WipRunChart } from "@/components/charts/wip/wip-run-chart";
import { MonteCarloChart } from "@/components/charts/wip/monte-carlo-chart";

interface RoundData {
  round: number;
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
  settings: WipSettings;
}

interface WipDebriefStepProps {
  /** Combined items across all rounds (for Monte Carlo / overall stats) */
  items: WipWorkItem[];
  /** Combined snapshots across all rounds */
  snapshots: DaySnapshot[];
  settings: WipSettings;
  currentDay: number;
  /** Current round's items only (Round 3) */
  currentRoundItems: WipWorkItem[];
  /** Current round's snapshots only (Round 3) */
  currentRoundSnapshots: DaySnapshot[];
  roundHistories?: RoundData[];
  onNext: () => void;
  onBack: () => void;
}

const ROUND_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];

function computeRoundStats(rh: RoundData) {
  const done = rh.items.filter((it) => it.location === "done" && it.dayStarted && it.dayDone);
  const avgCt = done.length > 0
    ? done.reduce((s, it) => s + (it.dayDone! - it.dayStarted!), 0) / done.length
    : 0;
  return {
    round: rh.round,
    delivered: done.length,
    avgCycleTime: avgCt,
    limits: rh.settings.wipLimits,
  };
}

/** Section header for each chart row */
function ChartRowHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-2 mt-6 first:mt-0">
      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</div>
      {desc && <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</div>}
    </div>
  );
}

/** A single round column header */
function RoundLabel({ round, color }: { round: number; color: string }) {
  return (
    <div className="text-[10px] font-bold text-center mb-1 uppercase tracking-wider" style={{ color }}>
      Round {round}
    </div>
  );
}

export function WipDebriefStep({
  items, snapshots, settings, currentDay,
  currentRoundItems, currentRoundSnapshots,
  roundHistories, onNext, onBack,
}: WipDebriefStepProps) {
  const backlogCount = items.filter((it) => it.location === "backlog").length;

  // Build complete 3-round list: rounds 1 & 2 from history, round 3 from current props
  const allRounds: RoundData[] = [
    ...(roundHistories ?? []),
    {
      round: (roundHistories?.length ?? 0) + 1,
      items: currentRoundItems,
      snapshots: currentRoundSnapshots,
      settings,
    },
  ];

  const roundStats = allRounds.map(computeRoundStats);

  return (
    <div className="fade-up max-w-[1200px]">
      <StepHeader
        tag="Debrief"
        tagColor="#10b981"
        title="Analysing Your Flow Across Three Rounds"
        desc="Compare how your approach evolved. Same board, same seed data — the only difference was your strategy."
      />

      {/* ── Round Comparison Stats ────────────────────── */}
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
              style={{ background: `${ROUND_COLORS[i]}08`, border: `1px solid ${ROUND_COLORS[i]}20` }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: ROUND_COLORS[i] }}>
                Round {rs.round}
              </div>
              <div className="text-xl font-extrabold font-mono" style={{ color: ROUND_COLORS[i] }}>
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

      {/* ── Side-by-Side Charts ──────────────────────── */}

      {/* CFD */}
      <ChartRowHeader
        title="Cumulative Flow Diagram"
        desc="Each band represents a stage. Parallel bands = steady flow. Widening bands = bottleneck forming."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => (
          <Card key={rd.round}>
            <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
            <CfdChart snapshots={rd.snapshots} height={200} />
          </Card>
        ))}
      </div>

      {/* Cycle Time Scatterplot */}
      <ChartRowHeader
        title="Cycle Time Scatterplot"
        desc="Each dot is a completed item. Items above the SLE line missed the Service Level Expectation."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => (
          <Card key={rd.round}>
            <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
            <CtScatterChart items={rd.items} sleDays={rd.settings.sleDays} />
          </Card>
        ))}
      </div>

      {/* Cycle Time Distribution */}
      <ChartRowHeader
        title="Cycle Time Distribution"
        desc="A tight distribution means predictable delivery. A long tail signals outliers."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => (
          <Card key={rd.round}>
            <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
            <CtHistogramChart items={rd.items} sleDays={rd.settings.sleDays} />
          </Card>
        ))}
      </div>

      {/* Throughput */}
      <ChartRowHeader
        title="Throughput"
        desc="Daily items completed with rolling average. Stable throughput = healthy system."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => {
          const minD = rd.snapshots.length > 0 ? rd.snapshots[0].day : 1;
          const maxD = rd.snapshots.length > 0 ? rd.snapshots[rd.snapshots.length - 1].day : currentDay;
          return (
            <Card key={rd.round}>
              <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
              <WipThroughputChart items={rd.items} minDay={minD} maxDay={maxD} />
            </Card>
          );
        })}
      </div>

      {/* Aging WIP by Workflow State */}
      <ChartRowHeader
        title="Aging WIP by Workflow State"
        desc="Items by stage and age. Green = safe, red = at risk of breaching SLE."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => {
          const maxDay = rd.snapshots.length > 0 ? rd.snapshots[rd.snapshots.length - 1].day : currentDay;
          return (
            <Card key={rd.round}>
              <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
              <WipAgingByStateChart items={rd.items} currentDay={maxDay} sleDays={rd.settings.sleDays} height={220} />
            </Card>
          );
        })}
      </div>

      {/* Flow Efficiency */}
      <ChartRowHeader
        title="Flow Efficiency"
        desc="Green = time being worked on, red = time waiting. Low efficiency = queue-heavy system."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => (
          <Card key={rd.round}>
            <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
            <FlowEfficiencyChart items={rd.items} />
          </Card>
        ))}
      </div>

      {/* WIP Heat Map */}
      <ChartRowHeader
        title="WIP Heat Map"
        desc="Item count by stage over time. Hot spots = work accumulating."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => (
          <Card key={rd.round}>
            <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
            <HeatmapChart snapshots={rd.snapshots} />
          </Card>
        ))}
      </div>

      {/* WIP Run Chart */}
      <ChartRowHeader
        title="WIP Run Chart"
        desc="Total WIP over time against the aggregate limit."
      />
      <div className="grid grid-cols-3 gap-3">
        {allRounds.map((rd, i) => {
          const totalLimit = rd.settings.wipLimits.red + rd.settings.wipLimits.blue + rd.settings.wipLimits.green;
          return (
            <Card key={rd.round}>
              <RoundLabel round={rd.round} color={ROUND_COLORS[i]} />
              <WipRunChart snapshots={rd.snapshots} totalWipLimit={totalLimit} />
            </Card>
          );
        })}
      </div>

      {/* ── Forecasting & Insight (combined data) ──── */}
      <div className="mt-6 flex flex-col gap-5">
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

        <Card>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Monte Carlo: How Many in 15 Days?
          </div>
          <div className="text-xs mb-3.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Using your historical throughput from all rounds, how many items could be completed in the next 15 days?
          </div>
          <MonteCarloChart items={items} mode="howMany" daysOrTarget={15} />
        </Card>

        <Card>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Monte Carlo: When Will {backlogCount} Backlog Items Be Done?
          </div>
          <div className="text-xs mb-3.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            How many days to complete the current {backlogCount} backlog items? Based on 500 simulations.
          </div>
          <MonteCarloChart items={items} mode="when" daysOrTarget={Math.max(backlogCount, 5)} />
        </Card>

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
