"use client";

import type { SimState } from "@/types/littles-law";
import { getSnapshot } from "@/lib/engine/littles-law";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { FlowChart } from "./flow-chart";
import { MetricsPanel } from "./metrics-panel";

interface DebriefProps {
  state: SimState;
  onNext: () => void;
  onBack: () => void;
}

export function LittlesLawDebrief({ state, onNext, onBack }: DebriefProps) {
  const snap = getSnapshot(state);

  return (
    <div className="fade-up max-w-[960px]">
      <StepHeader
        tag="Debrief"
        tagColor="#10b981"
        title="What Did Little's Law Reveal?"
        desc="Let's examine your drive-through results and connect them back to knowledge work."
      />

      {/* Final metrics */}
      <div className="mb-5">
        <MetricsPanel
          carsInSystem={snap.carsInSystem}
          avgCycleTime={snap.avgCycleTime}
          throughputPerMin={snap.throughputPerMin}
          littlesLaw={snap.littlesLaw}
          totalArrivals={snap.totalArrivals}
          totalDepartures={snap.totalDepartures}
          totalBalked={snap.totalBalked}
          simTimeMinutes={snap.simTimeMinutes}
        />
      </div>

      {/* Final flow chart */}
      <Card>
        <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Your Cumulative Flow</div>
        <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          The gap between the arrival and departure lines tells the whole story.
        </div>
        <FlowChart flowData={state.flowData} avgCycleTimeSec={snap.avgCycleTime} />
      </Card>

      {/* Key takeaways */}
      <Card accent="245,158,11">
        <div className="text-sm font-bold text-amber-400 mb-3">Key Takeaways</div>
        <div className="flex flex-col gap-4">
          <Takeaway
            title="WIP is the lever"
            body="When arrivals exceeded throughput, WIP accumulated and cycle times grew. The only way to bring cycle times down was to either slow arrivals (limit WIP entering the system) or increase throughput capacity."
          />
          <Takeaway
            title="Bottlenecks determine throughput"
            body="Adding a second order window only helped if ordering was the constraint. If the kitchen was the bottleneck, more order windows just built up a longer queue inside the system — more WIP, same throughput, longer cycle times."
          />
          <Takeaway
            title="Cars driving away = unhappy stakeholders"
            body="When the queue got too long, customers left. In knowledge work, this is equivalent to stakeholders losing confidence, projects being cancelled, or opportunities missed because the team was overloaded."
          />
        </div>
      </Card>

      <Card accent="139,92,246">
        <div className="text-sm font-bold text-violet-400 mb-3">From Drive-Through to Your Team</div>
        <div className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
          Replace &ldquo;cars&rdquo; with &ldquo;work items&rdquo; and &ldquo;kitchen staff&rdquo; with
          &ldquo;your team&rdquo;. Little&apos;s Law works identically.
          If your team has <strong style={{ color: "#8b5cf6" }}>15 items in progress</strong> and
          completes <strong style={{ color: "#22c55e" }}>3 per week</strong>, each item
          takes <strong style={{ color: "#f59e0b" }}>5 weeks on average</strong> — no matter how hard
          people try. The only way to deliver faster is to have fewer things in flight at once.
          This is <em>why</em> WIP limits work.
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Simulation</Btn>
        <Btn primary onClick={onNext}>Take the Quiz &rarr;</Btn>
      </div>
    </div>
  );
}

function Takeaway({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{title}</div>
      <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>{body}</div>
    </div>
  );
}
