/**
 * === Kanban Board Designer & Runtime Types ===
 *
 * Architecture overview:
 *
 *  BoardDefinition  ─── describes the structure (columns, swimlanes, item types, policies)
 *  BoardWorkItem    ─── describes an item on the board (position, history, metadata)
 *  BoardState       ─── complete runtime state (definition + items + settings)
 *
 * Design principles:
 *  1. Fully dynamic — no hardcoded colors or column names
 *  2. Compatible with existing charts via adapter functions (see lib/stats/board-stats.ts)
 *  3. Supports design mode (configure structure) and run mode (move items, collect metrics)
 *  4. State transitions are recorded as a full history, enabling cycle time, flow efficiency,
 *     CFD, and aging calculations from a single source of truth
 *  5. Persistable to localStorage now, backend later — entire BoardState is serialisable JSON
 *
 * Relationship to existing Kanban Game types (types/wip-game.ts):
 *  - The Kanban Game keeps its rigid WipWorkItem / WorkColor model — no rewrite needed
 *  - Adapter functions in lib/stats/board-stats.ts produce the same chart data shapes
 *    (CycleTimePoint, ThroughputDay, etc.) so chart components work with both
 *  - Only CfdDataPoint needs a generic replacement (GenericCfdPoint) for dynamic columns
 */

// ─── Board Structure ─────────────────────────────────────────

export interface BoardDefinition {
  id: string;
  name: string;
  description: string;

  /** Ordered left → right. First is always commitment point, last is always delivery point. */
  columns: ColumnDefinition[];

  /** Column groups that share a WIP limit (e.g., "Design" with "Doing" + "Done" sub-columns) */
  columnGroups: ColumnGroupDefinition[];

  /** Horizontal swimlanes (e.g., Expedite, Standard). Default board has one implicit lane. */
  swimlanes: SwimlaneDefinition[];

  /** User-defined work item types (e.g., "User Story", "Bug", "Requirement") */
  itemTypes: ItemTypeDefinition[];

  /** Board-level settings */
  settings: BoardSettings;
}

export type ColumnType =
  | "backlog"   // upstream: items waiting to be committed
  | "queue"     // buffer/waiting state between active states (e.g., "Ready for Dev")
  | "active"    // work is being performed
  | "done";     // downstream: delivered

export interface ColumnDefinition {
  id: string;
  name: string;
  type: ColumnType;
  color: string;

  /** Explicit policy: what must be true for items to enter/exit this state */
  policy: string;

  /** Per-column WIP limit. null = no limit. Overridden by group limit if in a group. */
  wipLimit: number | null;

  /** If this column has sub-columns (e.g., "Doing" / "Done" split) */
  subColumns: SubColumnDefinition[];

  /** Width weight for rendering (default 1). A column with weight 2 renders twice as wide. */
  width: number;
}

export interface SubColumnDefinition {
  id: string;
  name: string;
  type: "active" | "queue";
  policy: string;
}

export interface ColumnGroupDefinition {
  id: string;
  name: string;

  /** Column IDs that belong to this group */
  columnIds: string[];

  /** Shared WIP limit across all columns in the group. null = no limit. */
  wipLimit: number | null;
}

export interface SwimlaneDefinition {
  id: string;
  name: string;
  color: string;

  /** WIP limit for this lane (across all columns). null = no limit. */
  wipLimit: number | null;

  /** Rendering order (0 = top) */
  order: number;

  /** Explicit policy for this lane */
  policy: string;

  /**
   * Each swimlane owns its own columns — different teams or classes of service
   * may have entirely different workflows. Columns are ordered left → right.
   */
  columns: ColumnDefinition[];
}

export interface ItemTypeDefinition {
  id: string;
  name: string;          // "User Story", "Bug", "Requirement", "Spike", etc.
  color: string;         // hex color for card border/badge
  icon: string;          // emoji or icon key
  defaultSwimlane: string | null;  // auto-assign to this lane (e.g., bugs → expedite)
}

// ─── Run Mode & Simulation ──────────────────────────────────

/** Run mode: manual = player drags items; auto = engine simulates */
export type RunMode = "manual" | "auto";

/** Class of service for work items */
export type ClassOfService = "standard" | "expedite" | "regulatory";

/** Simulation settings for automated mode */
export interface AutoSimSettings {
  /** Mean processing days per active column (normal distribution center) */
  meanProcessingDays: number;
  /** Standard deviation for processing days */
  stdDevProcessingDays: number;
  /** Probability per round of a blocker appearing on any active item (0-1) */
  blockChance: number;
  /** Work units (days) required to clear a blocker */
  blockerEffort: number;
  /** Probability per round of a regulatory/fixed-date item appearing (0-1) */
  regulatoryChance: number;
  /** Due day offset for regulatory items (days from creation) */
  regulatoryDueDayOffset: number;
}

export interface BoardSettings {
  /** Service Level Expectation: target cycle time in days */
  sleDays: number;

  /** SLE percentile (typically 85) */
  slePercentile: number;

  /** System-wide WIP limit (all columns combined). null = no limit. */
  systemWipLimit: number | null;

  /** Days before an item's age is flagged as a warning */
  ageWarningDays: number;

  /** Days before an item's age is flagged as critical */
  ageCriticalDays: number;

  // ─── Simulation settings ──────────────────────────────────

  /** Average items arriving to backlog per day (default 2) */
  arrivalRate: number;

  /** Probability per day of an item completing its current active stage (default 0.4) */
  processingChance: number;

  /** Simulation settings for auto mode */
  autoSim: AutoSimSettings;
}

// ─── Work Items ──────────────────────────────────────────────

export interface BoardWorkItem {
  id: string;           // alphanumeric ID (e.g., "US-123", "BUG-45")
  title: string;
  typeId: string;       // references ItemTypeDefinition.id
  columnId: string;     // current column
  subColumnId: string | null;  // current sub-column (if column has sub-columns)
  swimlaneId: string;   // which swimlane

  /** Full state history — source of truth for all metrics */
  stateHistory: StateTransition[];

  /** Rich metadata */
  assignee: string | null;       // display name or avatar key
  assigneeAvatar: string | null; // URL or initials
  blocked: boolean;
  blockerDescription: string;
  dependencies: string[];        // IDs of items this depends on
  subtasks: Subtask[];
  tags: string[];                // free-form labels

  /** Timestamps */
  createdDay: number;
  commitDay: number | null;      // day item entered first workflow state (commitment point)
  doneDay: number | null;        // day item reached done column (delivery point)
  dueDay: number | null;         // external deadline

  /** Priority within its column (lower = higher priority, for ordering) */
  order: number;

  /** Class of service */
  classOfService: ClassOfService;

  /** Work remaining in current active column (auto mode, days) */
  workRemaining: number;

  /** Total work assigned for current column (auto mode, for progress display) */
  workTotal: number;

  /** Blocker effort remaining in days (0 = not blocked via effort model) */
  blockerEffort: number;
}

export interface StateTransition {
  columnId: string;
  subColumnId: string | null;
  enteredDay: number;
  exitedDay: number | null;      // null = item is still in this state
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// ─── Complete Board State ────────────────────────────────────

export type BoardMode = "design" | "run";

export interface BoardState {
  definition: BoardDefinition;
  items: BoardWorkItem[];
  mode: BoardMode;
  runMode: RunMode;
  currentDay: number;
  nextItemNumber: number;       // auto-increment for generating IDs

  /** Snapshots for charting (taken each day in run mode) */
  snapshots: BoardSnapshot[];
}

/** Daily snapshot — generic version of DaySnapshot from wip-game */
export interface BoardSnapshot {
  day: number;

  /** Item count per column (keyed by column ID) */
  itemsByColumn: Record<string, number>;

  /** Item count per column+subColumn (keyed by "columnId:subColumnId") */
  itemsBySubColumn: Record<string, number>;

  /** WIP per column group (keyed by group ID) */
  wipByGroup: Record<string, number>;

  /** Total system WIP (excludes backlog and done) */
  systemWip: number;

  /** Items delivered (cumulative) */
  itemsDone: number;

  /** Total items in system */
  totalItems: number;

  /** Average age of in-progress items */
  avgAge: number;
}

// ─── Generic Chart Data ──────────────────────────────────────

/**
 * Generic CFD data point — replaces the hardcoded CfdDataPoint for dynamic boards.
 * Each column is a key with its item count (stacked).
 */
export interface GenericCfdPoint {
  day: number;
  [columnId: string]: number;   // dynamic keys for each column
}

// ─── Defaults & Factories ────────────────────────────────────

export const DEFAULT_AUTO_SIM: AutoSimSettings = {
  meanProcessingDays: 3,
  stdDevProcessingDays: 1.5,
  blockChance: 0.15,
  blockerEffort: 2,
  regulatoryChance: 0.03,
  regulatoryDueDayOffset: 10,
};

export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  sleDays: 15,
  slePercentile: 85,
  systemWipLimit: null,
  ageWarningDays: 10,
  ageCriticalDays: 15,
  arrivalRate: 0.8,
  processingChance: 0.4,
  autoSim: { ...DEFAULT_AUTO_SIM },
};

export const DEFAULT_SWIMLANE: SwimlaneDefinition = {
  id: "default",
  name: "Standard",
  color: "#64748b",
  wipLimit: null,
  order: 0,
  policy: "",
  columns: [],
};

export function createDefaultBoard(): BoardDefinition {
  const defaultColumns: ColumnDefinition[] = [
    {
      id: "backlog",
      name: "Backlog",
      type: "backlog",
      color: "#64748b",
      policy: "Items waiting to be committed to the workflow.",
      wipLimit: null,
      subColumns: [],
      width: 1,
    },
    {
      id: "analysis",
      name: "Analysis",
      type: "active",
      color: "#3b82f6",
      policy: "",
      wipLimit: 3,
      subColumns: [
        { id: "analysis-doing", name: "Doing", type: "active", policy: "" },
        { id: "analysis-done", name: "Done", type: "queue", policy: "Analysis is complete and documented." },
      ],
      width: 1,
    },
    {
      id: "development",
      name: "Development",
      type: "active",
      color: "#8b5cf6",
      policy: "",
      wipLimit: 4,
      subColumns: [
        { id: "dev-doing", name: "Doing", type: "active", policy: "" },
        { id: "dev-done", name: "Done", type: "queue", policy: "Code complete, tests passing." },
      ],
      width: 1,
    },
    {
      id: "review",
      name: "Review",
      type: "active",
      color: "#f59e0b",
      policy: "Item has been peer-reviewed and accepted.",
      wipLimit: 2,
      subColumns: [],
      width: 1,
    },
    {
      id: "done",
      name: "Done",
      type: "done",
      color: "#22c55e",
      policy: "Delivered to customer.",
      wipLimit: null,
      subColumns: [],
      width: 1,
    },
  ];

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `board-${Date.now()}`,
    name: "My Kanban Board",
    description: "",
    columns: defaultColumns,
    columnGroups: [
      { id: "analysis-group", name: "Analysis", columnIds: ["analysis"], wipLimit: 3 },
      { id: "dev-group", name: "Development", columnIds: ["development"], wipLimit: 4 },
    ],
    swimlanes: [
      { ...DEFAULT_SWIMLANE, columns: defaultColumns },
    ],
    itemTypes: [
      { id: "story", name: "User Story", color: "#3b82f6", icon: "\u{1F4DD}", defaultSwimlane: null },
      { id: "bug", name: "Bug", color: "#ef4444", icon: "\u{1F41B}", defaultSwimlane: null },
      { id: "task", name: "Task", color: "#f59e0b", icon: "\u{2699}\uFE0F", defaultSwimlane: null },
    ],
    settings: { ...DEFAULT_BOARD_SETTINGS },
  };
}

export function createEmptyBoardState(definition?: BoardDefinition): BoardState {
  const def = definition ?? createDefaultBoard();
  return {
    definition: def,
    items: [],
    mode: "design",
    runMode: "manual",
    currentDay: 0,
    nextItemNumber: 1,
    snapshots: [],
  };
}

// ─── Computed Helpers (pure functions) ───────────────────────

/**
 * Get columns for a specific swimlane. Falls back to board.columns
 * for backward compatibility if the swimlane has no columns.
 */
export function getSwimlaneCols(def: BoardDefinition, laneId: string): ColumnDefinition[] {
  const lane = def.swimlanes.find((l) => l.id === laneId);
  if (lane && lane.columns.length > 0) return lane.columns;
  return def.columns;
}

/**
 * Sync board.columns from the primary (first) swimlane.
 * Call this after modifying swimlane columns to keep backward compat.
 */
export function syncBoardColumns(def: BoardDefinition): BoardDefinition {
  const primary = def.swimlanes[0];
  return {
    ...def,
    columns: primary?.columns.length > 0 ? primary.columns : def.columns,
  };
}

/** Get the commitment point column (first non-backlog column) */
export function getCommitmentPoint(def: BoardDefinition): ColumnDefinition | undefined {
  return def.columns.find((c) => c.type !== "backlog");
}

/** Get the delivery point column (last column before done, or done itself) */
export function getDeliveryPoint(def: BoardDefinition): ColumnDefinition | undefined {
  const doneCol = def.columns.find((c) => c.type === "done");
  return doneCol;
}

/** Get all "workflow" columns (between commitment and delivery — excludes backlog and done) */
export function getWorkflowColumns(def: BoardDefinition): ColumnDefinition[] {
  return def.columns.filter((c) => c.type !== "backlog" && c.type !== "done");
}

/** Count items in a column (including sub-columns) */
export function columnItemCount(items: BoardWorkItem[], columnId: string): number {
  return items.filter((it) => it.columnId === columnId && it.doneDay === null && it.commitDay !== null).length;
}

/** Count system WIP (all items between commitment and delivery points) */
export function systemWip(items: BoardWorkItem[], def: BoardDefinition): number {
  const workflowColIds = new Set(getWorkflowColumns(def).map((c) => c.id));
  return items.filter((it) => workflowColIds.has(it.columnId)).length;
}

/** Compute age of an item (days since commitment) */
export function itemAge(item: BoardWorkItem, currentDay: number): number {
  if (item.commitDay === null) return 0;
  if (item.doneDay !== null) return item.doneDay - item.commitDay;
  return currentDay - item.commitDay;
}

/** Compute cycle time of a completed item */
export function itemCycleTime(item: BoardWorkItem): number | null {
  if (item.commitDay === null || item.doneDay === null) return null;
  return item.doneDay - item.commitDay;
}
