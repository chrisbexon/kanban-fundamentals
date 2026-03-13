"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { ComparisonView } from "@/components/game/pull-vs-push/comparison-view";
import { PullPushQuizStep } from "@/components/game/pull-vs-push/quiz-step";

const LABELS = ["Intro", "Comparison", "Key Insights", "Quiz"];

/* ── Section Header ── */
function SectionHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div className="w-2 h-10 rounded" style={{ background: "#8b5cf6" }} />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[3px] mb-0.5" style={{ color: "var(--text-dimmer)" }}>
          Section 3 &middot; Kanban in Practice
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Pull vs Push Systems
        </h1>
      </div>
    </div>
  );
}

/* ── Intro Step ── */
function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Introduction"
        tagColor="#8b5cf6"
        title="Two Ways to Move Work"
        desc="Every system moves work in one of two ways. The choice has profound consequences for quality, speed, and team wellbeing."
      />

      <Card>
        <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          What is a Push System?
        </div>
        <div className="text-[13px] leading-[1.8] mb-4" style={{ color: "var(--text-secondary)" }}>
          In a <strong style={{ color: "#ef4444" }}>push system</strong>, work is moved forward as soon as the
          upstream stage finishes &mdash; regardless of whether the next stage has capacity. Think of a
          factory assembly line where parts keep coming whether or not the next station is ready. Work is
          driven by <strong style={{ color: "var(--text-primary)" }}>forecasts and schedules</strong>, not
          actual demand.
        </div>

        <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          What is a Pull System?
        </div>
        <div className="text-[13px] leading-[1.8] mb-4" style={{ color: "var(--text-secondary)" }}>
          In a <strong style={{ color: "#22c55e" }}>pull system</strong>, work only moves forward when the
          downstream stage signals it has capacity. Nothing enters unless something exits. Work is driven by
          <strong style={{ color: "var(--text-primary)" }}> actual demand</strong> &mdash; when a customer
          needs something, it triggers a chain of signals upstream.
        </div>

        {/* Visual comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl p-3.5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
            <div className="text-xs font-bold mb-2" style={{ color: "#ef4444" }}>Push</div>
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono mb-2" style={{ color: "#ef4444" }}>
              <span>A</span><span>&rarr;</span><span>B</span><span>&rarr;</span><span>C</span><span>&rarr;</span><span>D</span>
            </div>
            <ul className="text-[11px] leading-[1.6] list-disc pl-4 m-0" style={{ color: "var(--text-secondary)" }}>
              <li>Driven by forecasts</li>
              <li>Queues build between stages</li>
              <li>Workers overloaded downstream</li>
              <li>Quality issues found late</li>
            </ul>
          </div>
          <div className="rounded-xl p-3.5" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}>
            <div className="text-xs font-bold mb-2" style={{ color: "#22c55e" }}>Pull</div>
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono mb-2" style={{ color: "#22c55e" }}>
              <span>A</span><span>&larr;</span><span>B</span><span>&larr;</span><span>C</span><span>&larr;</span><span>D</span>
            </div>
            <ul className="text-[11px] leading-[1.6] list-disc pl-4 m-0" style={{ color: "var(--text-secondary)" }}>
              <li>Driven by actual demand</li>
              <li>WIP limited at each stage</li>
              <li>Workers collaborate to finish</li>
              <li>Quality built in at every step</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card accent="139,92,246">
        <div className="text-sm font-bold mb-2" style={{ color: "#a78bfa" }}>What You&apos;ll See Next</div>
        <div className="text-[13px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          We&apos;ll run two identical workflows side by side &mdash; one <strong style={{ color: "#ef4444" }}>push</strong>,
          one <strong style={{ color: "#22c55e" }}>pull</strong> &mdash; processing the same work. Watch how
          queues build, where quality breaks down, and which system delivers more value. The results
          often surprise people.
        </div>
      </Card>

      <div className="flex justify-end mt-5">
        <Btn primary onClick={onNext}>See the Comparison &rarr;</Btn>
      </div>
    </div>
  );
}

/* ── Comparison Step ── */
function ComparisonStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up">
      <StepHeader
        tag="Interactive Comparison"
        tagColor="#f59e0b"
        title="Push vs Pull: Side by Side"
        desc="Both systems process the same incoming work. Watch how differently they behave."
      />

      <ComparisonView />

      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Intro</Btn>
        <Btn primary onClick={onNext}>Key Insights &rarr;</Btn>
      </div>
    </div>
  );
}

/* ── Key Insights Step ── */
function InsightsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Key Insights"
        tagColor="#10b981"
        title="Why Pull Systems Win"
        desc="The simulation revealed several fundamental differences. Let's connect them to your team."
      />

      <Card accent="239,68,68">
        <div className="text-sm font-bold mb-3" style={{ color: "#ef4444" }}>What Went Wrong with Push</div>
        <div className="flex flex-col gap-4">
          <Insight
            title="Queues grew without limit"
            body="Work was pushed forward regardless of downstream capacity. Each stage became a queue in front of the next bottleneck. WIP ballooned, cycle times grew, and the system became unpredictable. Sound familiar? This is exactly what happens when teams accept all incoming requests without checking capacity."
          />
          <Insight
            title="Quality degraded under pressure"
            body="When workers were overloaded with too many items, quality suffered. Defects were only caught downstream in Test, causing expensive rework loops. In knowledge work, this looks like bugs found in production, designs that miss requirements, and PRs that need multiple rounds of review."
          />
          <Insight
            title="Workers context-switched constantly"
            body="With no WIP limits, workers juggled many items simultaneously. Each context switch carries a hidden cost — research shows it takes 15-25 minutes to regain deep focus after an interruption. The push system maximised busyness but minimised effectiveness."
          />
        </div>
      </Card>

      <Card accent="34,197,94">
        <div className="text-sm font-bold mb-3" style={{ color: "#22c55e" }}>What Pull Got Right</div>
        <div className="flex flex-col gap-4">
          <Insight
            title="Quality is built in, not inspected in"
            body="In a pull system, the downstream stage actively chooses to pull work in. This creates a natural quality gate — if work isn't ready or doesn't meet standards, it won't be pulled. Quality is a feature of the system design, not an afterthought bolted on at the end."
          />
          <Insight
            title="Capacity is matched to demand"
            body="Pull systems are self-regulating. When downstream is full, upstream stops pushing — preventing the overproduction that plagues push systems. This is the supermarket principle Toyota discovered: shelves are restocked only when items are taken, not on a forecast."
          />
          <Insight
            title="People work right to left"
            body='When WIP limits prevent starting new work, team members look right — towards the finish line — for items they can help complete. This is the "stop starting, start finishing" principle. Instead of everyone working on their own item, teams swarm on blocked or aging items. More gets finished, faster.'
          />
          <Insight
            title="WIP limits create collaboration"
            body="Counter-intuitively, limiting work in progress forces people to work together. When your column is at its WIP limit, you can't start something new — so you help a colleague finish theirs. This breaks down silos and creates a shared ownership of flow."
          />
        </div>
      </Card>

      <Card accent="139,92,246">
        <div className="text-sm font-bold mb-2" style={{ color: "#a78bfa" }}>The Real-World Shift</div>
        <div className="text-[13px] leading-[1.75] mb-3" style={{ color: "var(--text-secondary)" }}>
          Most teams operate as push systems without realising it. Work is assigned by managers, deadlines
          are set externally, and &ldquo;being busy&rdquo; is confused with &ldquo;being productive&rdquo;.
          The shift to pull doesn&apos;t require new tools or processes &mdash; it requires a change in
          <strong style={{ color: "var(--text-primary)" }}> how work enters the system</strong>.
        </div>
        <div className="text-[13px] leading-[1.75] mb-3" style={{ color: "var(--text-secondary)" }}>
          A Kanban board with <strong style={{ color: "#22c55e" }}>WIP limits</strong> is a pull system.
          The WIP limit is the signal. When a column has space, it signals &ldquo;I have capacity&rdquo;.
          When it&apos;s full, it signals &ldquo;stop &mdash; help me finish what&apos;s here first&rdquo;.
        </div>
        <div
          className="rounded-lg px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "#a78bfa" }}>Key question to ask your team:</strong> &ldquo;When all
          our columns are full, what do we do?&rdquo; If the answer is &ldquo;start something new
          anyway&rdquo;, you&apos;re running a push system with a Kanban board shaped hat on.
        </div>
      </Card>

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Comparison</Btn>
        <Btn primary onClick={onNext}>Take the Quiz &rarr;</Btn>
      </div>
    </div>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{title}</div>
      <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>{body}</div>
    </div>
  );
}

/* ── Main Page ── */
export default function PullVsPushLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav
        step={step}
        labels={LABELS}
        onNav={setStep}
        canAdv={true}
      />

      {step === 0 && <IntroStep onNext={() => setStep(1)} />}
      {step === 1 && <ComparisonStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <InsightsStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <PullPushQuizStep onBack={() => setStep(2)} />}
    </>
  );
}
