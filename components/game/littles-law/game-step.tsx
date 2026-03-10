"use client";

import type { SimState, SimSettings } from "@/types/littles-law";
import { StepHeader } from "@/components/lesson/step-header";
import { Btn } from "@/components/ui/button";
import { DriveThruView } from "./drive-through-view";
import { SimControls } from "./sim-controls";
import { FlowChart } from "./flow-chart";
import { MetricsPanel } from "./metrics-panel";

interface LittlesLawGameStepProps {
  state: SimState;
  snapshot: ReturnType<typeof import("@/lib/engine/littles-law").getSnapshot>;
  onToggleRunning: () => void;
  onSetSpeed: (s: number) => void;
  onUpdateSettings: (s: Partial<SimSettings>) => void;
  onReset: () => void;
  onFinish: () => void;
  onBack: () => void;
}

export function LittlesLawGameStep({
  state, snapshot,
  onToggleRunning, onSetSpeed, onUpdateSettings, onReset,
  onFinish, onBack,
}: LittlesLawGameStepProps) {
  return (
    <div className="fade-up">
      <StepHeader
        tag="Simulation"
        tagColor="#f59e0b"
        title="Little's Law Drive-Through"
        desc="Watch cars flow through the system. Adjust arrival rate, kitchen staff, and order windows to see how WIP, cycle time, and throughput are connected."
      />

      {/* Controls */}
      <SimControls
        running={state.running}
        speed={state.speed}
        settings={state.settings}
        simTimeMinutes={snapshot.simTimeMinutes}
        onToggleRunning={onToggleRunning}
        onSetSpeed={onSetSpeed}
        onUpdateSettings={onUpdateSettings}
        onReset={onReset}
      />

      {/* Drive-through view */}
      <div className="mb-3">
        <DriveThruView state={state} />
      </div>

      {/* Metrics */}
      <div className="mb-3">
        <MetricsPanel
          carsInSystem={snapshot.carsInSystem}
          avgCycleTime={snapshot.avgCycleTime}
          throughputPerMin={snapshot.throughputPerMin}
          littlesLaw={snapshot.littlesLaw}
          totalArrivals={snapshot.totalArrivals}
          totalDepartures={snapshot.totalDepartures}
          totalBalked={snapshot.totalBalked}
          simTimeMinutes={snapshot.simTimeMinutes}
        />
      </div>

      {/* Flow chart */}
      <div
        className="rounded-xl p-4 mb-3"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
      >
        <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Cumulative Flow: Arrivals vs Departures
        </div>
        <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          When the arrival line pulls ahead of departures, WIP is building and cycle times are growing.
        </div>
        <FlowChart flowData={state.flowData} avgCycleTimeSec={snapshot.avgCycleTime} />
      </div>

      {/* Tips */}
      {snapshot.simTimeMinutes > 1 && snapshot.totalBalked > 0 && (
        <div
          className="rounded-xl px-4 py-3 mb-3 text-xs"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "var(--text-secondary)" }}
        >
          <strong className="text-red-400">{snapshot.totalBalked} cars drove away</strong> because the queue was too long.
          Try adding a second order window or reducing arrival rate.
        </div>
      )}

      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onFinish}>Debrief &rarr;</Btn>
      </div>
    </div>
  );
}
