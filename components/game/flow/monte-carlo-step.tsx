"use client";

import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { FlowThroughputChart } from "@/components/charts/flow/throughput-chart";
import { MCDistributionChart } from "@/components/charts/flow/mc-distribution-chart";
import { MCCalendarHeatmap } from "@/components/charts/flow/mc-calendar-heatmap";
import type { useFlowMetrics } from "@/hooks/use-flow-metrics";

interface MonteCarloStepProps {
  flow: ReturnType<typeof useFlowMetrics>;
  onBack: () => void;
}

function DateInput({ label, hint, value, onChange, min, max }: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {hint && <div className="text-[9px] -mt-0.5" style={{ color: "var(--text-dimmer)" }}>{hint}</div>}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-2.5 py-1.5 text-xs font-mono border-none outline-none"
        style={{
          background: "var(--bg-input, rgba(255,255,255,0.06))",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        }}
      />
    </div>
  );
}

function NumberInput({ label, hint, value, onChange, min, max, step }: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {hint && <div className="text-[9px] -mt-0.5" style={{ color: "var(--text-dimmer)" }}>{hint}</div>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg px-2.5 py-1.5 text-xs font-mono border-none outline-none w-24"
        style={{
          background: "var(--bg-input, rgba(255,255,255,0.06))",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        }}
      />
    </div>
  );
}

export function MonteCarloStep({ flow, onBack }: MonteCarloStepProps) {
  const { mode, setMode, mcResults } = flow;

  return (
    <div className="fade-up max-w-[960px]">
      <StepHeader
        tag="Monte Carlo Forecasting"
        tagColor="#8b5cf6"
        title="Probabilistic Forecasting"
        desc="Use your team's historical throughput data to forecast future delivery. Monte Carlo simulation runs thousands of 'what if' scenarios to give you honest, data-driven probability ranges."
      />

      {/* Guided scenario prompt */}
      <Card accent="59,130,246" style={{ marginBottom: 20 }}>
        <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "#60a5fa" }}>Try this:</strong>{" "}
          {mode === "when"
            ? <>A stakeholder asks &ldquo;when will the remaining {flow.backlogCount} backlog items be done?&rdquo; The forecast below answers with probabilities, not a guess. Try changing the target items to see how scope affects the timeline.</>
            : <>Your team is planning a 30-day sprint. Instead of guessing how much you can commit to, the forecast below shows a range of likely outcomes. Try adjusting the forecast window to match your planning horizon.</>
          }
        </div>
      </Card>

      {/* Mode toggle */}
      <div className="flex gap-0 mb-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", width: "fit-content" }}>
        <button
          onClick={() => setMode("when")}
          className="px-4 py-2 text-xs font-bold border-none cursor-pointer transition-all"
          style={{
            background: mode === "when" ? "rgba(139,92,246,0.15)" : "transparent",
            color: mode === "when" ? "#a78bfa" : "var(--text-muted)",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          When will it be done?
        </button>
        <button
          onClick={() => setMode("howMany")}
          className="px-4 py-2 text-xs font-bold border-none cursor-pointer transition-all"
          style={{
            background: mode === "howMany" ? "rgba(59,130,246,0.15)" : "transparent",
            color: mode === "howMany" ? "#60a5fa" : "var(--text-muted)",
          }}
        >
          How many can we do?
        </button>
      </div>

      {/* Config panel */}
      <Card>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Simulation Settings
        </div>
        <div className="text-[11px] mb-3" style={{ color: "var(--text-tertiary)" }}>
          These defaults are based on the team&apos;s real data. Try changing them to see how the forecast shifts.
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <DateInput
            label="Sample Period Start"
            hint="Learn from data starting here"
            value={flow.throughputStart}
            onChange={flow.setThroughputStart}
            max={flow.throughputEnd}
          />
          <DateInput
            label="Sample Period End"
            hint="Up to this date"
            value={flow.throughputEnd}
            onChange={flow.setThroughputEnd}
            min={flow.throughputStart}
          />
          {mode === "when" ? (
            <NumberInput
              label="Target Items"
              hint="How many to deliver"
              value={flow.targetItems}
              onChange={flow.setTargetItems}
              min={1}
              max={500}
            />
          ) : (
            <NumberInput
              label="Forecast Window"
              hint="Number of days ahead"
              value={flow.forecastDays}
              onChange={flow.setForecastDays}
              min={1}
              max={365}
            />
          )}
          <NumberInput
            label="Simulations"
            hint="More = smoother curve"
            value={flow.trials}
            onChange={flow.setTrials}
            min={100}
            max={100000}
            step={1000}
          />
        </div>
        <div className="mt-2 text-[10px]" style={{ color: "var(--text-dimmer)" }}>
          Using {flow.samples.length} days of historical data to power the simulation.
        </div>
      </Card>

      {/* Throughput chart */}
      <div className="mt-5">
        <Card>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Step 1: Historical Throughput
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            How many items did the team complete each day? The bars show daily completions, and the line smooths them into a 7-day trend. This is the raw data the simulation learns from.
          </div>
          <FlowThroughputChart data={flow.throughput} />
        </Card>
      </div>

      {/* Bridge explanation */}
      <div
        className="my-3 mx-auto text-center text-[11px] py-2 px-4 rounded-lg"
        style={{ color: "var(--text-tertiary)", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)", maxWidth: 600 }}
      >
        The simulation randomly samples from the daily throughput above and replays it thousands of times to build a range of likely outcomes.
      </div>

      {/* Distribution chart */}
      {mcResults && (
        <div className="mt-3">
          <Card>
            <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Step 2: {mode === "when"
                ? `When will ${flow.targetItems} items be done?`
                : `How many items in ${flow.forecastDays} days?`}
            </div>
            <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Each bar is a possible outcome from {flow.trials.toLocaleString()} simulations. The coloured lines mark key confidence levels.
            </div>
            <MCDistributionChart
              buckets={mcResults.buckets}
              mode={mode}
              p50={mcResults.p50}
              p85={mcResults.p85}
              p95={mcResults.p95}
              targetItems={flow.targetItems}
              forecastDays={flow.forecastDays}
            />
          </Card>
        </div>
      )}

      {/* Calendar heatmap */}
      {mcResults && mcResults.calendar.length > 0 && (
        <div className="mt-5">
          <Card>
            <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Step 3: Probability Calendar
            </div>
            <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {mode === "when"
                ? `Each date shows the probability that all ${flow.targetItems} items will be complete by then. Watch the colours shift from red (unlikely) to green (high confidence).`
                : `Each date shows the probability of having completed at least ${mcResults.p50} items (the 50/50 estimate) by then.`}
            </div>
            <MCCalendarHeatmap cells={mcResults.calendar} mode={mode} />
          </Card>
        </div>
      )}

      {/* Insight card */}
      <div className="mt-5">
        <Card accent="139,92,246">
          <div className="text-sm font-bold mb-2" style={{ color: "#a78bfa" }}>
            Reading the Forecast
          </div>
          <div className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>The 85% confidence level is the sweet spot for forecasting.</strong>{" "}
            It means &ldquo;85 out of 100 simulations finished by this point&rdquo; &mdash; high confidence without
            being overly pessimistic. The 50% level is a coin flip &mdash; useful for internal planning.
            The 95% level is very conservative, useful when the cost of being wrong is high.
            Remember: you can commit to a <em>goal</em>, but never to <em>scope</em> &mdash; in complex environments,
            conditions change and the forecast should be revisited regularly.
          </div>
          <div className="text-[13px] leading-[1.75] mt-2" style={{ color: "var(--text-secondary)" }}>
            Notice the shape of the distribution: a tight bell curve means predictable flow,
            while a wide spread or long tail signals high variability. <strong style={{ color: "var(--text-primary)" }}>Reducing
            WIP and right-sizing work items narrows the distribution</strong>, making forecasts more reliable.
          </div>
        </Card>
      </div>

      <div className="flex justify-start mt-7">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}
