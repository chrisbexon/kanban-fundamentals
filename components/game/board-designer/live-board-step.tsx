"use client";

import React from "react";
import type { useBoardDesigner } from "@/hooks/use-board-designer";
import type { ColumnDefinition, SubColumnDefinition, SwimlaneDefinition, ItemTypeDefinition, AutoSimSettings } from "@/types/board";
import { BoardCanvas } from "./board-canvas";
import { RoundControls } from "./round-controls";
import { MetricsSummary } from "./metrics-summary";
import { getWorkflowColumns, getSwimlaneCols } from "@/types/board";
import { BoardCfdChart } from "@/components/charts/board/cfd-chart";
import { BoardCtScatterChart } from "@/components/charts/board/ct-scatter-chart";
import { BoardThroughputChart } from "@/components/charts/board/throughput-chart";
import { AgingByStateChart } from "@/components/charts/board/aging-by-state-chart";

type BoardActions = ReturnType<typeof useBoardDesigner>;

interface LiveBoardStepProps {
  actions: BoardActions;
  onBack: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function LiveBoardStep({ actions, onBack }: LiveBoardStepProps) {
  const {
    boardState, definition, items, currentDay, snapshots,
    settingsOpen, chartsOpen,
    toggleSettings, toggleCharts,
    moveItem, canMoveItem, addWorkItem,
    advanceRound, resetRun,
    runMode, setRunMode,
    isPlaying, play, pause, playSpeed, setPlaySpeed, targetDay, setTargetDay,
    validation, passCount,
  } = actions;

  if (!boardState || !definition) return null;

  const workflowColIds = new Set(getWorkflowColumns(definition).map((c) => c.id));
  const wipCount = items.filter((it) => workflowColIds.has(it.columnId)).length;
  const doneCount = items.filter((it) => it.doneDay !== null).length;

  return (
    <div className="fade-up flex flex-col gap-2">
      {/* Board header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack}
          className="text-[10px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border-faint)" }}>
          &larr; Templates
        </button>
        <h2 className="text-[18px] font-extrabold m-0 flex-1"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          {definition.name}
        </h2>
        {/* SLE badge */}
        <div className="rounded-lg px-2 py-1 text-[9px] font-bold"
          style={{ background: "rgba(6,182,212,0.08)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.15)" }}>
          SLE: {definition.settings.slePercentile}% within {definition.settings.sleDays}d
        </div>
      </div>

      {/* Round controls */}
      <RoundControls
        currentDay={currentDay}
        itemCount={items.length}
        doneCount={doneCount}
        wipCount={wipCount}
        validation={validation}
        passCount={passCount}
        totalChecks={validation.length}
        definition={definition}
        runMode={runMode}
        isPlaying={isPlaying}
        playSpeed={playSpeed}
        targetDay={targetDay}
        onAdvanceRound={advanceRound}
        onAddItem={addWorkItem}
        onReset={resetRun}
        onToggleSettings={toggleSettings}
        onToggleCharts={toggleCharts}
        onSetRunMode={setRunMode}
        onPlay={play}
        onPause={pause}
        onSetPlaySpeed={setPlaySpeed}
        onSetTargetDay={setTargetDay}
        settingsOpen={settingsOpen}
        chartsOpen={chartsOpen}
      />

      {/* Main area: settings drawer + board */}
      <div className="flex gap-2">
        {/* Settings drawer (collapsible) */}
        {settingsOpen && (
          <SettingsDrawer actions={actions} />
        )}

        {/* Board canvas */}
        <BoardCanvas
          definition={definition}
          items={items}
          currentDay={currentDay}
          runMode={runMode}
          onMoveItem={moveItem}
          canMoveItem={canMoveItem}
        />
      </div>

      {/* Charts panel (collapsible) */}
      {chartsOpen && (
        <ChartsPanel boardState={boardState} definition={definition} items={items} snapshots={snapshots} currentDay={currentDay} />
      )}
    </div>
  );
}

// ─── Charts Panel ────────────────────────────────────────────

function ChartsPanel({
  boardState, definition, items, snapshots, currentDay,
}: {
  boardState: NonNullable<BoardActions["boardState"]>;
  definition: NonNullable<BoardActions["definition"]>;
  items: BoardActions["items"];
  snapshots: BoardActions["snapshots"];
  currentDay: number;
}) {
  const [expandedChart, setExpandedChart] = React.useState<string | null>(null);
  const hasMultipleLanes = definition.swimlanes.length > 1;

  // Build chart sections: one per swimlane (when multiple) + overall
  const sections: { key: string; label: string; color: string; laneItems: typeof items; laneDef: typeof definition; swimlaneId?: string }[] = [];

  if (hasMultipleLanes) {
    for (const lane of definition.swimlanes) {
      sections.push({
        key: lane.id,
        label: lane.name,
        color: lane.color,
        laneItems: items.filter((it) => it.swimlaneId === lane.id),
        laneDef: { ...definition, columns: getSwimlaneCols(definition, lane.id) },
        swimlaneId: lane.id,
      });
    }
    // Overall section at the end
    sections.push({
      key: "all",
      label: "Overall",
      color: "#8b5cf6",
      laneItems: items,
      laneDef: definition,
      swimlaneId: undefined,
    });
  } else {
    sections.push({
      key: "all",
      label: "Flow Metrics",
      color: "#8b5cf6",
      laneItems: items,
      laneDef: definition,
      swimlaneId: undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <LaneChartSection
          key={section.key}
          sectionKey={section.key}
          label={section.label}
          color={section.color}
          laneItems={section.laneItems}
          laneDef={section.laneDef}
          swimlaneId={section.swimlaneId}
          snapshots={snapshots}
          boardState={boardState}
          definition={definition}
          currentDay={currentDay}
          expandedChart={expandedChart}
          setExpandedChart={setExpandedChart}
        />
      ))}
    </div>
  );
}

function LaneChartSection({
  sectionKey, label, color, laneItems, laneDef, swimlaneId,
  snapshots, boardState, definition, currentDay,
  expandedChart, setExpandedChart,
}: {
  sectionKey: string;
  label: string;
  color: string;
  laneItems: BoardActions["items"];
  laneDef: NonNullable<BoardActions["definition"]>;
  swimlaneId?: string;
  snapshots: BoardActions["snapshots"];
  boardState: NonNullable<BoardActions["boardState"]>;
  definition: NonNullable<BoardActions["definition"]>;
  currentDay: number;
  expandedChart: string | null;
  setExpandedChart: (id: string | null) => void;
}) {
  // Prefix chart IDs with section key so expand/collapse is per-section
  const prefix = `${sectionKey}:`;
  const sectionExpanded = expandedChart?.startsWith(prefix) ? expandedChart.slice(prefix.length) : null;

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </div>
      </div>

      <MetricsSummary boardState={boardState} filteredItems={laneItems} filteredDefinition={laneDef} />

      {snapshots.length < 3 ? (
        <div className="text-[10px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
          Advance a few more days to see charts with meaningful data.
        </div>
      ) : (
        <div className={sectionExpanded ? "" : "grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"}>
          {(() => {
            const h = sectionExpanded ? 480 : 240;
            return [
              { id: "cfd", label: "Cumulative Flow Diagram", render: () => <BoardCfdChart snapshots={snapshots} definition={laneDef} swimlaneId={swimlaneId} height={h} /> },
              { id: "scatter", label: "Cycle Time Scatter", render: () => <BoardCtScatterChart items={laneItems} sleDays={definition.settings.sleDays} height={h} /> },
              { id: "throughput", label: "Throughput", render: () => <BoardThroughputChart items={laneItems} currentDay={currentDay} height={h} /> },
              { id: "aging", label: "Aging WIP by Workflow State", render: () => <AgingByStateChart items={laneItems} definition={laneDef} currentDay={currentDay} height={h} /> },
            ];
          })()
            .filter((chart) => !sectionExpanded || sectionExpanded === chart.id)
            .map((chart) => (
              <div key={chart.id} className={`rounded-lg p-3 ${sectionExpanded ? "mt-4" : ""}`}
                style={{ background: "var(--bg-deeper)", border: "1px solid var(--border-faint)", minHeight: sectionExpanded ? 360 : undefined }}>
                <button
                  onClick={() => setExpandedChart(sectionExpanded === chart.id ? null : `${prefix}${chart.id}`)}
                  className="flex items-center gap-1.5 mb-2 border-none bg-transparent cursor-pointer p-0 w-full text-left"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {chart.label}
                  </span>
                  <span className="text-[8px] ml-auto" style={{ color: "var(--text-muted)" }}>
                    {sectionExpanded === chart.id ? "\u25BC Collapse" : "\u25B6 Expand"}
                  </span>
                </button>
                {chart.render()}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Drawer ────────────────────────────────────────

function SettingsDrawer({ actions }: { actions: BoardActions }) {
  const { definition, validation, passCount } = actions;
  const [tab, setTab] = React.useState<"workflow" | "items" | "settings" | "validation">("workflow");

  if (!definition) return null;

  const tabs = [
    { id: "workflow" as const, label: "Workflow", count: definition.swimlanes.length },
    { id: "items" as const, label: "Items", count: definition.itemTypes.length },
    { id: "settings" as const, label: "Settings" },
    { id: "validation" as const, label: `${passCount}/${validation.length}` },
  ];

  return (
    <div className="w-[320px] flex-shrink-0 rounded-xl overflow-hidden flex flex-col"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)", maxHeight: "calc(100vh - 160px)" }}>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border-faint)" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 text-[8px] font-bold uppercase tracking-wider py-2 border-none cursor-pointer transition-all"
            style={{
              background: tab === t.id ? "rgba(139,92,246,0.06)" : "transparent",
              color: tab === t.id ? "#8b5cf6" : "var(--text-muted)",
              borderBottom: tab === t.id ? "2px solid #8b5cf6" : "2px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === "workflow" && <WorkflowTab actions={actions} />}
        {tab === "items" && <ItemsTab actions={actions} />}
        {tab === "settings" && <SettingsTab actions={actions} />}
        {tab === "validation" && <ValidationTab validation={validation} />}
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────

const COL_COLORS = [
  "#64748b", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

const LANE_COLORS = [
  "#64748b", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#06b6d4",
];

const ITEM_TYPE_PRESETS: { name: string; color: string; icon: string }[] = [
  { name: "User Story", color: "#3b82f6", icon: "\u{1F4DD}" },
  { name: "Bug", color: "#ef4444", icon: "\u{1F41B}" },
  { name: "Task", color: "#f59e0b", icon: "\u{2699}\uFE0F" },
  { name: "Experiment", color: "#8b5cf6", icon: "\u{1F9EA}" },
  { name: "Spike", color: "#06b6d4", icon: "\u{1F50D}" },
  { name: "Defect", color: "#ec4899", icon: "\u{26A0}\uFE0F" },
  { name: "Requirement", color: "#22c55e", icon: "\u{1F4CB}" },
  { name: "Epic", color: "#f97316", icon: "\u{1F3AF}" },
];

const ITEM_COLORS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#64748b",
];

const ITEM_ICONS = [
  "\u{1F4DD}", "\u{1F41B}", "\u{2699}\uFE0F", "\u{1F9EA}", "\u{1F50D}",
  "\u{26A0}\uFE0F", "\u{1F4CB}", "\u{1F3AF}", "\u{1F4E6}", "\u{1F680}",
  "\u{1F4A1}", "\u{1F527}", "\u{1F3AB}", "\u{1F6A8}", "\u{2728}",
];

// ─── Shared input style ─────────────────────────────────────

const inputStyle = { background: "var(--bg-deeper)", color: "var(--text-primary)", outline: "1px solid var(--border-faint)" };

// ─── Workflow Tab (full swimlane + column editor) ───────────

function WorkflowTab({ actions }: { actions: BoardActions }) {
  const { definition, updateDefinition, updateSwimlane, setLaneColumns, addSwimlane, removeSwimlane, moveSwimlane } = actions;
  const [expandedLane, setExpandedLane] = React.useState<string | null>(definition?.swimlanes[0]?.id ?? null);
  const [editingCol, setEditingCol] = React.useState<string | null>(null);

  if (!definition) return null;

  const handleAddSwimlane = () => {
    const id = makeId("lane");
    const order = definition.swimlanes.length;
    const baseCols: ColumnDefinition[] = JSON.parse(
      JSON.stringify(definition.swimlanes[0]?.columns ?? definition.columns),
    );
    const lane: SwimlaneDefinition = {
      id, name: `Lane ${order + 1}`, color: LANE_COLORS[order % LANE_COLORS.length],
      wipLimit: null, order, policy: "", columns: baseCols,
      expediteEnabled: false, expediteWipLimit: null, expeditePolicy: "",
    };
    addSwimlane(lane);
    setExpandedLane(id);
  };

  return (
    <div>
      {/* Board name */}
      <div className="mb-3">
        <label className="text-[8px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Board Name</label>
        <input type="text" value={definition.name}
          onChange={(e) => updateDefinition({ name: e.target.value })}
          className="w-full rounded-md px-2 py-1.5 text-[11px] font-bold border-none"
          style={inputStyle} />
      </div>

      {/* Swimlane header + add buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Swimlanes ({definition.swimlanes.length})
        </div>
        <button onClick={() => handleAddSwimlane()}
          className="text-[8px] font-bold px-1.5 py-0.5 rounded border-none cursor-pointer"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          + Lane
        </button>
      </div>

      {/* Expedite warning */}
      {definition.swimlanes.some((l) => l.expediteEnabled) && (
        <div className="rounded-lg px-2 py-1.5 mb-2 text-[9px] leading-relaxed"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", color: "var(--text-secondary)" }}>
          <strong style={{ color: "#ef4444" }}>Use expedite sparingly.</strong>{" "}
          Expedited items consume WIP capacity and cause standard items to age and stall.
        </div>
      )}

      {/* Swimlane list */}
      <div className="flex flex-col gap-1.5">
        {definition.swimlanes.map((lane) => {
          const isExpanded = expandedLane === lane.id;
          const laneCols = lane.columns?.length > 0 ? lane.columns : definition.columns;
          const wfCount = laneCols.filter((c) => c.type !== "backlog" && c.type !== "done").length;

          return (
            <div key={lane.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${lane.color}20` }}>
              {/* Lane header */}
              <button
                onClick={() => setExpandedLane(isExpanded ? null : lane.id)}
                className="w-full text-left px-2 py-1.5 border-none cursor-pointer transition-all flex items-center gap-1.5"
                style={{ background: isExpanded ? `${lane.color}08` : "transparent" }}>
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: lane.color }} />
                <span className="text-[10px] font-bold flex-1" style={{ color: "var(--text-primary)" }}>{lane.name}</span>
                <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {wfCount}col {lane.wipLimit !== null ? `WIP${lane.wipLimit}` : ""}
                </span>
                {definition.swimlanes.length > 1 && (
                  <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] px-0.5 cursor-pointer hover:opacity-70" style={{ color: "var(--text-muted)" }}
                      onClick={() => moveSwimlane(lane.id, -1)} title="Move up">{"\u25B2"}</span>
                    <span className="text-[9px] px-0.5 cursor-pointer hover:opacity-70" style={{ color: "var(--text-muted)" }}
                      onClick={() => moveSwimlane(lane.id, 1)} title="Move down">{"\u25BC"}</span>
                  </div>
                )}
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{isExpanded ? "\u25B2" : "\u25BC"}</span>
              </button>

              {/* Expanded lane editor */}
              {isExpanded && (
                <div className="px-2 py-2 flex flex-col gap-2" style={{ background: `${lane.color}03`, borderTop: `1px solid ${lane.color}15` }}>
                  {/* Lane settings */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Name</label>
                      <input type="text" value={lane.name}
                        onChange={(e) => updateSwimlane(lane.id, { name: e.target.value })}
                        className="w-full rounded-md px-2 py-1 text-[11px] border-none"
                        style={inputStyle} />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Lane WIP</label>
                      <input type="number" min={1} max={50} value={lane.wipLimit ?? ""} placeholder="None"
                        onChange={(e) => updateSwimlane(lane.id, { wipLimit: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full rounded-md px-2 py-1 text-[11px] border-none"
                        style={inputStyle} />
                    </div>
                  </div>

                  {/* Lane colour */}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Colour</label>
                    <div className="flex gap-1 flex-wrap">
                      {LANE_COLORS.map((clr) => (
                        <button key={clr} onClick={() => updateSwimlane(lane.id, { color: clr })}
                          className="w-4 h-4 rounded border-none cursor-pointer"
                          style={{ background: clr, outline: lane.color === clr ? "2px solid var(--text-primary)" : "none", outlineOffset: "1px" }} />
                      ))}
                    </div>
                  </div>

                  {/* Lane policy */}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Policy</label>
                    <input type="text" value={lane.policy} placeholder="When should items use this lane?"
                      onChange={(e) => updateSwimlane(lane.id, { policy: e.target.value })}
                      className="w-full rounded-md px-2 py-1 text-[11px] border-none"
                      style={inputStyle} />
                  </div>

                  {/* Expedite sub-lane toggle */}
                  <div className="rounded-lg px-2 py-2" style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold" style={{ color: "#ef4444" }}>Expedite Sub-Lane</span>
                      <button onClick={() => updateSwimlane(lane.id, { expediteEnabled: !lane.expediteEnabled })}
                        className="px-2 py-0.5 rounded text-[9px] font-bold border-none cursor-pointer"
                        style={{
                          background: lane.expediteEnabled ? "rgba(239,68,68,0.12)" : "var(--bg-deeper)",
                          color: lane.expediteEnabled ? "#ef4444" : "var(--text-muted)",
                        }}>
                        {lane.expediteEnabled ? "\u2713 On" : "Off"}
                      </button>
                    </div>
                    {lane.expediteEnabled && (
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Expedite WIP</label>
                            <input type="number" min={1} max={20} value={lane.expediteWipLimit ?? ""} placeholder="None"
                              onChange={(e) => updateSwimlane(lane.id, { expediteWipLimit: e.target.value ? parseInt(e.target.value) : null })}
                              className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                          </div>
                          <div>
                            <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Policy</label>
                            <input type="text" value={lane.expeditePolicy ?? ""} placeholder="Expedite criteria"
                              onChange={(e) => updateSwimlane(lane.id, { expeditePolicy: e.target.value })}
                              className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                          </div>
                        </div>
                        <div className="text-[8px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                          Expedite items share this lane&apos;s workflow but have higher blocker risk and longer processing times.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column editor for this lane */}
                  <ColumnEditor
                    columns={laneCols}
                    editingCol={editingCol}
                    setEditingCol={setEditingCol}
                    onChange={(cols) => setLaneColumns(lane.id, cols)}
                  />

                  {/* Remove lane */}
                  {definition.swimlanes.length > 1 && (
                    <button onClick={() => { removeSwimlane(lane.id); setExpandedLane(null); }}
                      className="text-[9px] font-bold px-2 py-1 rounded border-none cursor-pointer self-start"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                      Remove Lane
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Column Editor ──────────────────────────────────────────

function ColumnEditor({
  columns, editingCol, setEditingCol, onChange,
}: {
  columns: ColumnDefinition[];
  editingCol: string | null;
  setEditingCol: (id: string | null) => void;
  onChange: (cols: ColumnDefinition[]) => void;
}) {
  const updateCol = (colId: string, updates: Partial<ColumnDefinition>) => {
    onChange(columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)));
  };

  const addCol = () => {
    const id = makeId("col");
    const newCol: ColumnDefinition = {
      id, name: "New Column", type: "active",
      color: COL_COLORS[(columns.length - 1) % COL_COLORS.length],
      policy: "", wipLimit: 3, subColumns: [], width: 1,
    };
    const cols = [...columns];
    cols.splice(cols.length - 1, 0, newCol); // insert before Done
    onChange(cols);
    setEditingCol(id);
  };

  const removeCol = (colId: string) => {
    const c = columns.find((col) => col.id === colId);
    if (!c || c.type === "backlog" || c.type === "done") return;
    onChange(columns.filter((col) => col.id !== colId));
    if (editingCol === colId) setEditingCol(null);
  };

  const moveCol = (colId: string, dir: -1 | 1) => {
    const idx = columns.findIndex((c) => c.id === colId);
    const newIdx = idx + dir;
    if (newIdx < 1 || newIdx >= columns.length - 1) return;
    const cols = [...columns];
    [cols[idx], cols[newIdx]] = [cols[newIdx], cols[idx]];
    onChange(cols);
  };

  const toggleSub = (colId: string) => {
    const c = columns.find((col) => col.id === colId);
    if (!c) return;
    if (c.subColumns.length > 0) {
      updateCol(colId, { subColumns: [] });
    } else {
      updateCol(colId, {
        subColumns: [
          { id: `${colId}-doing`, name: "Doing", type: "active", policy: "" },
          { id: `${colId}-done`, name: "Done", type: "queue", policy: "" },
        ],
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Columns ({columns.length})
        </div>
        <button onClick={addCol}
          className="text-[8px] font-bold px-1.5 py-0.5 rounded border-none cursor-pointer"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          + Column
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {columns.map((c) => {
          const isEditing = editingCol === c.id;
          const isFixed = c.type === "backlog" || c.type === "done";

          return (
            <div key={c.id}>
              {/* Column row */}
              <button
                onClick={() => setEditingCol(isEditing ? null : c.id)}
                className="w-full text-left rounded px-2 py-1 border-none cursor-pointer transition-all flex items-center gap-1.5"
                style={{
                  background: isEditing ? `${c.color}08` : "transparent",
                  border: isEditing ? `1px solid ${c.color}25` : "1px solid transparent",
                }}>
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                <span className="text-[10px] font-bold flex-1 truncate" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {c.type === "backlog" ? "BKL" : c.type === "done" ? "DONE" : c.wipLimit !== null ? `WIP${c.wipLimit}` : ""}
                </span>
                {!isFixed && (
                  <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] px-0.5 cursor-pointer hover:opacity-70" style={{ color: "var(--text-muted)" }}
                      onClick={() => moveCol(c.id, -1)} title="Move left">{"\u25C0"}</span>
                    <span className="text-[9px] px-0.5 cursor-pointer hover:opacity-70" style={{ color: "var(--text-muted)" }}
                      onClick={() => moveCol(c.id, 1)} title="Move right">{"\u25B6"}</span>
                  </div>
                )}
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>{isEditing ? "\u25B2" : "\u25BC"}</span>
              </button>

              {/* Expanded column editor */}
              {isEditing && (
                <div className="rounded-b px-2 py-2 flex flex-col gap-2 fade-up"
                  style={{ background: `${c.color}04`, border: `1px solid ${c.color}15`, borderTop: "none" }}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Name</label>
                      <input type="text" value={c.name} onChange={(e) => updateCol(c.id, { name: e.target.value })}
                        className="w-full rounded-md px-2 py-1 text-[11px] border-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Colour</label>
                      <div className="flex gap-0.5 flex-wrap">
                        {COL_COLORS.map((clr) => (
                          <button key={clr} onClick={() => updateCol(c.id, { color: clr })}
                            className="w-4 h-4 rounded border-none cursor-pointer"
                            style={{ background: clr, outline: c.color === clr ? "2px solid var(--text-primary)" : "none", outlineOffset: "1px" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {!isFixed && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Type</label>
                        <select value={c.type} onChange={(e) => updateCol(c.id, { type: e.target.value as ColumnDefinition["type"] })}
                          className="w-full rounded-md px-2 py-1 text-[11px] border-none cursor-pointer" style={inputStyle}>
                          <option value="active">Active</option>
                          <option value="queue">Queue</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>WIP Limit</label>
                        <input type="number" min={1} max={20} value={c.wipLimit ?? ""} placeholder="None"
                          onChange={(e) => updateCol(c.id, { wipLimit: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full rounded-md px-2 py-1 text-[11px] border-none" style={inputStyle} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Policy</label>
                    <input type="text" value={c.policy} placeholder="Entry/exit criteria"
                      onChange={(e) => updateCol(c.id, { policy: e.target.value })}
                      className="w-full rounded-md px-2 py-1 text-[11px] border-none" style={inputStyle} />
                  </div>
                  {!isFixed && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold" style={{ color: "var(--text-primary)" }}>Doing/Done split</span>
                      <button onClick={() => toggleSub(c.id)}
                        className="px-2 py-0.5 rounded text-[9px] font-bold border-none cursor-pointer"
                        style={{ background: c.subColumns.length > 0 ? "rgba(34,197,94,0.1)" : "var(--bg-deeper)", color: c.subColumns.length > 0 ? "#22c55e" : "var(--text-muted)" }}>
                        {c.subColumns.length > 0 ? "\u2713 On" : "Off"}
                      </button>
                    </div>
                  )}
                  {c.subColumns.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {c.subColumns.map((sc) => (
                        <div key={sc.id}>
                          <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>{sc.name} Policy</label>
                          <input type="text" value={sc.policy} placeholder={`${sc.name} criteria`}
                            onChange={(e) => { updateCol(c.id, { subColumns: c.subColumns.map((s) => s.id === sc.id ? { ...s, policy: e.target.value } : s) }); }}
                            className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                        </div>
                      ))}
                    </div>
                  )}
                  {!isFixed && (
                    <button onClick={() => removeCol(c.id)}
                      className="text-[9px] font-bold px-2 py-0.5 rounded border-none cursor-pointer self-start"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Items Tab (full item type editor) ──────────────────────

function ItemsTab({ actions }: { actions: BoardActions }) {
  const { definition, addItemType, updateItemType, removeItemType } = actions;
  const [editingType, setEditingType] = React.useState<string | null>(null);

  if (!definition) return null;

  const handleAddType = (preset?: { name: string; color: string; icon: string }) => {
    const id = makeId("type");
    const base = preset ?? { name: "New Type", color: ITEM_COLORS[definition.itemTypes.length % ITEM_COLORS.length], icon: "\u{1F4E6}" };
    const newType: ItemTypeDefinition = { id, name: base.name, color: base.color, icon: base.icon, defaultSwimlane: null };
    addItemType(newType);
    setEditingType(id);
  };

  const availablePresets = ITEM_TYPE_PRESETS.filter(
    (p) => !definition.itemTypes.some((t) => t.name.toLowerCase() === p.name.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Work Item Types ({definition.itemTypes.length})
        </div>
        <button onClick={() => handleAddType()}
          className="text-[8px] font-bold px-1.5 py-0.5 rounded border-none cursor-pointer"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          + Custom
        </button>
      </div>

      {/* Quick-add presets */}
      {availablePresets.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {availablePresets.map((p) => (
            <button key={p.name} onClick={() => handleAddType(p)}
              className="text-[8px] font-bold px-1.5 py-0.5 rounded border-none cursor-pointer flex items-center gap-1"
              style={{ background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}20` }}>
              <span className="text-[9px]">{p.icon}</span> {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Item type list */}
      <div className="flex flex-col gap-1">
        {definition.itemTypes.map((item) => {
          const isEditing = editingType === item.id;

          return (
            <div key={item.id}>
              <button
                onClick={() => setEditingType(isEditing ? null : item.id)}
                className="w-full text-left rounded px-2 py-1.5 border-none cursor-pointer transition-all flex items-center gap-2"
                style={{
                  background: isEditing ? `${item.color}08` : "transparent",
                  border: isEditing ? `1px solid ${item.color}25` : "1px solid transparent",
                }}>
                {/* Card preview mini */}
                <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: 20, height: 26, background: "var(--bg-deeper)", border: "1px solid var(--border-faint)" }}>
                  <div style={{ height: 3, background: item.color }} />
                  <div className="flex items-center justify-center" style={{ height: 23 }}>
                    <span className="text-[9px]">{item.icon}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold flex-1" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                {item.defaultSwimlane && (
                  <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>
                    &rarr; {definition.swimlanes.find((l) => l.id === item.defaultSwimlane)?.name ?? "?"}
                  </span>
                )}
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>{isEditing ? "\u25B2" : "\u25BC"}</span>
              </button>

              {/* Expanded editor */}
              {isEditing && (
                <div className="rounded-b px-2 py-2 flex flex-col gap-2 fade-up"
                  style={{ background: `${item.color}04`, border: `1px solid ${item.color}15`, borderTop: "none" }}>
                  {/* Name */}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Name</label>
                    <input type="text" value={item.name}
                      onChange={(e) => updateItemType(item.id, { name: e.target.value })}
                      className="w-full rounded-md px-2 py-1 text-[11px] border-none" style={inputStyle} />
                  </div>
                  {/* Colour */}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Colour</label>
                    <div className="flex gap-0.5 flex-wrap">
                      {ITEM_COLORS.map((clr) => (
                        <button key={clr} onClick={() => updateItemType(item.id, { color: clr })}
                          className="w-4 h-4 rounded border-none cursor-pointer"
                          style={{ background: clr, outline: item.color === clr ? "2px solid var(--text-primary)" : "none", outlineOffset: "1px" }} />
                      ))}
                    </div>
                  </div>
                  {/* Icon */}
                  <div>
                    <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Icon</label>
                    <div className="flex gap-0.5 flex-wrap">
                      {ITEM_ICONS.map((ic) => (
                        <button key={ic} onClick={() => updateItemType(item.id, { icon: ic })}
                          className="w-5 h-5 rounded border-none cursor-pointer text-[10px] flex items-center justify-center"
                          style={{
                            background: item.icon === ic ? `${item.color}15` : "var(--bg-deeper)",
                            outline: item.icon === ic ? `2px solid ${item.color}` : "1px solid var(--border-faint)",
                            outlineOffset: item.icon === ic ? "1px" : "0",
                          }}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Default swimlane */}
                  {definition.swimlanes.length > 1 && (
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Default Swimlane</label>
                      <select value={item.defaultSwimlane ?? ""}
                        onChange={(e) => updateItemType(item.id, { defaultSwimlane: e.target.value || null })}
                        className="w-full rounded-md px-2 py-1 text-[11px] border-none cursor-pointer" style={inputStyle}>
                        <option value="">None (manual)</option>
                        {definition.swimlanes.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Remove */}
                  <button onClick={() => { removeItemType(item.id); setEditingType(null); }}
                    className="text-[9px] font-bold px-2 py-0.5 rounded border-none cursor-pointer self-start"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {definition.itemTypes.length === 0 && (
          <div className="text-[10px] text-center py-3 rounded" style={{ color: "var(--text-muted)", background: "var(--bg-deeper)", border: "1px dashed var(--border-faint)" }}>
            No item types. Add at least one.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────

function SettingsTab({ actions }: { actions: BoardActions }) {
  const { definition, updateSettings, updateAutoSim, runMode } = actions;
  if (!definition) return null;

  const s = definition.settings;
  const sim = s.autoSim;
  const isAuto = runMode === "auto";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>SLE Target Days</label>
        <input type="number" min={1} max={90} value={s.sleDays}
          onChange={(e) => updateSettings({ sleDays: parseInt(e.target.value) || 15 })}
          className="w-full rounded-md px-2 py-1.5 text-[11px] border-none" style={inputStyle} />
      </div>
      <div>
        <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>SLE Percentile</label>
        <select value={s.slePercentile}
          onChange={(e) => updateSettings({ slePercentile: parseInt(e.target.value) })}
          className="w-full rounded-md px-2 py-1.5 text-[11px] border-none cursor-pointer" style={inputStyle}>
          <option value={50}>50th (coin flip)</option>
          <option value={70}>70th (likely)</option>
          <option value={85}>85th (recommended)</option>
          <option value={95}>95th (high confidence)</option>
        </select>
      </div>
      <div className="rounded-lg px-2 py-1.5 text-[9px]" style={{ background: "rgba(6,182,212,0.05)", color: "var(--text-secondary)" }}>
        &ldquo;We expect {s.slePercentile}% of items to complete within {s.sleDays} days.&rdquo;
      </div>

      <hr className="border-none h-px" style={{ background: "var(--border-faint)" }} />
      <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        Arrival Rate
      </div>
      <div>
        <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Items/day (Poisson)</label>
        <input type="number" min={0} max={10} step={0.1} value={s.arrivalRate}
          onChange={(e) => updateSettings({ arrivalRate: parseFloat(e.target.value) || 0.8 })}
          className="w-full rounded-md px-2 py-1.5 text-[11px] border-none" style={inputStyle} />
      </div>

      {/* Auto-sim settings (only shown in auto mode) */}
      {isAuto && sim && (
        <>
          <hr className="border-none h-px" style={{ background: "var(--border-faint)" }} />
          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#8b5cf6" }}>
            Simulation Dynamics
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Mean days/column</label>
              <input type="number" min={1} max={20} step={0.5} value={sim.meanProcessingDays}
                onChange={(e) => updateAutoSim({ meanProcessingDays: parseFloat(e.target.value) || 3 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Std deviation</label>
              <input type="number" min={0.5} max={10} step={0.5} value={sim.stdDevProcessingDays}
                onChange={(e) => updateAutoSim({ stdDevProcessingDays: parseFloat(e.target.value) || 1.5 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Block chance (%)</label>
              <input type="number" min={0} max={50} step={1} value={Math.round(sim.blockChance * 100)}
                onChange={(e) => updateAutoSim({ blockChance: (parseInt(e.target.value) || 0) / 100 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Blocker days</label>
              <input type="number" min={1} max={10} value={sim.blockerEffort}
                onChange={(e) => updateAutoSim({ blockerEffort: parseInt(e.target.value) || 2 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Regulatory (%)</label>
              <input type="number" min={0} max={20} step={1} value={Math.round(sim.regulatoryChance * 100)}
                onChange={(e) => updateAutoSim({ regulatoryChance: (parseInt(e.target.value) || 0) / 100 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Due in (days)</label>
              <input type="number" min={3} max={60} value={sim.regulatoryDueDayOffset}
                onChange={(e) => updateAutoSim({ regulatoryDueDayOffset: parseInt(e.target.value) || 10 })}
                className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
            </div>
          </div>
          {/* Expedite settings (only when expedite lane exists) */}
          {definition.swimlanes.some((l) => l.expediteEnabled) && (
            <>
              <hr className="border-none h-px" style={{ background: "var(--border-faint)" }} />
              <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                Expedite Dynamics
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Arrival (%)</label>
                  <input type="number" min={0} max={30} step={1} value={Math.round((sim.expediteChance ?? 0.05) * 100)}
                    onChange={(e) => updateAutoSim({ expediteChance: (parseInt(e.target.value) || 0) / 100 })}
                    className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Work &times;</label>
                  <input type="number" min={1} max={5} step={0.1} value={sim.expediteWorkMultiplier ?? 1.5}
                    onChange={(e) => updateAutoSim({ expediteWorkMultiplier: parseFloat(e.target.value) || 1.5 })}
                    className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-[7px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "var(--text-muted)" }}>Block &times;</label>
                  <input type="number" min={1} max={5} step={0.5} value={sim.expediteBlockerMultiplier ?? 2.0}
                    onChange={(e) => updateAutoSim({ expediteBlockerMultiplier: parseFloat(e.target.value) || 2.0 })}
                    className="w-full rounded-md px-2 py-1 text-[10px] border-none" style={inputStyle} />
                </div>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-[8px] leading-relaxed" style={{ background: "rgba(239,68,68,0.04)", color: "var(--text-secondary)" }}>
                Expedite items arrive ~{Math.round((sim.expediteChance ?? 0.05) * 100)}% of days, take {sim.expediteWorkMultiplier ?? 1.5}&times; longer to process,
                and have {sim.expediteBlockerMultiplier ?? 2.0}&times; blocker risk. They consume lane WIP and cause standard items to age.
              </div>
            </>
          )}
          <div className="rounded-lg px-2 py-1.5 text-[8px] leading-relaxed" style={{ background: "rgba(139,92,246,0.04)", color: "var(--text-secondary)" }}>
            Items take ~{sim.meanProcessingDays}&plusmn;{sim.stdDevProcessingDays} days per active column.
            {sim.blockChance > 0 && ` ${Math.round(sim.blockChance * 100)}% blocker chance (${sim.blockerEffort}d to clear).`}
            {sim.regulatoryChance > 0 && ` Regulatory items appear ~${Math.round(sim.regulatoryChance * 100)}% of days with ${sim.regulatoryDueDayOffset}d deadline.`}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Validation Tab ─────────────────────────────────────────

function ValidationTab({ validation }: { validation: BoardActions["validation"] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {validation.map((v) => (
        <div key={v.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5"
          style={{ background: v.pass ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)" }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] flex-shrink-0"
            style={{ background: v.pass ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }}>
            {v.pass ? "\u2713" : v.icon}
          </div>
          <div>
            <div className="text-[10px] font-bold" style={{ color: v.pass ? "#22c55e" : "#ef4444" }}>{v.label}</div>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{v.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
