"use client";

import React, { useState } from "react";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { StepHeader } from "@/components/lesson/step-header";
import type { BoardDefinition, ColumnDefinition, SubColumnDefinition, BoardSettings } from "@/types/board";
import { DEFAULT_BOARD_SETTINGS } from "@/types/board";
import { useBoardDesigner } from "@/hooks/use-board-designer";
import { LiveBoardStep } from "@/components/game/board-designer/live-board-step";

const LABELS = ["Choose Template", "Live Board"];

// ─── Templates ──────────────────────────────────────────────

function col(
  id: string, name: string, type: ColumnDefinition["type"], color: string,
  opts?: { wipLimit?: number; policy?: string; subColumns?: SubColumnDefinition[] },
): ColumnDefinition {
  return {
    id, name, type, color,
    policy: opts?.policy || "",
    wipLimit: opts?.wipLimit ?? null,
    subColumns: opts?.subColumns || [],
    width: 1,
  };
}

/** Helper to build a template board where columns live inside the swimlane */
function tplBoard(
  id: string, name: string, desc: string,
  columns: ColumnDefinition[],
  itemTypes: BoardDefinition["itemTypes"],
  settings: Partial<BoardSettings> = {},
): BoardDefinition {
  return {
    id,
    name,
    description: desc,
    columns, // kept in sync for backward compat / validation
    columnGroups: [],
    swimlanes: [{
      id: "default", name: "Standard", color: "#64748b",
      wipLimit: null, order: 0, policy: "", columns,
      expediteEnabled: false, expediteWipLimit: null, expeditePolicy: "",
    }],
    itemTypes,
    settings: { ...DEFAULT_BOARD_SETTINGS, ...settings },
  };
}

interface Template {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  board: BoardDefinition;
}

const TEMPLATES: Template[] = [
  {
    id: "software",
    title: "Software Team",
    icon: "\u{1F4BB}",
    color: "#3b82f6",
    desc: "Backlog \u2192 Analysis \u2192 Development \u2192 Review \u2192 Done. Classic software delivery flow with doing/done splits.",
    board: tplBoard("tpl-software", "Software Team Board", "A software delivery workflow", [
      col("backlog", "Backlog", "backlog", "#64748b", { policy: "Prioritised items ready to be pulled." }),
      col("analysis", "Analysis", "active", "#3b82f6", {
        wipLimit: 3,
        subColumns: [
          { id: "analysis-doing", name: "Doing", type: "active", policy: "" },
          { id: "analysis-done", name: "Done", type: "queue", policy: "Requirements documented and accepted." },
        ],
      }),
      col("development", "Development", "active", "#8b5cf6", {
        wipLimit: 4,
        subColumns: [
          { id: "dev-doing", name: "Doing", type: "active", policy: "" },
          { id: "dev-done", name: "Done", type: "queue", policy: "Code complete, tests passing." },
        ],
      }),
      col("review", "Review", "active", "#f59e0b", { wipLimit: 2, policy: "Peer-reviewed and accepted." }),
      col("done", "Done", "done", "#22c55e", { policy: "Deployed to production." }),
    ], [
      { id: "story", name: "User Story", color: "#3b82f6", icon: "\u{1F4DD}", defaultSwimlane: null },
      { id: "bug", name: "Bug", color: "#ef4444", icon: "\u{1F41B}", defaultSwimlane: null },
    ], { sleDays: 12 }),
  },
  {
    id: "marketing",
    title: "Marketing Team",
    icon: "\u{1F4E3}",
    color: "#ec4899",
    desc: "Backlog \u2192 Brief \u2192 Creative \u2192 Approval \u2192 Published. Content production with review gates.",
    board: tplBoard("tpl-marketing", "Marketing Board", "Content production workflow", [
      col("backlog", "Backlog", "backlog", "#64748b", { policy: "Campaign ideas prioritised by impact." }),
      col("brief", "Brief", "active", "#f59e0b", { wipLimit: 3, policy: "Brief approved by stakeholder." }),
      col("creative", "Creative", "active", "#ec4899", {
        wipLimit: 4,
        subColumns: [
          { id: "creative-doing", name: "In Progress", type: "active", policy: "" },
          { id: "creative-done", name: "Ready for Review", type: "queue", policy: "Assets complete and on-brand." },
        ],
      }),
      col("approval", "Approval", "active", "#8b5cf6", { wipLimit: 2, policy: "Signed off by brand manager." }),
      col("done", "Published", "done", "#22c55e", { policy: "Live and tracked." }),
    ], [
      { id: "campaign", name: "Campaign", color: "#ec4899", icon: "\u{1F4E3}", defaultSwimlane: null },
      { id: "content", name: "Content Piece", color: "#3b82f6", icon: "\u{1F4DD}", defaultSwimlane: null },
    ], { sleDays: 10 }),
  },
  {
    id: "support",
    title: "Support / IT",
    icon: "\u{1F6E0}\uFE0F",
    color: "#06b6d4",
    desc: "Inbox \u2192 Triage \u2192 Investigation \u2192 Resolution \u2192 Closed. Ticket-based flow with triage gate.",
    board: tplBoard("tpl-support", "Support Board", "IT support ticket workflow", [
      col("inbox", "Inbox", "backlog", "#64748b", { policy: "All incoming requests land here." }),
      col("triage", "Triage", "queue", "#f59e0b", { wipLimit: 5, policy: "Categorised and prioritised within 4 hours." }),
      col("investigation", "Investigation", "active", "#3b82f6", { wipLimit: 3, policy: "Root cause identified." }),
      col("resolution", "Resolution", "active", "#8b5cf6", { wipLimit: 3, policy: "Fix applied and verified." }),
      col("done", "Closed", "done", "#22c55e", { policy: "Customer confirmed resolution." }),
    ], [
      { id: "ticket", name: "Ticket", color: "#06b6d4", icon: "\u{1F3AB}", defaultSwimlane: null },
      { id: "incident", name: "Incident", color: "#ef4444", icon: "\u{1F6A8}", defaultSwimlane: null },
    ], { sleDays: 5 }),
  },
  {
    id: "custom",
    title: "Start from Scratch",
    icon: "\u{2728}",
    color: "#f59e0b",
    desc: "A minimal board with Backlog, In Progress, and Done. Add your own columns and configure everything.",
    board: tplBoard("tpl-custom", "My Board", "", [
      col("backlog", "Backlog", "backlog", "#64748b"),
      col("in-progress", "In Progress", "active", "#3b82f6", { wipLimit: 3 }),
      col("done", "Done", "done", "#22c55e"),
    ], [
      { id: "item", name: "Work Item", color: "#3b82f6", icon: "\u{1F4E6}", defaultSwimlane: null },
    ]),
  },
];

// ─── Step 0: Choose Context ─────────────────────────────────

function ContextStep({
  onSelect,
}: {
  onSelect: (board: BoardDefinition) => void;
}) {
  return (
    <div className="fade-up max-w-[780px]">
      <StepHeader
        tag="Lesson 4.3"
        tagColor="#f59e0b"
        title="Design Your Board"
        desc="Apply everything you&apos;ve learned. Choose a starting template, then customise it to create a complete Definition of Workflow."
      />

      <div className="text-sm leading-[1.8] mb-5" style={{ color: "var(--text-secondary)" }}>
        <p className="m-0">
          In Lessons 4.1 and 4.2 you learned the seven elements every workflow needs and
          identified them in real-world systems. Now you&apos;ll{" "}
          <strong style={{ color: "var(--text-primary)" }}>build your own board from scratch</strong>,
          run work items through it, and watch the flow metrics come alive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(JSON.parse(JSON.stringify(tpl.board)))}
            className="text-left rounded-xl p-4 border-none cursor-pointer transition-all group"
            style={{
              background: "var(--bg-surface)",
              border: `1px solid ${tpl.color}20`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${tpl.color}10`, border: `1px solid ${tpl.color}20` }}
              >
                {tpl.icon}
              </div>
              <div>
                <div className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {tpl.title}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {tpl.desc}
                </div>
              </div>
            </div>
            <div className="mt-3 text-right">
              <span className="text-[10px] font-bold transition-colors" style={{ color: tpl.color }}>
                Use this template &rarr;
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function BoardDesignerLesson() {
  const [step, setStep] = useState(0);
  const actions = useBoardDesigner();

  const handleSelectTemplate = (b: BoardDefinition) => {
    actions.initFromTemplate(b);
    setStep(1);
  };

  // If we have saved state and user navigates to step 1 directly
  const canNav = (s: number) => {
    if (s === 0) return true;
    if (s === 1 && actions.hasSavedState) return true;
    return false;
  };

  return (
    <>
      <SectionHeader />
      <LessonNav step={step} labels={LABELS} onNav={(s) => {
        if (canNav(s)) setStep(s);
      }} canAdv={true} />
      {step === 0 && <ContextStep onSelect={handleSelectTemplate} />}
      {step === 1 && actions.hasSavedState && (
        <LiveBoardStep
          actions={actions}
          onBack={() => setStep(0)}
        />
      )}
    </>
  );
}

function SectionHeader() {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-5 rounded-full" style={{ background: "#f59e0b" }} />
        <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: "#f59e0b" }}>
          Section 4 &middot; Workflow Visualisation
        </span>
      </div>
    </div>
  );
}
