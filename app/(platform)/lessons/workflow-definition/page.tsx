"use client";

import React, { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import Link from "next/link";

const LABELS = ["Elements", "Identify", "Review"];

// ─── Data ────────────────────────────────────────────────────

interface Element {
  id: string;
  label: string;
  color: string;
  icon: string;
  short: string;
  detail: string;
  example: string;
}

const ELEMENTS: Element[] = [
  {
    id: "units-of-value",
    label: "Units of Value",
    color: "#3b82f6",
    icon: "\u{1F4E6}",
    short: "The work items that flow through your system.",
    detail:
      "These are the individual items that move from left to right across your board. They represent the value being delivered. In software this might be user stories, bugs, or tasks. In marketing it might be campaigns. In healthcare, patients.",
    example: "In the Kanban Game, each card with red/blue/green work bars is a unit of value.",
  },
  {
    id: "commitment-point",
    label: "Start of Workflow",
    color: "#22c55e",
    icon: "\u{1F6AA}",
    short: "The commitment point \u2014 where work enters the workflow.",
    detail:
      "The start of the workflow is the commitment point \u2014 where the team commits to working on an item. Before this point, items sit in the backlog and can be freely reprioritised. After this point, the item is in the workflow and counts toward WIP. This is where the clock starts for cycle time measurement.",
    example:
      "In the Kanban Game, an item crosses the start of the workflow when you pull it from the Backlog into Red Active.",
  },
  {
    id: "delivery-point",
    label: "End of Workflow",
    color: "#22c55e",
    icon: "\u{1F3C1}",
    short: "The delivery point \u2014 where work exits the workflow.",
    detail:
      "The end of the workflow is the delivery point \u2014 where value is actually delivered to the customer or next system. This is where cycle time measurement ends. Everything between the start and end of the workflow is your system.",
    example: "In the Kanban Game, an item crosses the end of the workflow when it moves from Green into Done.",
  },
  {
    id: "workflow-states",
    label: "Workflow States",
    color: "#8b5cf6",
    icon: "\u{1F4CB}",
    short: "The stages work passes through between start and finish.",
    detail:
      "Workflow states represent the different stages of work. Each state should be something meaningful that happens to the item. States can be split into active (work happening) and queue (waiting for the next stage). This distinction is critical for measuring flow efficiency.",
    example:
      "In the Kanban Game: Red Active, Red Finished (queue), Blue Active, Blue Finished (queue), Green. Active states are where workers do work. Finished states are queues where items wait to be pulled.",
  },
  {
    id: "wip-control",
    label: "WIP Control",
    color: "#f59e0b",
    icon: "\u{1F6A7}",
    short: "How you limit the amount of work in progress.",
    detail:
      "WIP limits are the mechanism that turns a board from a to-do list into a pull system. You can set limits per column, per group of columns, per swimlane, or system-wide. Without WIP limits, there is no pull, no flow management, and no Kanban.",
    example:
      "In the Kanban Game, each colour stage has a WIP limit (Red: 4, Blue: 4, Green: 3). When a stage hits its limit, no new work can enter until something moves out.",
  },
  {
    id: "explicit-policies",
    label: "Explicit Policies",
    color: "#ef4444",
    icon: "\u{1F4DC}",
    short: "Clear rules for how work flows through each state.",
    detail:
      "Policies define the rules of the system: when is work ready to move? Who can pull it? What must be true before an item leaves a state? Making these explicit removes ambiguity and enables self-organisation. If the policy is in someone's head, it's not a policy \u2014 it's a bottleneck.",
    example:
      "In the Kanban Game: 'Red work bar must be complete before an item can move to Red Finished.' 'Items in finished states can only be pulled when the downstream stage has capacity.'",
  },
  {
    id: "sle",
    label: "Service Level Expectation",
    color: "#06b6d4",
    icon: "\u{23F1}\uFE0F",
    short: "Your target for how long items should take.",
    detail:
      "The SLE is a probabilistic target: 'We expect 85% of items to complete within X days.' It's not a deadline or a promise \u2014 it's a forecast based on your system's actual data. When items approach the SLE, they need attention. The SLE is what makes aging visible and actionable.",
    example:
      "In the Kanban Game, the SLE is 12 days. Cards turn amber at ~67% of SLE (8 days) and red when they breach it. This is the signal to focus on finishing, not starting.",
  },
];

// ─── Board Zones (for identification exercise) ──────────────

interface BoardZone {
  id: string;
  label: string;
  correctElementId: string;
}

const BOARD_ZONES: BoardZone[] = [
  { id: "z-sle", label: "SLE Banner", correctElementId: "sle" },
  { id: "z-wip", label: "WIP Limits", correctElementId: "wip-control" },
  { id: "z-states", label: "Workflow States", correctElementId: "workflow-states" },
  { id: "z-cards", label: "Work Items", correctElementId: "units-of-value" },
  { id: "z-policy", label: "Policy", correctElementId: "explicit-policies" },
  { id: "z-start", label: "Start of Workflow", correctElementId: "commitment-point" },
  { id: "z-end", label: "End of Workflow", correctElementId: "delivery-point" },
];

// ─── Step 1: Elements ────────────────────────────────────────

function ElementsStep({ onNext }: { onNext: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="fade-up max-w-[780px]">
      <StepHeader
        tag="Lesson 4.1"
        tagColor="#f59e0b"
        title="Defining a Workflow"
        desc="A Kanban system needs six minimum elements to function. Without any one of these, you have a board \u2014 but not a system. Tap each to learn more."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          In Lesson 2.1 you learned that Kanban has three core practices. The first is{" "}
          <strong style={{ color: "var(--text-primary)" }}>defining and visualising a workflow</strong>.
          This lesson teaches you what that actually means \u2014 the minimum viable elements
          every workflow needs.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {ELEMENTS.map((el) => {
          const isOpen = expanded === el.id;
          return (
            <button
              key={el.id}
              onClick={() => setExpanded(isOpen ? null : el.id)}
              className="w-full text-left rounded-xl p-4 border-none cursor-pointer transition-all"
              style={{
                background: isOpen ? `${el.color}06` : "var(--bg-surface)",
                border: isOpen ? `1px solid ${el.color}20` : "1px solid var(--border-faint)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${el.color}12`, border: `1px solid ${el.color}20` }}
                >
                  {el.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-bold"
                    style={{ color: isOpen ? el.color : "var(--text-primary)" }}
                  >
                    {el.label}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {el.short}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pl-12 flex flex-col gap-2 fade-up">
                  <div className="text-[12px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
                    {el.detail}
                  </div>
                  <div
                    className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                    style={{ background: `${el.color}08`, border: `1px solid ${el.color}15`, color: el.color }}
                  >
                    <strong>In the Kanban Game:</strong> {el.example}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Card style={{ marginTop: 20 }} accent="245,158,11">
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Why all six matter:</strong>{" "}
          A board without WIP limits is just a to-do list. WIP limits without explicit policies
          create confusion. Policies without an SLE give you no signal for when items need attention.
          These elements work as a system \u2014 remove one and the others lose their power.
        </div>
      </Card>

      <div className="flex justify-end mt-7">
        <Btn primary onClick={onNext}>Identify on the Board &rarr;</Btn>
      </div>
    </div>
  );
}

// ─── Step 2: Interactive Identification ──────────────────────

interface BoardCol {
  id: string;
  label: string;
  color: string;
  items: number;
  policy?: string;
}

const BOARD_COLUMNS: BoardCol[] = [
  { id: "backlog", label: "Backlog", color: "#64748b", items: 5 },
  { id: "red-active", label: "Red Active", color: "#ef4444", items: 2, policy: "Red work bar must be complete" },
  { id: "red-finished", label: "Red Done", color: "#f87171", items: 2, policy: "Pull only when Blue has capacity" },
  { id: "blue-active", label: "Blue Active", color: "#3b82f6", items: 2, policy: "Blue work bar must be complete" },
  { id: "blue-finished", label: "Blue Done", color: "#60a5fa", items: 1, policy: "Pull only when Green has capacity" },
  { id: "green", label: "Green", color: "#22c55e", items: 3, policy: "Green bar must be complete to finish" },
  { id: "done", label: "Done", color: "#a3e635", items: 8 },
];

interface WipGroup {
  label: string;
  color: string;
  colSpan: number;
  wipLimit: number;
  wipCount: number;
}

const WIP_GROUPS: (WipGroup | null)[] = [
  null, // backlog — no group header
  { label: "Red", color: "#ef4444", colSpan: 2, wipLimit: 4, wipCount: 4 },
  null, // skip (spanned by Red)
  { label: "Blue", color: "#3b82f6", colSpan: 2, wipLimit: 4, wipCount: 3 },
  null, // skip (spanned by Blue)
  { label: "Green", color: "#22c55e", colSpan: 1, wipLimit: 3, wipCount: 3 },
  null, // done — no group header
];

interface PlacedLabel {
  elementId: string;
  zoneId: string;
}

// ─── Reusable zone target wrapper ────────────────────────────

function ZoneTarget({
  zoneId,
  placements,
  showFeedback,
  selectedLabel,
  placedZoneIds,
  onZoneClick,
  children,
  className,
  vertical,
  style,
}: {
  zoneId: string;
  placements: PlacedLabel[];
  showFeedback: boolean;
  selectedLabel: string | null;
  placedZoneIds: Set<string>;
  onZoneClick: (zoneId: string) => void;
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
  style?: React.CSSProperties;
}) {
  const placement = placements.find((p) => p.zoneId === zoneId);
  const element = placement ? ELEMENTS.find((e) => e.id === placement.elementId) : null;
  const zone = BOARD_ZONES.find((z) => z.id === zoneId)!;
  const isCorrect = showFeedback && element && zone.correctElementId === element.id;
  const isWrong = showFeedback && element && zone.correctElementId !== element.id;
  const isTarget = selectedLabel && !placedZoneIds.has(zoneId);

  return (
    <button
      onClick={() => onZoneClick(zoneId)}
      className={`block w-full text-left border-none cursor-pointer rounded-lg transition-all relative ${className || ""}`}
      style={{
        background: element
          ? isCorrect
            ? "rgba(34,197,94,0.12)"
            : isWrong
            ? "rgba(239,68,68,0.12)"
            : `${element.color}08`
          : isTarget
          ? "rgba(59,130,246,0.06)"
          : "transparent",
        outline: element
          ? isCorrect
            ? "2px solid rgba(34,197,94,0.5)"
            : isWrong
            ? "2px solid rgba(239,68,68,0.5)"
            : `2px solid ${element.color}40`
          : isTarget
          ? "2px dashed rgba(59,130,246,0.3)"
          : "2px solid transparent",
        outlineOffset: "1px",
        padding: className ? undefined : "0",
        ...style,
      }}
    >
      {children}
      {element && (
        <div
          className={`absolute ${vertical ? "top-1/2 -translate-y-1/2 -right-1 translate-x-full" : "-top-0.5 left-1/2 -translate-x-1/2 -translate-y-full"} whitespace-nowrap z-20`}
        >
          <div
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm"
            style={{
              background: isCorrect ? "rgba(34,197,94,0.9)" : isWrong ? "rgba(239,68,68,0.9)" : element.color,
              color: "#fff",
            }}
          >
            {element.icon} {element.label}
            {isCorrect && " \u2713"}
            {isWrong && " \u2717"}
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Card renderer helper ────────────────────────────────────

function renderCards(col: BoardCol) {
  return (
    <>
      {Array.from({ length: Math.min(col.items, 3) }).map((_, i) => {
        const age = col.id === "green" && i === 0 ? 14 : col.id === "green" && i === 1 ? 9 : null;
        const isBlocked = col.id === "blue-active" && i === 1;
        return (
          <div
            key={i}
            className="rounded-md px-1 py-0.5 text-[7px] font-mono"
            style={{
              background: "var(--bg-surface)",
              border: age && age > 12
                ? "1px solid rgba(239,68,68,0.4)"
                : age && age > 8
                ? "1px solid rgba(245,158,11,0.4)"
                : "1px solid var(--border-faint)",
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }}>W-{col.id === "done" ? 10 + i : 25 + i}</span>
              {age !== null && (
                <span
                  className="text-[6px] font-bold px-0.5 rounded"
                  style={{
                    background: age > 12 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                    color: age > 12 ? "#ef4444" : "#f59e0b",
                  }}
                >
                  {age}d
                </span>
              )}
              {isBlocked && (
                <span
                  className="text-[6px] font-bold px-0.5 rounded"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                >
                  BLK
                </span>
              )}
            </div>
            <div className="flex gap-0.5 mt-0.5">
              <div className="h-0.5 flex-1 rounded-full" style={{ background: `${col.color}30` }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: col.id === "done" ? "100%" : `${40 + i * 20}%`, background: col.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
      {col.items > 3 && (
        <div className="text-[7px] text-center" style={{ color: "var(--text-muted)" }}>
          +{col.items - 3} more
        </div>
      )}
    </>
  );
}

function IdentifyStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [placements, setPlacements] = useState<PlacedLabel[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const placedElementIds = new Set(placements.map((p) => p.elementId));
  const placedZoneIds = new Set(placements.map((p) => p.zoneId));

  const handleZoneClick = (zoneId: string) => {
    if (!selectedLabel || showFeedback) return;
    // Remove any existing placement for this label or zone
    const updated = placements.filter((p) => p.elementId !== selectedLabel && p.zoneId !== zoneId);
    updated.push({ elementId: selectedLabel, zoneId });
    setPlacements(updated);
    setSelectedLabel(null);
  };

  const removePlacement = (elementId: string) => {
    if (showFeedback) return;
    setPlacements(placements.filter((p) => p.elementId !== elementId));
  };

  const checkAnswers = () => {
    setShowFeedback(true);
  };

  const correctCount = placements.filter((p) => {
    const zone = BOARD_ZONES.find((z) => z.id === p.zoneId);
    return zone && zone.correctElementId === p.elementId;
  }).length;

  const allPlaced = placements.length === ELEMENTS.length;
  const allCorrect = correctCount === ELEMENTS.length;

  const reset = () => {
    setPlacements([]);
    setShowFeedback(false);
    setSelectedLabel(null);
  };

  return (
    <div className="fade-up max-w-[900px]">
      <StepHeader
        tag="Identify the Elements"
        tagColor="#f59e0b"
        title="Find Them on the Board"
        desc="Here's the Kanban Game board you've already played. Tap a label below, then tap where it belongs on the board."
      />

      {/* Instructions */}
      <div
        className="rounded-xl p-3 mb-4 text-[12px]"
        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", color: "var(--text-secondary)" }}
      >
        <strong style={{ color: "#60a5fa" }}>How it works:</strong>{" "}
        1. Tap a label from the palette below.{" "}
        2. Tap a highlighted zone on the board to place it.{" "}
        3. Place all seven, then check your answers.
      </div>

      {/* Board Visualisation — each section is a clickable zone */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
      >
        {/* SLE Banner — own area above the board */}
        <ZoneTarget
          zoneId="z-sle"
          placements={placements}
          showFeedback={showFeedback}
          selectedLabel={selectedLabel}
          placedZoneIds={placedZoneIds}
          onZoneClick={handleZoneClick}
        >
          <div
            className="rounded-lg px-3 py-2 mb-3 flex items-center justify-between"
            style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{"\u{23F1}\uFE0F"}</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#06b6d4" }}>
                  Service Level Expectation
                </div>
                <div className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>
                  85% of items within <span style={{ color: "#06b6d4" }}>12 days</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>&lt;8d</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>8-12d</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>&gt;12d</span>
              </div>
            </div>
          </div>
        </ZoneTarget>

        {/* WIP Group Headers — flex layout for proper alignment */}
        <ZoneTarget
          zoneId="z-wip"
          placements={placements}
          showFeedback={showFeedback}
          selectedLabel={selectedLabel}
          placedZoneIds={placedZoneIds}
          onZoneClick={handleZoneClick}
        >
          <div className="flex gap-1 mb-1">
            {/* Backlog spacer */}
            <div className="flex-1" />
            {/* Red group: spans 2 columns */}
            <div
              className="flex-[2] rounded-t-lg px-2 py-1.5 text-center"
              style={{
                background: "rgba(239,68,68,0.05)",
                borderTop: "2px solid rgba(239,68,68,0.3)",
                borderLeft: "1px solid rgba(239,68,68,0.15)",
                borderRight: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div className="text-[9px] font-bold" style={{ color: "#ef4444" }}>Red</div>
              <div className="text-[9px] font-bold font-mono" style={{ color: "#ef4444" }}>WIP 4/4</div>
            </div>
            {/* Blue group: spans 2 columns */}
            <div
              className="flex-[2] rounded-t-lg px-2 py-1.5 text-center"
              style={{
                background: "rgba(59,130,246,0.05)",
                borderTop: "2px solid rgba(59,130,246,0.3)",
                borderLeft: "1px solid rgba(59,130,246,0.15)",
                borderRight: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <div className="text-[9px] font-bold" style={{ color: "#3b82f6" }}>Blue</div>
              <div className="text-[9px] font-bold font-mono" style={{ color: "var(--text-muted)" }}>WIP 3/4</div>
            </div>
            {/* Green group: 1 column */}
            <div
              className="flex-1 rounded-t-lg px-2 py-1.5 text-center"
              style={{
                background: "rgba(34,197,94,0.05)",
                borderTop: "2px solid rgba(34,197,94,0.3)",
                borderLeft: "1px solid rgba(34,197,94,0.15)",
                borderRight: "1px solid rgba(34,197,94,0.15)",
              }}
            >
              <div className="text-[9px] font-bold" style={{ color: "#22c55e" }}>Green</div>
              <div className="text-[9px] font-bold font-mono" style={{ color: "#ef4444" }}>WIP 3/3</div>
            </div>
            {/* Done spacer */}
            <div className="flex-1" />
          </div>
        </ZoneTarget>

        {/* Column headers — zone for Workflow States */}
        <ZoneTarget
          zoneId="z-states"
          placements={placements}
          showFeedback={showFeedback}
          selectedLabel={selectedLabel}
          placedZoneIds={placedZoneIds}
          onZoneClick={handleZoneClick}
        >
          <div className="flex gap-1 mb-1">
            {BOARD_COLUMNS.map((col) => (
              <div
                key={col.id}
                className="flex-1 rounded-lg px-1 py-1.5 text-center"
                style={{ background: `${col.color}10`, border: `1px solid ${col.color}20` }}
              >
                <div className="text-[9px] font-bold leading-tight" style={{ color: col.color }}>{col.label}</div>
              </div>
            ))}
          </div>
        </ZoneTarget>

        {/* Card bodies with start/end workflow markers as separate rows */}
        <div className="flex gap-1" style={{ minHeight: 180 }}>
          {BOARD_COLUMNS.map((col, ci) => {
            // Start of Workflow marker column
            const startMarker = ci === 1 && (
              <ZoneTarget
                key="z-start-marker"
                zoneId="z-start"
                placements={placements}
                showFeedback={showFeedback}
                selectedLabel={selectedLabel}
                placedZoneIds={placedZoneIds}
                onZoneClick={handleZoneClick}
                className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg"
                style={{ width: 28 }}
              >
                <div className="w-0.5 flex-1 rounded-full" style={{ background: "#22c55e" }} />
                <div
                  className="text-[7px] font-bold py-1 text-center leading-tight"
                  style={{ color: "#22c55e", writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  START
                </div>
                <div className="w-0.5 flex-1 rounded-full" style={{ background: "#22c55e" }} />
              </ZoneTarget>
            );

            // End of Workflow marker column
            const endMarker = ci === 6 && (
              <ZoneTarget
                key="z-end-marker"
                zoneId="z-end"
                placements={placements}
                showFeedback={showFeedback}
                selectedLabel={selectedLabel}
                placedZoneIds={placedZoneIds}
                onZoneClick={handleZoneClick}
                className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg"
                style={{ width: 28 }}
              >
                <div className="w-0.5 flex-1 rounded-full" style={{ background: "#22c55e" }} />
                <div
                  className="text-[7px] font-bold py-1 text-center leading-tight"
                  style={{ color: "#22c55e", writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  END
                </div>
                <div className="w-0.5 flex-1 rounded-full" style={{ background: "#22c55e" }} />
              </ZoneTarget>
            );

            const cardColumn = ci === 1 ? (
              <ZoneTarget
                key={`body-${col.id}`}
                zoneId="z-cards"
                placements={placements}
                showFeedback={showFeedback}
                selectedLabel={selectedLabel}
                placedZoneIds={placedZoneIds}
                onZoneClick={handleZoneClick}
                className="flex-1"
              >
                <div
                  className="rounded-lg p-1 flex flex-col gap-1 h-full"
                  style={{ background: `${col.color}05`, border: `1px solid ${col.color}10` }}
                >
                  {renderCards(col)}
                </div>
              </ZoneTarget>
            ) : (
              <div
                key={`body-${col.id}`}
                className="flex-1 rounded-lg p-1 flex flex-col gap-1"
                style={{ background: `${col.color}05`, border: `1px solid ${col.color}10` }}
              >
                {renderCards(col)}
              </div>
            );

            return (
              <React.Fragment key={col.id}>
                {startMarker}
                {endMarker}
                {cardColumn}
              </React.Fragment>
            );
          })}
        </div>

        {/* Policy text row */}
        <div className="flex gap-1 mt-1">
          {BOARD_COLUMNS.map((col, ci) => {
            // Spacers matching the start/end marker widths
            const startSpacer = ci === 1 && <div key="sp-start" style={{ width: 28 }} className="flex-shrink-0" />;
            const endSpacer = ci === 6 && <div key="sp-end" style={{ width: 28 }} className="flex-shrink-0" />;

            const policyContent = col.policy ? (
              ci === 2 ? (
                <ZoneTarget
                  key={`pol-${col.id}`}
                  zoneId="z-policy"
                  placements={placements}
                  showFeedback={showFeedback}
                  selectedLabel={selectedLabel}
                  placedZoneIds={placedZoneIds}
                  onZoneClick={handleZoneClick}
                  className="flex-1"
                >
                  <div
                    className="text-[7px] leading-tight rounded px-1 py-1 text-center"
                    style={{ color: "var(--text-muted)", background: `${col.color}06`, border: `1px dashed ${col.color}15` }}
                  >
                    {col.policy}
                  </div>
                </ZoneTarget>
              ) : (
                <div
                  key={`pol-${col.id}`}
                  className="flex-1 text-center px-0.5"
                >
                  <div
                    className="text-[7px] leading-tight rounded px-1 py-1"
                    style={{ color: "var(--text-muted)", background: `${col.color}06`, border: `1px dashed ${col.color}15` }}
                  >
                    {col.policy}
                  </div>
                </div>
              )
            ) : (
              <div key={`pol-${col.id}`} className="flex-1" />
            );

            return (
              <React.Fragment key={col.id}>
                {startSpacer}
                {endSpacer}
                {policyContent}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Label Palette */}
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Labels {placements.length > 0 && `(${placements.length}/${ELEMENTS.length} placed)`}
        </div>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const isPlaced = placedElementIds.has(el.id);
            const isSelected = selectedLabel === el.id;
            return (
              <button
                key={el.id}
                onClick={() => {
                  if (showFeedback) return;
                  if (isPlaced) {
                    removePlacement(el.id);
                    setSelectedLabel(el.id);
                  } else {
                    setSelectedLabel(isSelected ? null : el.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-all"
                style={{
                  background: isPlaced
                    ? `${el.color}08`
                    : isSelected
                    ? `${el.color}15`
                    : "var(--bg-surface)",
                  color: isPlaced ? "var(--text-muted)" : isSelected ? el.color : "var(--text-secondary)",
                  border: isSelected
                    ? `2px solid ${el.color}`
                    : isPlaced
                    ? "2px solid transparent"
                    : "2px solid var(--border-faint)",
                  opacity: isPlaced && !isSelected ? 0.5 : 1,
                  textDecoration: isPlaced ? "line-through" : "none",
                }}
              >
                {el.icon} {el.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {!showFeedback && allPlaced && (
          <Btn primary onClick={checkAnswers}>Check Answers</Btn>
        )}
        {showFeedback && (
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="text-sm font-bold"
              style={{ color: allCorrect ? "#22c55e" : correctCount >= 5 ? "#f59e0b" : "#ef4444" }}
            >
              {allCorrect
                ? "\u2713 Perfect! All elements correctly identified."
                : `${correctCount}/${ELEMENTS.length} correct. ${allCorrect ? "" : "Tap Reset to try again."}`}
            </div>
            {!allCorrect && <Btn onClick={reset}>Reset</Btn>}
          </div>
        )}
      </div>

      {/* Feedback detail */}
      {showFeedback && !allCorrect && (
        <div className="mt-4 flex flex-col gap-2 fade-up">
          {BOARD_ZONES.map((zone) => {
            const placement = placements.find((p) => p.zoneId === zone.id);
            const placedEl = placement ? ELEMENTS.find((e) => e.id === placement.elementId) : null;
            const correctEl = ELEMENTS.find((e) => e.id === zone.correctElementId)!;
            const isCorrect = placedEl && placedEl.id === correctEl.id;

            if (isCorrect) return null;
            return (
              <div
                key={zone.id}
                className="rounded-lg p-3 text-[11px]"
                style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Zone &ldquo;{zone.label}&rdquo;:</span>{" "}
                {placedEl ? (
                  <span style={{ color: "#ef4444" }}>
                    You placed <strong>{placedEl.label}</strong>.
                  </span>
                ) : (
                  <span style={{ color: "#ef4444" }}>Not labelled.</span>
                )}{" "}
                <span style={{ color: "#22c55e" }}>
                  Correct answer: <strong>{correctEl.label}</strong>
                </span>{" "}
                <span style={{ color: "var(--text-tertiary)" }}>&mdash; {correctEl.short}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between mt-7 flex-wrap gap-2.5">
        <Btn onClick={onBack}>&larr; Back</Btn>
        <Btn primary onClick={onNext}>Review &rarr;</Btn>
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
        title="The Definition of Workflow"
        desc="Let's bring it all together. These six elements form what the Kanban Guide calls the 'Definition of Workflow'."
      />

      <Card accent="245,158,11">
        <div className="text-[13px] font-bold mb-2" style={{ color: "#f59e0b" }}>
          Definition of Workflow
        </div>
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          A Kanban system must have a Definition of Workflow that contains, at minimum: a definition of
          the individual units of value, a defined start of workflow (commitment point), a defined end of
          workflow (delivery point), workflow states between start and end, how WIP will be controlled,
          explicit policies, and a Service Level Expectation.
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ELEMENTS.map((el) => (
          <div
            key={el.id}
            className="rounded-xl p-3.5 flex gap-2.5 items-start"
            style={{ background: `${el.color}05`, border: `1px solid ${el.color}12` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: `${el.color}12`, border: `1px solid ${el.color}20` }}
            >
              {el.icon}
            </div>
            <div>
              <div className="text-[12px] font-bold mb-0.5" style={{ color: el.color }}>
                {el.label}
              </div>
              <div className="text-[10px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {el.short}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-sm leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0 mb-3">
          <strong style={{ color: "var(--text-primary)" }}>This connects directly to The Goal.</strong>{" "}
          Without these elements, you can&apos;t be <em>effective</em> (you don&apos;t know what value looks like),
          <em> predictable</em> (you can&apos;t measure cycle time without a start and end of workflow),
          or <em>efficient</em> (you can&apos;t control WIP without limits and policies).
        </p>
        <p className="m-0">
          In the next lesson, you&apos;ll practise identifying these elements in real-world scenarios
          outside of the Kanban Game. Then in Lesson 4.3, you&apos;ll design your own board from scratch.
        </p>
      </div>

      <div
        className="mt-5 rounded-xl p-5 text-center"
        style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}
      >
        <div className="text-sm font-bold mb-2" style={{ color: "#f59e0b" }}>Up Next</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Identify workflow elements in real-world systems beyond the game board.
        </div>
        <Link href="/lessons/workflow-scenarios" className="no-underline">
          <Btn primary>Lesson 4.2: Identifying Workflows &rarr;</Btn>
        </Link>
      </div>

      <div className="flex justify-start mt-5">
        <Btn onClick={onBack}>&larr; Back</Btn>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function WorkflowDefinitionLesson() {
  const [step, setStep] = useState(0);

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={setStep} canAdv={true} />
      {step === 0 && <ElementsStep onNext={() => setStep(1)} />}
      {step === 1 && <IdentifyStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ReviewStep onBack={() => setStep(1)} />}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div className="w-2 h-10 rounded flex-shrink-0" style={{ background: "#f59e0b" }} />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Section 4 &middot; Workflow Visualisation
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Defining the Workflow
        </h1>
      </div>
    </div>
  );
}
