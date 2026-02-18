"use client";

import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface IntroStepProps {
  onNext: () => void;
}

export function WipIntroStep({ onNext }: IntroStepProps) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader tag="Introduction" tagColor="#8b5cf6" title="Why limit work in progress?" />

      <div
        className="w-full aspect-video rounded-[14px] flex flex-col items-center justify-center mb-6 relative overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[22px] mb-2.5"
          style={{ background: "rgba(139,92,246,0.15)", border: "2px solid rgba(139,92,246,0.3)" }}
        >
          &#9654;
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-tertiary)" }}>Video: WIP Limits &amp; Flow</span>
        <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>4:20</span>
      </div>

      <div className="text-sm leading-[1.8] flex flex-col gap-3.5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          In Lesson 1, you discovered that <strong style={{ color: "var(--text-primary)" }}>smaller batches create smoother flow</strong>.
          But what happens when you have a real Kanban board with multiple stages, different workers, and unexpected blockers?
        </p>
        <p className="m-0">
          The answer is <strong style={{ color: "var(--text-primary)" }}>WIP limits</strong>. By capping the number of items allowed
          in each stage, you create a <strong className="text-violet-400">pull system</strong> that prevents overloading
          and naturally exposes bottlenecks.
        </p>
        <p className="m-0">
          In this simulation, you&apos;ll manage a Kanban board with three work stages:{" "}
          <strong className="text-red-400">Red</strong>,{" "}
          <strong className="text-blue-400">Blue</strong>, and{" "}
          <strong className="text-green-400">Green</strong>.
          Each has active and finished columns. You control <strong style={{ color: "var(--text-primary)" }}>6 workers</strong> (2 per colour) and must
          decide how to assign them each round.
        </p>
        <p className="m-0">
          The board comes pre-loaded with 45 days of history. You&apos;ll play <strong style={{ color: "var(--text-primary)" }}>15 rounds</strong> (days 46&ndash;60),
          then analyse the results using the same charts professional Kanban teams rely on.
        </p>

        <Card accent="139,92,246">
          <div className="text-[13px] font-bold text-violet-400 mb-2">Key Concepts You&apos;ll Explore</div>
          <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
            <strong className="text-violet-300">WIP limits</strong> &mdash; cap on items per stage.{" "}
            <strong className="text-violet-300">Work item age</strong> &mdash; how long each item has been in progress.{" "}
            <strong className="text-violet-300">Blockers</strong> &mdash; random impediments that require work to resolve.{" "}
            <strong className="text-violet-300">Cross-training</strong> &mdash; workers helping outside their specialty (at reduced output).{" "}
            <strong className="text-violet-300">Flow metrics</strong> &mdash; CFD, cycle time, throughput, aging WIP, and more.
          </div>
        </Card>

        <Card accent="59,130,246">
          <div className="text-[13px] font-bold text-blue-400 mb-2">How To Play</div>
          <div className="text-[13px] leading-[1.7] flex flex-col gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <div><strong className="text-blue-300">1.</strong> Select a worker from the pool, then click an item on the board to assign them.</div>
            <div><strong className="text-blue-300">2.</strong> Workers in their own colour roll 1&ndash;6 work. Cross-trained workers roll 1&ndash;3.</div>
            <div><strong className="text-blue-300">3.</strong> Click <strong className="text-blue-300">Resolve</strong> to process the round: work is applied, completed items advance, blockers may appear.</div>
            <div><strong className="text-blue-300">4.</strong> Adjust WIP limits using the settings panel. Watch how limits affect flow.</div>
            <div><strong className="text-blue-300">5.</strong> Special events (Compliance, Security) arrive mid-game with deadlines.</div>
          </div>
        </Card>
      </div>

      <div className="mt-7 flex justify-end">
        <Btn primary onClick={onNext}>Start the Simulation &rarr;</Btn>
      </div>
    </div>
  );
}
