"use client";

import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface IntroStepProps {
  onNext: () => void;
}

export function FlowMetricsIntroStep({ onNext }: IntroStepProps) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader tag="Introduction" tagColor="#ef4444" title="Flow Metrics & Forecasting" />

      <div
        className="w-full aspect-video rounded-[14px] flex flex-col items-center justify-center mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(139,92,246,0.05))",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(239,68,68,0.06) 0%, transparent 60%)" }} />
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[22px] mb-2.5"
          style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.3)" }}
        >
          &#9654;
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-tertiary)" }}>Video: Flow Metrics &amp; Forecasting</span>
        <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>6:15</span>
      </div>

      <div className="text-sm leading-[1.8] flex flex-col gap-3.5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          In previous lessons you learned about <strong style={{ color: "var(--text-primary)" }}>batch size, WIP limits,
          and Little&apos;s Law</strong>. Now it&apos;s time to put those concepts to work with real data.
        </p>
        <p className="m-0">
          Flow metrics give us an <strong style={{ color: "var(--text-primary)" }}>empirical, data-driven view</strong> of
          how work moves through our system. Instead of guessing, we measure. Instead of promising fixed dates,
          we forecast with <strong className="text-violet-400">probability ranges</strong>.
        </p>
        <p className="m-0">
          This lesson uses <strong style={{ color: "var(--text-primary)" }}>real kanban board data</strong> from a team
          that tracked ~350 work items over several months. You&apos;ll explore their throughput patterns and use{" "}
          <strong className="text-red-400">Monte Carlo simulation</strong> to answer the two most important
          delivery questions:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <Card accent="139,92,246">
          <div className="text-sm font-bold mb-1.5" style={{ color: "#a78bfa" }}>When will it be done?</div>
          <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Given N items remaining, how many days until they&apos;re all complete? Get a probability
            distribution instead of a single guess.
          </div>
        </Card>
        <Card accent="59,130,246">
          <div className="text-sm font-bold mb-1.5" style={{ color: "#60a5fa" }}>How many can we do?</div>
          <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Given a fixed time window, how many items can we realistically deliver? Plan sprints and
            releases with confidence levels.
          </div>
        </Card>
      </div>

      {/* Right-sizing discussion */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
      >
        <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          &ldquo;But don&apos;t all items need to be the same size?&rdquo;
        </div>
        <div className="text-[13px] leading-[1.8] flex flex-col gap-3" style={{ color: "var(--text-secondary)" }}>
          <p className="m-0">
            This is the most common objection to flow-based forecasting, and the answer is <strong style={{ color: "var(--text-primary)" }}>no</strong>.
            Monte Carlo simulations sample from your <em>historical throughput</em> &mdash; how many items your
            team actually completed each day. The natural variation in item size is already baked into that data.
            If your team completed 3 items one day and 7 the next, that range already reflects the
            size differences, blockers, interruptions, and everything else that happened.
          </p>
          <p className="m-0">
            What matters is not that items are the <em>same</em> size, but that they are{" "}
            <strong style={{ color: "#f59e0b" }}>right-sized</strong> &mdash; consistently small enough
            to flow through your system without clogging it.
          </p>
        </div>

        {/* Right-sized vs Same-sized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}
          >
            <div className="text-xs font-bold mb-1.5" style={{ color: "#ef4444" }}>Same-sizing (not needed)</div>
            <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Trying to make every item exactly the same effort. Artificial, wastes time on estimation
              theatre, and ignores the inherent complexity differences in knowledge work.
            </div>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}
          >
            <div className="text-xs font-bold mb-1.5" style={{ color: "#22c55e" }}>Right-sizing (the goal)</div>
            <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Ensuring no item is bigger than a threshold &mdash; small enough to complete within
              your Service Level Expectation. An upper bound, not a uniformity requirement.
            </div>
          </div>
        </div>

        <div className="text-[13px] leading-[1.8] flex flex-col gap-3 mt-4" style={{ color: "var(--text-secondary)" }}>
          <p className="m-0">
            <strong style={{ color: "var(--text-primary)" }}>The mindset shift:</strong> stop asking
            &ldquo;how big is this item?&rdquo; and start asking &ldquo;is this item small enough?&rdquo;
            The first question invites false precision. The second is a simple yes/no check
            at the moment work is pulled &mdash; if the answer is no, break it down further.
          </p>
          <p className="m-0">
            Think back to the <strong style={{ color: "#3b82f6" }}>batch size lesson</strong>. Right-sizing
            is the same principle applied to individual work items. In that lesson you saw
            how smaller batches flow faster, provide quicker feedback, and carry less risk. Right-sizing
            ensures every item on your board is itself a small batch &mdash; a thin, vertical slice
            of value that can move through the system in days, not weeks.
          </p>
          <p className="m-0">
            WIP limits control <em>how many</em> items are in flight. Right-sizing controls <em>how
            big</em> each one is. Together they create the conditions for predictable flow &mdash; and
            that predictable flow is exactly what makes Monte Carlo forecasting reliable.
          </p>
        </div>

        {/* Practical heuristics */}
        <div className="mt-4 text-[12px] font-bold mb-2" style={{ color: "var(--text-muted)" }}>
          A work item is right-sized when it:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ["Fits within the SLE", "Can be completed within your 85th percentile cycle time"],
            ["Is vertically sliced", "Delivers a thin end-to-end slice of value, not a horizontal layer"],
            ["Takes days, not weeks", "If someone says 'a couple of weeks', it needs splitting"],
            ["Enables fast feedback", "The team or stakeholders can validate the outcome quickly"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-lg px-3 py-2 flex gap-2 items-start"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-hairline, rgba(255,255,255,0.04))" }}
            >
              <span className="text-green-400 mt-0.5 flex-shrink-0" style={{ fontSize: 11 }}>&#10003;</span>
              <div>
                <div className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{title}</div>
                <div className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "#f59e0b" }}>The key insight:</strong> counting items through the system is more
          reliable than summing estimates. Research shows throughput-based forecasts deviate as little as 4%
          from story-point estimates &mdash; but cost nothing to produce. When items are right-sized, throughput
          stabilises, cycle time distributions tighten, and forecasts become trustworthy.
        </div>
      </div>

      <Card style={{ marginTop: 20 }} accent="239,68,68">
        <div className="text-sm font-bold mb-1.5" style={{ color: "#f87171" }}>Why Monte Carlo?</div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Traditional estimation asks each person &ldquo;how long will this take?&rdquo; and adds up the guesses.
          Monte Carlo takes a radically different approach: it looks at <strong style={{ color: "var(--text-primary)" }}>how work
          has actually flowed</strong> through your system and runs thousands of random simulations to build a
          probability distribution. No estimates needed &mdash; just historical data and statistics.
        </div>
      </Card>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>Explore the Data &rarr;</Btn>
      </div>
    </div>
  );
}
