"use client";

import { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import Link from "next/link";

const LABELS = ["Scenarios", "Challenge", "Review"];

// ─── Scenario Data ───────────────────────────────────────────

interface WorkflowElement {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const ELEMENT_DEFS: WorkflowElement[] = [
  { id: "units-of-value", label: "Units of Value", icon: "\u{1F4E6}", color: "#3b82f6" },
  { id: "commitment-point", label: "Start of Workflow", icon: "\u{1F6AA}", color: "#22c55e" },
  { id: "delivery-point", label: "End of Workflow", icon: "\u{1F3C1}", color: "#22c55e" },
  { id: "workflow-states", label: "Workflow States", icon: "\u{1F4CB}", color: "#8b5cf6" },
  { id: "wip-control", label: "WIP Control", icon: "\u{1F6A7}", color: "#f59e0b" },
  { id: "explicit-policies", label: "Explicit Policies", icon: "\u{1F4DC}", color: "#ef4444" },
  { id: "sle", label: "Service Level Expectation", icon: "\u{23F1}\uFE0F", color: "#06b6d4" },
];

interface Scenario {
  id: string;
  title: string;
  icon: string;
  color: string;
  intro: string;
  context: string;
  elements: Record<string, { answer: string; explanation: string }>;
}

const SCENARIOS: Scenario[] = [
  {
    id: "drive-through",
    title: "Fast-Food Drive-Through",
    icon: "\u{1F354}",
    color: "#f59e0b",
    intro: "You visited this system in the Little\u2019s Law lesson. Now look at it through the lens of workflow definition.",
    context:
      "Cars arrive, place orders at the speaker, wait in a single-file lane, pay at Window 1, and collect food at Window 2. The lane holds a maximum of 6 cars. A timer on each screen tracks how long each car has been in the system.",
    elements: {
      "units-of-value": {
        answer: "Each customer order",
        explanation: "The value being delivered is a completed food order. Each car represents one unit of value moving through the system.",
      },
      "commitment-point": {
        answer: "The order speaker (start of workflow)",
        explanation: "Once the customer places their order at the speaker, the kitchen commits to preparing it. Before this point, the car can leave freely. This is the start of the workflow \u2014 the cycle time clock starts here.",
      },
      "delivery-point": {
        answer: "Window 2 \u2014 food collection (end of workflow)",
        explanation: "Value is delivered when the customer receives their food. This is the end of the workflow \u2014 the cycle time clock stops here.",
      },
      "workflow-states": {
        answer: "Order Placed \u2192 Kitchen Prep \u2192 Payment (Window 1) \u2192 Food Pickup (Window 2)",
        explanation: "Each state represents a distinct activity. Kitchen Prep is active work. The queue between ordering and payment is a wait state.",
      },
      "wip-control": {
        answer: "Lane capacity (max 6 cars)",
        explanation: "The physical lane limits how many cars can be in the system. When full, new cars wait before entering \u2014 this is a natural WIP limit creating a pull system.",
      },
      "explicit-policies": {
        answer: "\"Must pay before collecting food\", \"One lane, no overtaking\", \"Order accuracy check at window\"",
        explanation: "These rules govern how work flows. They remove ambiguity: every team member knows the sequence and conditions.",
      },
      sle: {
        answer: "\"90% of orders ready within 3 minutes\"",
        explanation: "The timer on each screen tracks order age. If a car has been waiting too long, staff know to prioritise it. This is the same principle as ageing on a Kanban board.",
      },
    },
  },
  {
    id: "software-team",
    title: "Software Development Team",
    icon: "\u{1F4BB}",
    color: "#3b82f6",
    intro: "A typical software team board. You might recognise this from your own work.",
    context:
      "A team has a backlog of user stories. Each sprint, they pull stories into \"In Progress\", then to \"Code Review\", then \"QA\", then \"Done\". The board shows WIP limits per column. Every Friday they review stories that have been in progress more than 10 days.",
    elements: {
      "units-of-value": {
        answer: "User stories (each representing a customer-facing feature or fix)",
        explanation: "Each story is a discrete unit of customer value that flows through the development process.",
      },
      "commitment-point": {
        answer: "Pulling a story into \"In Progress\" (start of workflow)",
        explanation: "When a developer pulls a story from the backlog into In Progress, the team commits to delivering it. This is the start of the workflow \u2014 cycle time starts here.",
      },
      "delivery-point": {
        answer: "Story moves to \"Done\" (end of workflow)",
        explanation: "Value is delivered when the story is in the hands of users. This is the end of the workflow \u2014 cycle time stops here.",
      },
      "workflow-states": {
        answer: "In Progress (active) \u2192 Code Review (queue/active) \u2192 QA (active) \u2192 Done",
        explanation: "Each column represents a different type of work. Code Review has both a queue (waiting for reviewer) and active (being reviewed) aspect.",
      },
      "wip-control": {
        answer: "Column-level WIP limits (e.g., In Progress: 4, Code Review: 3, QA: 2)",
        explanation: "Limits on each column prevent overloading any stage. When Code Review hits its limit, developers must help review before starting new work.",
      },
      "explicit-policies": {
        answer: "\"All tests must pass before entering Code Review\", \"Two approvals required for merge\", \"QA must have acceptance criteria met\"",
        explanation: "These policies define the transition rules between states. Without them, different team members make different decisions.",
      },
      sle: {
        answer: "\"85% of stories completed within 10 working days\"",
        explanation: "The Friday review of stories over 10 days is directly using the SLE. Stories approaching the SLE get attention before they breach it.",
      },
    },
  },
  {
    id: "hospital-er",
    title: "Hospital Emergency Department",
    icon: "\u{1F3E5}",
    color: "#ef4444",
    intro: "Healthcare was one of the industries you explored in Lesson 1.4. Now map the workflow elements.",
    context:
      "Patients arrive at the ED, are triaged by a nurse (categorised 1\u20135 by severity), wait in the waiting area, are seen by a doctor, receive treatment, then are either discharged or admitted. The department has a capacity of 30 patients. Triage category determines the target time to be seen.",
    elements: {
      "units-of-value": {
        answer: "Each patient (their care journey from arrival to disposition)",
        explanation: "The \"value\" is completing each patient\u2019s care. Each patient is a work item flowing through the system.",
      },
      "commitment-point": {
        answer: "Triage completion (start of workflow)",
        explanation: "Once triaged, the patient enters the ED workflow. Before triage, they could be redirected to a GP or urgent care. This is the start of the workflow \u2014 resources are allocated and the clock starts.",
      },
      "delivery-point": {
        answer: "Discharge or admission decision (end of workflow)",
        explanation: "The patient\u2019s ED journey is complete when they are either discharged home or admitted to a ward. This is the end of the workflow.",
      },
      "workflow-states": {
        answer: "Triage \u2192 Waiting \u2192 Assessment (doctor) \u2192 Treatment \u2192 Disposition (discharge/admit)",
        explanation: "Each state involves different staff and resources. The waiting area is a queue state; assessment and treatment are active states.",
      },
      "wip-control": {
        answer: "Department capacity (30 patients), treatment bay count, staff-to-patient ratios",
        explanation: "Physical bed count and staff availability naturally limit WIP. When the ED is full, ambulances may be diverted \u2014 a forced WIP limit.",
      },
      "explicit-policies": {
        answer: "\"Category 1: immediate resuscitation\", \"Category 3: seen within 30 minutes\", \"Senior review required before discharge\"",
        explanation: "Triage categories are explicit policies that determine priority and resource allocation. Discharge policies prevent unsafe early release.",
      },
      sle: {
        answer: "\"95% of Category 3 patients seen within 30 minutes\", \"4-hour target for total ED stay\"",
        explanation: "Each triage category has its own SLE. The 4-hour target is a system-wide SLE. Both create urgency signals when patients approach the time limit.",
      },
    },
  },
];

// ─── Step 1: Guided Scenarios ─────────────────────────────────

function ScenariosStep({ onNext }: { onNext: () => void }) {
  const [activeScenario, setActiveScenario] = useState(0);
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set());
  const scenario = SCENARIOS[activeScenario];

  const toggleElement = (elementId: string) => {
    setRevealedElements((prev) => {
      const next = new Set(prev);
      const key = `${scenario.id}:${elementId}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const revealedCount = ELEMENT_DEFS.filter((e) =>
    revealedElements.has(`${scenario.id}:${e.id}`),
  ).length;
  const allRevealed = revealedCount === ELEMENT_DEFS.length;

  return (
    <div className="fade-up max-w-[800px]">
      <StepHeader
        tag="Lesson 4.2"
        tagColor="#f59e0b"
        title="Identifying Workflows"
        desc="The same seven elements appear in every system that manages flow. Explore three real-world scenarios and find them."
      />

      {/* Scenario Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(i)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border-none cursor-pointer transition-all"
            style={{
              background: activeScenario === i ? `${s.color}15` : "var(--bg-surface)",
              color: activeScenario === i ? s.color : "var(--text-muted)",
              border: activeScenario === i ? `2px solid ${s.color}40` : "2px solid var(--border-faint)",
            }}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {/* Scenario Context */}
      <Card accent={scenario.color.replace("#", "").match(/../g)?.map((h) => parseInt(h, 16)).join(",") || "59,130,246"}>
        <div className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
          {scenario.intro}
        </div>
        <div className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
          {scenario.context}
        </div>
      </Card>

      {/* Element Cards — tap to reveal */}
      <div className="text-[10px] font-bold uppercase tracking-wider mt-5 mb-2" style={{ color: "var(--text-muted)" }}>
        Tap each element to see how it applies ({revealedCount}/{ELEMENT_DEFS.length})
      </div>

      <div className="flex flex-col gap-2">
        {ELEMENT_DEFS.map((el) => {
          const key = `${scenario.id}:${el.id}`;
          const isRevealed = revealedElements.has(key);
          const data = scenario.elements[el.id];

          return (
            <button
              key={el.id}
              onClick={() => toggleElement(el.id)}
              className="w-full text-left rounded-xl p-3.5 border-none cursor-pointer transition-all"
              style={{
                background: isRevealed ? `${el.color}06` : "var(--bg-surface)",
                border: isRevealed ? `1px solid ${el.color}20` : "1px solid var(--border-faint)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${el.color}12`, border: `1px solid ${el.color}20` }}
                >
                  {el.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold" style={{ color: isRevealed ? el.color : "var(--text-primary)" }}>
                    {el.label}
                    {!isRevealed && (
                      <span className="text-[10px] font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                        Tap to reveal
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                  {isRevealed ? "\u25B2" : "\u25BC"}
                </div>
              </div>

              {isRevealed && (
                <div className="mt-3 pl-[42px] fade-up">
                  <div
                    className="rounded-lg px-3 py-2 mb-2"
                    style={{ background: `${el.color}08`, border: `1px solid ${el.color}15` }}
                  >
                    <div className="text-[11px] font-bold mb-0.5" style={{ color: el.color }}>
                      {data.answer}
                    </div>
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {data.explanation}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {allRevealed && (
        <div className="mt-4 text-center fade-up">
          <div className="text-[11px] mb-2" style={{ color: "var(--text-muted)" }}>
            {activeScenario < SCENARIOS.length - 1
              ? "Try the next scenario, or continue to the challenge."
              : "All scenarios explored. Ready for the challenge?"}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>Take the Challenge &rarr;</Btn>
      </div>
    </div>
  );
}

// ─── Step 2: Challenge (Match Elements to Scenarios) ─────────

interface ChallengeQuestion {
  id: string;
  scenario: string;
  scenarioIcon: string;
  clue: string;
  correctElementId: string;
  feedback: string;
}

const CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  {
    id: "q1",
    scenario: "Drive-Through",
    scenarioIcon: "\u{1F354}",
    clue: "The physical lane can only hold 6 cars. When it\u2019s full, arriving cars have to wait before entering the system.",
    correctElementId: "wip-control",
    feedback: "The lane capacity is a natural WIP limit. It physically prevents the system from being overloaded \u2014 the essence of pull.",
  },
  {
    id: "q2",
    scenario: "Hospital ED",
    scenarioIcon: "\u{1F3E5}",
    clue: "\"Category 2 patients must be seen by a doctor within 10 minutes of triage completion.\"",
    correctElementId: "sle",
    feedback: "This is a Service Level Expectation \u2014 a time-based target tied to a percentile of cases. It creates urgency signals for ageing items.",
  },
  {
    id: "q3",
    scenario: "Software Team",
    scenarioIcon: "\u{1F4BB}",
    clue: "A developer picks up a story from the backlog column and moves it to \"In Progress\". From this moment, the cycle time clock starts.",
    correctElementId: "commitment-point",
    feedback: "This is the start of the workflow \u2014 the commitment point. Before this, the story could be reprioritised freely. After this, the team is committed and time is measured.",
  },
  {
    id: "q4",
    scenario: "Drive-Through",
    scenarioIcon: "\u{1F354}",
    clue: "The customer receives their bag of food and drives away. The timer on the screen stops.",
    correctElementId: "delivery-point",
    feedback: "This is the end of the workflow \u2014 the delivery point. Value is delivered when the customer gets their food. The timer stopping represents the end of cycle time measurement.",
  },
  {
    id: "q5",
    scenario: "Hospital ED",
    scenarioIcon: "\u{1F3E5}",
    clue: "\"A senior doctor must review the diagnosis and treatment plan before any patient can be discharged.\"",
    correctElementId: "explicit-policies",
    feedback: "This is an explicit policy \u2014 a clear rule governing state transitions. Without it, different staff might apply different standards.",
  },
  {
    id: "q6",
    scenario: "Software Team",
    scenarioIcon: "\u{1F4BB}",
    clue: "In Progress \u2192 Code Review \u2192 QA \u2192 Done. Each column represents a different kind of work being performed on the story.",
    correctElementId: "workflow-states",
    feedback: "These are the workflow states. Each represents a distinct activity. Together they form the path from commitment to delivery.",
  },
  {
    id: "q7",
    scenario: "Hospital ED",
    scenarioIcon: "\u{1F3E5}",
    clue: "Each patient arriving at the emergency department. Their entire care journey from arrival to discharge is what the system manages.",
    correctElementId: "units-of-value",
    feedback: "Each patient is a unit of value. The \"value\" is their complete care journey. This is what flows through the system.",
  },
];

function ChallengeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = CHALLENGE_QUESTIONS[currentQ];
  const isCorrect = selectedAnswer === question.correctElementId;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setAnswered(true);
    if (selectedAnswer === question.correctElementId) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < CHALLENGE_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const pct = Math.round((score / CHALLENGE_QUESTIONS.length) * 100);
    const great = pct >= 85;
    const ok = pct >= 60;

    return (
      <div className="fade-up max-w-[700px]">
        <StepHeader
          tag="Challenge Complete"
          tagColor="#f59e0b"
          title={great ? "Excellent Work!" : ok ? "Good Effort!" : "Keep Practising!"}
          desc={`You scored ${score}/${CHALLENGE_QUESTIONS.length} (${pct}%).`}
        />

        <Card accent={great ? "34,197,94" : ok ? "245,158,11" : "239,68,68"}>
          <div className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {great
              ? "You can confidently identify workflow elements across different domains. These same patterns appear in every system that manages flow \u2014 from fast food to hospitals to software teams."
              : ok
              ? "You\u2019re getting the hang of it! The key insight is that every system that manages flow has the same structural elements, just expressed differently."
              : "The elements can look very different across industries, but they always serve the same purpose. Review the scenarios and try to connect each element to its function in the system."}
          </div>
        </Card>

        <div className="flex justify-between mt-7 flex-wrap gap-2.5">
          <Btn onClick={() => { setCurrentQ(0); setSelectedAnswer(null); setAnswered(false); setScore(0); setCompleted(false); }}>
            Retry Challenge
          </Btn>
          <Btn primary onClick={onNext}>Review &rarr;</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up max-w-[750px]">
      <StepHeader
        tag={`Question ${currentQ + 1} of ${CHALLENGE_QUESTIONS.length}`}
        tagColor="#f59e0b"
        title="Identify the Element"
        desc="Read the clue and select which workflow element it describes."
      />

      {/* Progress */}
      <div className="flex gap-1 mb-5">
        {CHALLENGE_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              background: i < currentQ ? "#22c55e" : i === currentQ ? "#f59e0b" : "var(--border-faint)",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <Card accent="245,158,11">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{question.scenarioIcon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {question.scenario}
          </span>
        </div>
        <div className="text-[14px] leading-[1.7]" style={{ color: "var(--text-primary)" }}>
          {question.clue}
        </div>
      </Card>

      {/* Answer Options */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ELEMENT_DEFS.map((el) => {
          const isSelected = selectedAnswer === el.id;
          const isAnswer = answered && el.id === question.correctElementId;
          const isWrong = answered && isSelected && !isCorrect;

          return (
            <button
              key={el.id}
              onClick={() => { if (!answered) setSelectedAnswer(el.id); }}
              className="rounded-xl p-3 border-none cursor-pointer transition-all text-left flex items-center gap-2.5"
              style={{
                background: isAnswer
                  ? "rgba(34,197,94,0.08)"
                  : isWrong
                  ? "rgba(239,68,68,0.08)"
                  : isSelected
                  ? `${el.color}10`
                  : "var(--bg-surface)",
                border: isAnswer
                  ? "2px solid rgba(34,197,94,0.4)"
                  : isWrong
                  ? "2px solid rgba(239,68,68,0.4)"
                  : isSelected
                  ? `2px solid ${el.color}60`
                  : "2px solid var(--border-faint)",
                cursor: answered ? "default" : "pointer",
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: `${el.color}12` }}
              >
                {el.icon}
              </div>
              <span className="text-[12px] font-bold" style={{ color: isAnswer ? "#22c55e" : isWrong ? "#ef4444" : "var(--text-primary)" }}>
                {el.label}
              </span>
              {isAnswer && <span className="ml-auto text-[14px]">{"\u2713"}</span>}
              {isWrong && <span className="ml-auto text-[14px]">{"\u2717"}</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className="mt-4 rounded-xl p-4 fade-up text-[12px] leading-relaxed"
          style={{
            background: isCorrect ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)",
            border: isCorrect ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(239,68,68,0.15)",
            color: "var(--text-secondary)",
          }}
        >
          <strong style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}>
            {isCorrect ? "Correct!" : `Not quite \u2014 the answer is ${ELEMENT_DEFS.find((e) => e.id === question.correctElementId)?.label}.`}
          </strong>{" "}
          {question.feedback}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between mt-5 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Scenarios</Btn>
        <div className="flex gap-2">
          {!answered && (
            <Btn primary onClick={handleSubmit} disabled={!selectedAnswer}>
              Check Answer
            </Btn>
          )}
          {answered && (
            <Btn primary onClick={handleNext}>
              {currentQ < CHALLENGE_QUESTIONS.length - 1 ? "Next Question \u2192" : "See Results \u2192"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Review ──────────────────────────────────────────

function ReviewStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="fade-up max-w-[740px]">
      <StepHeader
        tag="Review"
        tagColor="#f59e0b"
        title="Workflows Are Everywhere"
        desc="The same seven elements appear in every system that manages flow \u2014 regardless of industry."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          <strong style={{ color: "var(--text-primary)" }}>The key insight:</strong>{" "}
          A drive-through, a software team, and a hospital emergency department look completely
          different on the surface. But they all need the same structural elements to manage flow
          effectively.
        </p>
        <p className="m-0">
          This is why Kanban is not a methodology for software teams \u2014 it&apos;s a{" "}
          <strong style={{ color: "var(--text-primary)" }}>strategy for optimising flow</strong>{" "}
          that applies to any knowledge work or service delivery system.
        </p>
      </div>

      {/* Pattern comparison */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-faint)" }}>
        <div
          className="grid grid-cols-4 text-[9px] font-bold uppercase tracking-wider py-2 px-3"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
        >
          <div>Element</div>
          <div>{"\u{1F354}"} Drive-Through</div>
          <div>{"\u{1F4BB}"} Software</div>
          <div>{"\u{1F3E5}"} Hospital</div>
        </div>
        {ELEMENT_DEFS.map((el, i) => (
          <div
            key={el.id}
            className="grid grid-cols-4 text-[10px] py-2 px-3 items-start gap-1"
            style={{
              background: i % 2 === 0 ? "transparent" : "var(--bg-surface)",
              borderTop: "1px solid var(--border-faint)",
            }}
          >
            <div className="font-bold flex items-center gap-1" style={{ color: el.color }}>
              <span>{el.icon}</span> {el.label}
            </div>
            {SCENARIOS.map((sc) => (
              <div key={sc.id} className="leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {sc.elements[el.id].answer}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Card style={{ marginTop: 20 }} accent="245,158,11">
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Remember:</strong>{" "}
          In Lesson 4.1, you learned what the elements are and identified them on the Kanban Game board.
          Now you&apos;ve seen them in the real world. In the next lesson, you&apos;ll{" "}
          <strong style={{ color: "#f59e0b" }}>design your own board</strong>{" "}
          \u2014 choosing columns, setting WIP limits, writing policies, and creating a complete
          Definition of Workflow.
        </div>
      </Card>

      <div
        className="mt-5 rounded-xl p-5 text-center"
        style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}
      >
        <div className="text-sm font-bold mb-2" style={{ color: "#f59e0b" }}>Up Next</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Design your own Kanban board with columns, swimlanes, WIP limits, and explicit policies.
        </div>
        <Link href="/lessons/board-designer" className="no-underline">
          <Btn primary>Lesson 4.3: Design Your Board &rarr;</Btn>
        </Link>
      </div>

      <div className="flex justify-start mt-5">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function WorkflowScenariosLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <ScenariosStep onNext={() => setStep(1)} />}
      {step === 1 && <ChallengeStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ReviewStep onBack={() => setStep(1)} />}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-5 rounded-full" style={{ background: "#f59e0b" }} />
        <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: "#f59e0b" }}>
          Section 4 &middot; Workflow Visualisation
        </span>
      </div>
    </div>
  );
}
