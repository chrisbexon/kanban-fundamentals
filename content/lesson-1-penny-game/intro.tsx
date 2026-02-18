"use client";

import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader tag="Introduction" tagColor="#3b82f6" title="Why does batch size matter?" />

      <div
        className="w-full aspect-video rounded-[14px] flex flex-col items-center justify-center mb-6 relative overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))",
          border: "1px solid rgba(59,130,246,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(59,130,246,0.06) 0%, transparent 60%)" }} />
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[22px] mb-2.5 transition-transform duration-200"
          style={{ background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.3)" }}
        >
          &#9654;
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-tertiary)" }}>Video: Introduction to Flow &amp; Batch Size</span>
        <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>3:45</span>
      </div>

      <div className="text-sm leading-[1.8] flex flex-col gap-3.5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          Imagine you&apos;re running a coin workshop. Each coin must pass through four stages:{" "}
          <strong className="text-amber-500">Mint</strong>,{" "}
          <strong className="text-blue-500">Press</strong>,{" "}
          <strong className="text-emerald-500">Polish</strong>, and{" "}
          <strong className="text-violet-500">Inspect</strong>.
          One worker handles each stage, processing coins one at a time.
        </p>
        <p className="m-0">
          The traditional approach is <strong style={{ color: "var(--text-primary)" }}>large batches</strong>: send all 20 coins to Mint, wait for all 20 to finish, then move them all to Press. It feels efficient &mdash; everyone stays busy. But what happens to the first coin? It sits idle waiting for the other 19.
        </p>
        <p className="m-0">
          Now add reality: each coin takes a <strong style={{ color: "var(--text-primary)" }}>different amount of time</strong> at each stage. With large batches, the whole group moves at the speed of the <em>slowest</em> coin.
        </p>
        <Card accent="139,92,246">
          <div className="text-[13px] font-bold text-violet-400 mb-2">Key Concepts You&apos;ll Explore</div>
          <div className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
            <strong className="text-violet-300">Batch size</strong> &mdash; how many items move together.{" "}
            <strong className="text-violet-300">Lead time</strong> &mdash; start to finish for one item.{" "}
            <strong className="text-violet-300">Cycle time</strong> &mdash; time in the system.{" "}
            <strong className="text-violet-300">WIP</strong> &mdash; items started but not finished.{" "}
            <strong className="text-violet-300">Pull system</strong> &mdash; work moves only when ready.{" "}
            <strong className="text-violet-300">Throughput</strong> &mdash; items completed per unit of time.
          </div>
        </Card>
      </div>
      <div className="mt-7 flex justify-end">
        <Btn primary onClick={onNext}>Start the Simulation &rarr;</Btn>
      </div>
    </div>
  );
}
