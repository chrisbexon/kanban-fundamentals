"use client";

import { useState } from "react";
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
            title="Little's Law is a relationship, not a target"
            body="Little's Law describes what is happening in a system — it does not let you dictate what should happen. You cannot demand a specific cycle time any more than you can demand the weather. Arrivals are unpredictable, work takes variable time to complete, and blockers appear without warning. What you can do is observe the relationship and adjust the inputs."
          />
          <Takeaway
            title="WIP and Age are the levers you can pull"
            body="WIP and item age are two sides of the same coin. High WIP means items spend longer waiting (ageing) rather than being worked on. Limiting WIP is the most direct lever because it is the one thing you can control immediately — you don't need to hire anyone, change tools, or work harder. You simply start fewer things. When WIP drops, age drops, and cycle time follows."
          />
          <Takeaway
            title="Four ways to bring a system into balance"
            body="When the queue grew out of control in the simulation, you had four options: slow the arrival rate (accept less work), increase throughput (add kitchen staff), match capacity to demand (add an order window when ordering is the bottleneck), or reduce WIP (limit how many cars enter the system). In practice, slowing arrivals and limiting WIP are often faster and cheaper than adding capacity — and they work immediately. Adding capacity only helps when it targets the actual constraint."
          />
          <Takeaway
            title="The system can only move as fast as its constraint"
            body="This is the core insight of Goldratt's Theory of Constraints. Adding a second order window didn't help when the kitchen was the bottleneck — it just moved cars faster into a queue they couldn't escape. Any improvement not at the constraint is an illusion. Identify where work ages the most, and focus there."
          />
          <Takeaway
            title="Queues grow forever without intervention"
            body="When arrivals outpace throughput even slightly, the queue grows without limit and cycle times balloon. There is no natural force that brings the system back into balance. In knowledge work, this is exactly what happens when teams say yes to everything — the backlog grows, everything takes longer, and nothing finishes quickly."
          />
        </div>
      </Card>

      {/* Advanced: Reinertsen's insights */}
      <Card accent="236,72,153">
        <div className="text-sm font-bold mb-1" style={{ color: "#ec4899" }}>Going Deeper</div>
        <div className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          Insights from Donald Reinertsen&apos;s <em>The Principles of Product Development Flow</em>
        </div>
        <div className="flex flex-col gap-5">
          <AdvancedInsight
            title="High utilisation destroys flow"
            chart={<UtilisationQueueChart />}
            body="Reinertsen demonstrated that the relationship between resource utilisation and queue size is not linear — it is hyperbolic. At 80% utilisation, queue length is 4x what it is at 50%. At 90%, it is 9x. At 95%, it is 19x. This is queueing theory (M/M/1 model) applied to knowledge work. Most managers assume that keeping everyone busy is efficient, but the maths shows the opposite: a system running near full capacity has almost no ability to absorb variability. Queues explode, cycle times balloon, and the system becomes unpredictable. You need slack — deliberately unused capacity — for the system to remain responsive."
          />
          <AdvancedInsight
            title="Batch size has a U-shaped cost curve"
            chart={<BatchSizeCostChart />}
            body="Reinertsen showed that the total cost of batch size is the sum of two opposing forces: transaction costs (the overhead of starting, reviewing, deploying each batch) and holding costs (the cost of delay while items wait to be batched together). Large batches reduce transaction costs but increase holding costs — items wait longer, feedback is delayed, and risk accumulates. Small batches increase transaction costs but slash holding costs. The optimal batch size sits at the bottom of the U-curve where these forces balance. Most organisations operate far to the right — batches are too large because transaction costs are visible (meetings, deployments, reviews) while holding costs are invisible (delayed feedback, stale work, compounding risk)."
          />
        </div>
      </Card>

      <Card accent="139,92,246">
        <div className="text-sm font-bold text-violet-400 mb-3">From Drive-Through to Your Team</div>
        <div className="text-[13px] leading-[1.75] mb-4" style={{ color: "var(--text-secondary)" }}>
          Replace &ldquo;cars&rdquo; with &ldquo;work items&rdquo; and &ldquo;kitchen staff&rdquo; with
          &ldquo;your team&rdquo;. Little&apos;s Law works identically.
          If your team has <strong style={{ color: "#8b5cf6" }}>15 items in progress</strong> and
          completes <strong style={{ color: "#22c55e" }}>3 per week</strong>, each item
          takes <strong style={{ color: "#f59e0b" }}>5 weeks on average</strong>. That&apos;s not a judgement
          on the team &mdash; it&apos;s a mathematical reality. No amount of effort changes the equation.
        </div>
        <div className="text-[13px] leading-[1.75] mb-4" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Throughput may improve over time</strong>, but you
          can only see that in the data &mdash; you cannot demand it. What you <em>can</em> do right now is
          limit how much work enters the system, watch where items age, and focus improvement efforts at
          the constraint. This is a <strong style={{ color: "#f59e0b" }}>systems thinking</strong> approach:
          look at the whole picture end-to-end, understand the flow of value, and ask <em>&ldquo;where does
          work wait?&rdquo;</em> rather than <em>&ldquo;who isn&apos;t working hard enough?&rdquo;</em>
        </div>
        <div
          className="rounded-lg px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "#a78bfa" }}>Coming up next:</strong> We&apos;ll build on this foundation
          by exploring how to read a Kanban board as a system &mdash; identifying where work ages,
          spotting bottlenecks, and using flow metrics to drive continuous improvement.
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

function AdvancedInsight({ title, body, chart }: { title: string; body: string; chart: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-2 group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <span
          className="text-[11px] font-mono font-bold transition-transform duration-200 inline-block"
          style={{ color: "#ec4899", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &#9654;
        </span>
        <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{title}</span>
      </button>
      {expanded && (
        <div className="fade-in mt-3 ml-5">
          <div className="mb-3">{chart}</div>
          <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>{body}</div>
        </div>
      )}
    </div>
  );
}

/* ── Inline SVG charts for Reinertsen's concepts ── */

function UtilisationQueueChart() {
  // M/M/1: queue = u / (1 - u)
  const points: { u: number; q: number }[] = [];
  for (let u = 0; u <= 95; u += 2) {
    points.push({ u, q: (u / 100) / (1 - u / 100) });
  }
  const maxQ = 19;
  const W = 560;
  const H = 320;
  const pad = { t: 24, r: 24, b: 48, l: 56 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const toX = (u: number) => pad.l + (u / 100) * cw;
  const toY = (q: number) => pad.t + ch - (Math.min(q, maxQ) / maxQ) * ch;

  const pathD = points.map((p, i) =>
    `${i === 0 ? "M" : "L"}${toX(p.u).toFixed(1)},${toY(p.q).toFixed(1)}`
  ).join(" ");

  // Danger zone fill (80-95%)
  const dangerPoints = points.filter(p => p.u >= 80);
  const dangerFill = dangerPoints.length > 1 ?
    `M${toX(80).toFixed(1)},${toY(0).toFixed(1)} ` +
    dangerPoints.map(p => `L${toX(p.u).toFixed(1)},${toY(p.q).toFixed(1)}`).join(" ") +
    ` L${toX(95).toFixed(1)},${toY(0).toFixed(1)} Z`
    : "";

  // Annotation lines from data points to axis
  const annotations = [
    { u: 50, label: "2x", desc: "50%" },
    { u: 80, label: "4x", desc: "80%" },
    { u: 90, label: "9x", desc: "90%" },
    { u: 95, label: "19x", desc: "95%" },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(236,72,153,0.03)", border: "1px solid rgba(236,72,153,0.1)" }}
    >
      <div className="text-[11px] font-bold mb-1" style={{ color: "#ec4899" }}>Resource Utilisation vs Queue Size</div>
      <div className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>
        As utilisation approaches 100%, queue length grows towards infinity (M/M/1 queueing model)
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Chart showing queue size growing hyperbolically as resource utilisation increases">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(u => (
          <line key={`gx${u}`} x1={toX(u)} x2={toX(u)} y1={pad.t} y2={pad.t + ch} stroke="var(--border-faint)" strokeWidth="0.5" />
        ))}
        {[0, 5, 10, 15, 19].map(q => (
          <g key={`gy${q}`}>
            <line x1={pad.l} x2={pad.l + cw} y1={toY(q)} y2={toY(q)} stroke="var(--border-faint)" strokeWidth="0.5" />
            <text x={pad.l - 8} y={toY(q) + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">{q}x</text>
          </g>
        ))}
        {/* Danger zone */}
        {dangerFill && <path d={dangerFill} fill="rgba(239,68,68,0.06)" />}
        <text x={toX(87.5)} y={toY(6)} textAnchor="middle" fontSize="10" fontWeight="600" fill="rgba(239,68,68,0.4)">Danger Zone</text>
        {/* Curve */}
        <path d={pathD} fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Annotation lines and data points */}
        {annotations.map(({ u, label }) => {
          const q = (u / 100) / (1 - u / 100);
          return (
            <g key={u}>
              {/* Dashed line down to x-axis */}
              <line x1={toX(u)} x2={toX(u)} y1={toY(q)} y2={toY(0)} stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
              {/* Dashed line left to y-axis */}
              <line x1={pad.l} x2={toX(u)} y1={toY(q)} y2={toY(q)} stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
              <circle cx={toX(u)} cy={toY(q)} r="5" fill="#ec4899" />
              <rect x={toX(u) - 16} y={toY(q) - 24} width="32" height="16" rx="4" fill="rgba(236,72,153,0.15)" />
              <text x={toX(u)} y={toY(q) - 13} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="var(--font-mono)" fill="#ec4899">{label}</text>
            </g>
          );
        })}
        {/* Axes labels */}
        <text x={pad.l + cw / 2} y={H - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-tertiary)">Resource Utilisation</text>
        <text x={18} y={pad.t + ch / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-tertiary)" transform={`rotate(-90,18,${pad.t + ch / 2})`}>Queue Size (multiplier)</text>
        {/* X-axis tick labels */}
        {[0, 25, 50, 75, 100].map(u => (
          <text key={`tx${u}`} x={toX(u)} y={pad.t + ch + 20} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-muted)" fontFamily="var(--font-mono)">{u}%</text>
        ))}
      </svg>
    </div>
  );
}

function BatchSizeCostChart() {
  const W = 560;
  const H = 320;
  const pad = { t: 24, r: 24, b: 48, l: 56 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const steps = 60;
  const maxX = 10;
  const toX = (x: number) => pad.l + (x / maxX) * cw;

  const transK = 4;
  const holdK = 0.5;
  const maxY = 5;
  const toY = (y: number) => pad.t + ch - (Math.min(y, maxY) / maxY) * ch;

  const transPoints: string[] = [];
  const holdPoints: string[] = [];
  const totalPoints: string[] = [];
  let minTotal = Infinity;
  let minTotalX = 0;

  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * maxX;
    const trans = transK / x;
    const hold = holdK * x;
    const total = trans + hold;
    if (total < minTotal) { minTotal = total; minTotalX = x; }
    transPoints.push(`${i === 1 ? "M" : "L"}${toX(x).toFixed(1)},${toY(trans).toFixed(1)}`);
    holdPoints.push(`${i === 1 ? "M" : "L"}${toX(x).toFixed(1)},${toY(hold).toFixed(1)}`);
    totalPoints.push(`${i === 1 ? "M" : "L"}${toX(x).toFixed(1)},${toY(total).toFixed(1)}`);
  }

  // "Most teams here" marker at x=7.5
  const mostTeamsX = 7.5;
  const mostTeamsTotal = transK / mostTeamsX + holdK * mostTeamsX;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)" }}
    >
      <div className="text-[11px] font-bold mb-1" style={{ color: "#22c55e" }}>The Economics of Batch Size</div>
      <div className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>
        Total cost is U-shaped &mdash; most organisations sit far to the right because holding costs are invisible
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="U-shaped cost curve showing optimal batch size where transaction costs and holding costs balance">
        {/* Grid */}
        {[0, 2.5, 5, 7.5, 10].map(x => (
          <line key={`gx${x}`} x1={toX(x)} x2={toX(x)} y1={pad.t} y2={pad.t + ch} stroke="var(--border-faint)" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4, 5].map(y => (
          <line key={`gy${y}`} x1={pad.l} x2={pad.l + cw} y1={toY(y)} y2={toY(y)} stroke="var(--border-faint)" strokeWidth="0.5" />
        ))}
        {/* Shaded area under total cost curve */}
        <path
          d={totalPoints.join(" ") + ` L${toX(maxX).toFixed(1)},${toY(0).toFixed(1)} L${toX(maxX / steps).toFixed(1)},${toY(0).toFixed(1)} Z`}
          fill="rgba(34,197,94,0.04)"
        />
        {/* Curves */}
        <path d={transPoints.join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
        <path d={holdPoints.join(" ")} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
        <path d={totalPoints.join(" ")} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Optimal point */}
        <line x1={toX(minTotalX)} x2={toX(minTotalX)} y1={toY(minTotal)} y2={toY(0)} stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        <circle cx={toX(minTotalX)} cy={toY(minTotal)} r="6" fill="#22c55e" />
        <rect x={toX(minTotalX) - 26} y={toY(minTotal) - 26} width="52" height="18" rx="4" fill="rgba(34,197,94,0.15)" />
        <text x={toX(minTotalX)} y={toY(minTotal) - 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#22c55e">Optimal</text>
        {/* Most teams marker */}
        <line x1={toX(mostTeamsX)} x2={toX(mostTeamsX)} y1={toY(mostTeamsTotal)} y2={toY(0)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        <circle cx={toX(mostTeamsX)} cy={toY(mostTeamsTotal)} r="5" fill="#ef4444" />
        <rect x={toX(mostTeamsX) - 34} y={toY(mostTeamsTotal) - 26} width="68" height="18" rx="4" fill="rgba(239,68,68,0.12)" />
        <text x={toX(mostTeamsX)} y={toY(mostTeamsTotal) - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ef4444">Most teams</text>
        {/* Legend — middle right, below curve area */}
        {(() => {
          const lx = pad.l + cw - 130;
          const ly = pad.t + ch / 2 - 28;
          return (
            <g>
              <rect x={lx} y={ly} width="126" height="56" rx="6" fill="var(--bg-surface)" stroke="var(--border-faint)" strokeWidth="0.5" />
              <line x1={lx + 12} x2={lx + 28} y1={ly + 14} y2={ly + 14} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
              <text x={lx + 34} y={ly + 18} fontSize="10" fill="var(--text-secondary)">Transaction cost</text>
              <line x1={lx + 12} x2={lx + 28} y1={ly + 30} y2={ly + 30} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
              <text x={lx + 34} y={ly + 34} fontSize="10" fill="var(--text-secondary)">Holding cost</text>
              <line x1={lx + 12} x2={lx + 28} y1={ly + 46} y2={ly + 46} stroke="#22c55e" strokeWidth="3" />
              <text x={lx + 34} y={ly + 50} fontSize="10" fontWeight="600" fill="var(--text-secondary)">Total cost</text>
            </g>
          );
        })()}
        {/* Axes labels */}
        <text x={pad.l + cw / 2} y={H - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-tertiary)">Batch Size</text>
        <text x={18} y={pad.t + ch / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-tertiary)" transform={`rotate(-90,18,${pad.t + ch / 2})`}>Cost</text>
        {/* X-axis tick labels */}
        <text x={toX(0.5)} y={pad.t + ch + 20} textAnchor="middle" fontSize="11" fill="var(--text-muted)">Small</text>
        <text x={toX(5)} y={pad.t + ch + 20} textAnchor="middle" fontSize="11" fill="var(--text-muted)">Medium</text>
        <text x={toX(maxX - 0.5)} y={pad.t + ch + 20} textAnchor="end" fontSize="11" fill="var(--text-muted)">Large</text>
      </svg>
    </div>
  );
}
