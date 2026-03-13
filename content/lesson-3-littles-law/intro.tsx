"use client";

import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";

interface IntroProps {
  onNext: () => void;
}

export function LittlesLawIntro({ onNext }: IntroProps) {
  return (
    <div className="fade-up max-w-[720px]">
      <StepHeader
        tag="Lesson 3"
        tagColor="#f59e0b"
        title="Little's Law"
        desc="The most important equation in flow-based work management. Simple, universal, and surprisingly powerful."
      />

      <Card>
        <div className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          What is Little&apos;s Law?
        </div>
        <div className="text-[13px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          In 1961, Professor <strong style={{ color: "#f59e0b" }}>John D.C. Little</strong> proved a
          deceptively simple relationship that holds true for any stable system where things arrive,
          get worked on, and leave:
        </div>

        {/* Formula */}
        <div
          className="my-5 rounded-xl py-5 px-6 text-center"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <div className="text-lg font-bold font-mono mb-2" style={{ color: "#fbbf24" }}>
            Avg Cycle Time = Avg WIP &divide; Avg Throughput
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            or equivalently: WIP = Throughput &times; Cycle Time
          </div>
        </div>

        <div className="text-[13px] leading-[1.8] mb-4" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Three terms, one relationship:</strong>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {[
            { term: "WIP", desc: "Work in Progress \u2014 how many items are currently in the system (started but not finished)", color: "#8b5cf6" },
            { term: "Throughput", desc: "The rate at which items leave the system (items completed per unit of time)", color: "#22c55e" },
            { term: "Cycle Time", desc: "How long an individual item spends in the system from start to finish", color: "#f59e0b" },
          ].map(({ term, desc, color }) => (
            <div key={term} className="flex items-start gap-3">
              <div
                className="rounded-lg px-2.5 py-1 text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
              >
                {term}
              </div>
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{desc}</div>
            </div>
          ))}
        </div>

        <div className="text-[13px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          The power of Little&apos;s Law is its universality. It applies to a McDonald&apos;s drive-through,
          a hospital A&amp;E department, a software team&apos;s Kanban board, or a factory production line.
          If you want to reduce how long things take (<strong style={{ color: "#f59e0b" }}>cycle time</strong>),
          you have exactly two levers: increase <strong style={{ color: "#22c55e" }}>throughput</strong> or
          reduce <strong style={{ color: "#8b5cf6" }}>WIP</strong>. And reducing WIP is usually the
          easier, cheaper, and faster option.
        </div>
      </Card>

      <Card accent="245,158,11">
        <div className="text-sm font-bold text-amber-400 mb-2">What You&apos;ll Do</div>
        <div className="text-[13px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          You&apos;ll run a <strong style={{ color: "var(--text-primary)" }}>McDonald&apos;s drive-through simulation</strong> seen
          from above. Cars arrive, queue to order, pay, wait for food from the kitchen, then leave.
          You control:
        </div>
        <ul className="text-[13px] leading-[1.8] mt-2 list-disc pl-5" style={{ color: "var(--text-secondary)" }}>
          <li><strong style={{ color: "#3b82f6" }}>Arrival rate</strong> &mdash; how often new cars show up</li>
          <li><strong style={{ color: "#a78bfa" }}>Order windows</strong> &mdash; 1 or 2 terminals</li>
          <li><strong style={{ color: "#fbbf24" }}>Kitchen staff</strong> &mdash; 1 to 4 workers</li>
        </ul>
        <div className="text-[13px] leading-[1.8] mt-3" style={{ color: "var(--text-secondary)" }}>
          Watch the <strong style={{ color: "var(--text-primary)" }}>cumulative flow chart</strong> update
          in real time. When arrivals outpace departures, you&apos;ll see WIP build up and cycle times
          balloon. The queue will grow without limit until you act. Little&apos;s Law will be staring
          you right in the face.
        </div>
      </Card>

      <div className="flex justify-end mt-5">
        <Btn primary onClick={onNext}>Start Simulation &rarr;</Btn>
      </div>
    </div>
  );
}
