"use client";

import type { SimulationRun, GameSnapshot } from "@/types/penny-game";
import { getBatchColor } from "@/lib/constants/penny-game";
import { itemBreakdown } from "@/lib/stats/penny-game-stats";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { ThroughputChart } from "@/components/charts/throughput-chart";
import { CycleTimeChart } from "@/components/charts/cycle-time-chart";
import { ItemBreakdownChart } from "@/components/charts/item-breakdown-chart";
import { LeadTimeChart } from "@/components/charts/lead-time-chart";

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

interface DebriefStepProps {
  runs: SimulationRun[];
  snaps: GameSnapshot[];
  onNext: () => void;
  onBack: () => void;
}

export function DebriefStep({ runs, snaps, onNext, onBack }: DebriefStepProps) {
  const sorted = [...runs].sort((a, b) => a.bs - b.bs);
  const sm = sorted[0];
  const lg = sorted[sorted.length - 1];

  const lgSnap = snaps.find((s) => s.bs === lg?.bs);
  const smSnap = snaps.find((s) => s.bs === sm?.bs);
  const lgBd = lgSnap ? itemBreakdown(lgSnap.items) : [];
  const smBd = smSnap ? itemBreakdown(smSnap.items) : [];

  const ltD = snaps.map((s) => {
    const d = s.items.filter((x) => x.dt !== null);
    return { bs: s.bs, cts: d.map((x) => x.dt! - x.st!), color: getBatchColor(s.bs) };
  });

  return (
    <div className="fade-up max-w-[900px]">
      <StepHeader
        tag="Debrief"
        tagColor="#10b981"
        title="Analysing Your Results"
        desc="Let's visualise what happened. These are the same flow charts Kanban teams use to understand and improve their systems."
      />

      <div className="flex flex-col gap-5">
        <ChartCard
          title="Cumulative Throughput"
          desc="Items completed over time. Large batches: flat then jumps. Small batches: steady and early \u2014 healthy flow."
        >
          <ThroughputChart snaps={snaps} />
        </ChartCard>

        <ChartCard
          title="Average Cycle Time vs Wait Time"
          desc="Cycle time = total time in system. Wait time = idle time. The red reveals pure waste."
        >
          <CycleTimeChart runs={runs} />
        </ChartCard>

        {lgBd.length > 0 && smBd.length > 0 && lg.bs !== sm.bs && (
          <ChartCard
            title="Work Time vs Wait Time \u2014 Per Item"
            desc={`Each bar = one coin. Green = processing. Red = waiting. Batch ${lg.bs} (left) vs ${sm.bs} (right).`}
          >
            <div className="flex gap-4 flex-wrap">
              <ItemBreakdownChart label={`Batch ${lg.bs}`} data={lgBd} color={getBatchColor(lg.bs)} />
              <ItemBreakdownChart label={`Batch ${sm.bs}`} data={smBd} color={getBatchColor(sm.bs)} />
            </div>
          </ChartCard>
        )}

        {ltD.length > 0 && (
          <ChartCard
            title="Lead Time Distribution"
            desc="Large batches: items cluster at the same high value. Small batches: shorter, more varied \u2014 reflecting actual work."
          >
            <div className="flex gap-4 flex-wrap">
              {ltD.map((run, ri) => (
                <LeadTimeChart key={ri} batchSize={run.bs} cycleTimes={run.cts} color={run.color} />
              ))}
            </div>
          </ChartCard>
        )}

        <Card accent="139,92,246">
          <div className="text-sm font-bold text-violet-400 mb-2.5">The Kanban Principle</div>
          <div className="text-[13px] text-violet-300 leading-[1.75]">
            <strong>Stop starting, start finishing.</strong> By limiting work in progress, you reduce lead times, expose bottlenecks, and create smoother flow. These charts &mdash; throughput, cycle time, lead time distribution &mdash; are the same tools Kanban teams use daily. In the next lessons, you&apos;ll apply them to real Kanban boards.
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
