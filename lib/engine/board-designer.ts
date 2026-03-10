/**
 * Board Designer — Pure Simulation Engine
 *
 * All functions are pure: state in, new state out. No side effects.
 *
 * Round mechanics:
 *  1. Arrivals: random items appear in backlog
 *  2. Processing: items in active columns have a chance of completing
 *  3. Pull: completed items move to next column (respecting WIP limits)
 *  4. Snapshot: board snapshot taken for charting
 */

import type {
  BoardState,
  BoardDefinition,
  BoardWorkItem,
  ColumnDefinition,
  SwimlaneDefinition,
  StateTransition,
} from "@/types/board";
import { getWorkflowColumns } from "@/types/board";
import { takeBoardSnapshot } from "@/lib/stats/board-stats";

// ─── Random Helpers ─────────────────────────────────────────

let _seed = Date.now();
function seededRandom(): number {
  _seed = (_seed * 16807) % 2147483647;
  return (_seed - 1) / 2147483646;
}

function poisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= seededRandom();
  } while (p > L);
  return k - 1;
}

// ─── Item Creation ──────────────────────────────────────────

/** Create a new work item and add it to backlog */
export function createWorkItem(
  state: BoardState,
  typeId: string,
  swimlaneId: string,
  title?: string,
): BoardState {
  const { definition: def, items, nextItemNumber, currentDay } = state;
  const itemType = def.itemTypes.find((t) => t.id === typeId);
  const lane = def.swimlanes.find((l) => l.id === swimlaneId);
  const laneCols = lane?.columns?.length ? lane.columns : def.columns;
  const backlogCol = laneCols.find((c) => c.type === "backlog");
  if (!backlogCol || !itemType) return state;

  const id = `${itemType.name.substring(0, 3).toUpperCase()}-${nextItemNumber}`;

  const newItem: BoardWorkItem = {
    id,
    title: title ?? `${itemType.name} #${nextItemNumber}`,
    typeId,
    columnId: backlogCol.id,
    subColumnId: null,
    swimlaneId,
    stateHistory: [{
      columnId: backlogCol.id,
      subColumnId: null,
      enteredDay: currentDay,
      exitedDay: null,
    }],
    assignee: null,
    assigneeAvatar: null,
    blocked: false,
    blockerDescription: "",
    dependencies: [],
    subtasks: [],
    tags: [],
    createdDay: currentDay,
    commitDay: null,
    doneDay: null,
    dueDay: null,
    order: items.filter((it) => it.columnId === backlogCol.id && it.swimlaneId === swimlaneId).length,
  };

  return {
    ...state,
    items: [...items, newItem],
    nextItemNumber: nextItemNumber + 1,
  };
}

// ─── Item Movement ──────────────────────────────────────────

/** Check if an item can move to a target column */
export function canMoveItem(
  state: BoardState,
  itemId: string,
  targetColumnId: string,
  targetSubColumnId?: string | null,
): { allowed: boolean; reason: string } {
  const item = state.items.find((it) => it.id === itemId);
  if (!item) return { allowed: false, reason: "Item not found" };

  const lane = state.definition.swimlanes.find((l) => l.id === item.swimlaneId);
  const laneCols = lane?.columns?.length ? lane.columns : state.definition.columns;
  const targetCol = laneCols.find((c) => c.id === targetColumnId);
  if (!targetCol) return { allowed: false, reason: "Column not found" };

  // Can always move to backlog or done
  if (targetCol.type === "backlog" || targetCol.type === "done") {
    return { allowed: true, reason: "" };
  }

  // Check column WIP limit
  if (targetCol.wipLimit !== null) {
    const inCol = state.items.filter(
      (it) => it.columnId === targetColumnId && it.swimlaneId === item.swimlaneId && it.id !== itemId,
    ).length;
    if (inCol >= targetCol.wipLimit) {
      return { allowed: false, reason: `WIP limit reached (${targetCol.wipLimit})` };
    }
  }

  // Check lane WIP limit
  if (lane?.wipLimit !== null && lane?.wipLimit !== undefined) {
    const workflowColIds = new Set(
      laneCols.filter((c) => c.type !== "backlog" && c.type !== "done").map((c) => c.id),
    );
    const laneWip = state.items.filter(
      (it) => it.swimlaneId === item.swimlaneId && workflowColIds.has(it.columnId) && it.id !== itemId,
    ).length;
    if (laneWip >= lane.wipLimit) {
      return { allowed: false, reason: `Lane WIP limit reached (${lane.wipLimit})` };
    }
  }

  return { allowed: true, reason: "" };
}

/** Move an item to a new column */
export function moveItem(
  state: BoardState,
  itemId: string,
  targetColumnId: string,
  targetSubColumnId: string | null = null,
): BoardState {
  const check = canMoveItem(state, itemId, targetColumnId, targetSubColumnId);
  if (!check.allowed) return state;

  const item = state.items.find((it) => it.id === itemId);
  if (!item) return state;
  if (item.columnId === targetColumnId && item.subColumnId === targetSubColumnId) return state;

  const lane = state.definition.swimlanes.find((l) => l.id === item.swimlaneId);
  const laneCols = lane?.columns?.length ? lane.columns : state.definition.columns;
  const targetCol = laneCols.find((c) => c.id === targetColumnId);
  if (!targetCol) return state;

  const { currentDay } = state;

  // Close current state transition
  const updatedHistory: StateTransition[] = item.stateHistory.map((t) =>
    t.exitedDay === null ? { ...t, exitedDay: currentDay } : t,
  );

  // Add new state transition
  updatedHistory.push({
    columnId: targetColumnId,
    subColumnId: targetSubColumnId,
    enteredDay: currentDay,
    exitedDay: null,
  });

  // Determine commitment and done days
  let commitDay = item.commitDay;
  let doneDay = item.doneDay;

  if (targetCol.type !== "backlog" && commitDay === null) {
    commitDay = currentDay;
  }
  if (targetCol.type === "done" && doneDay === null) {
    doneDay = currentDay;
  }
  // If moving back from done, clear doneDay
  if (targetCol.type !== "done" && doneDay !== null) {
    doneDay = null;
  }

  const updatedItem: BoardWorkItem = {
    ...item,
    columnId: targetColumnId,
    subColumnId: targetSubColumnId,
    stateHistory: updatedHistory,
    commitDay,
    doneDay,
  };

  return {
    ...state,
    items: state.items.map((it) => (it.id === itemId ? updatedItem : it)),
  };
}

// ─── Round Simulation ───────────────────────────────────────

/** Generate random arrivals into backlog */
export function generateArrivals(state: BoardState): BoardState {
  const { definition: def } = state;
  if (def.itemTypes.length === 0) return state;

  const count = poisson(def.settings.arrivalRate);
  let s = state;

  for (let i = 0; i < count; i++) {
    // Pick random item type
    const typeIdx = Math.floor(seededRandom() * def.itemTypes.length);
    const type = def.itemTypes[typeIdx];

    // Pick swimlane: use default if set, otherwise random
    let swimlaneId = type.defaultSwimlane;
    if (!swimlaneId || !def.swimlanes.some((l) => l.id === swimlaneId)) {
      // Default to first non-expedite lane, or just first lane
      const standardLane = def.swimlanes.find((l) => !l.name.toLowerCase().includes("expedite"));
      swimlaneId = standardLane?.id ?? def.swimlanes[0]?.id ?? "default";
    }

    s = createWorkItem(s, type.id, swimlaneId);
  }

  return s;
}

/** Process items: items in active columns may complete their stage */
function processItems(state: BoardState): BoardState {
  const { definition: def, currentDay } = state;
  let s = state;

  // Process each swimlane independently
  for (const lane of def.swimlanes) {
    const laneCols = lane.columns?.length ? lane.columns : def.columns;
    const workflowCols = laneCols.filter((c) => c.type !== "backlog" && c.type !== "done");

    // Process columns from right to left (pull system - downstream pulls first)
    for (let ci = workflowCols.length - 1; ci >= 0; ci--) {
      const col = workflowCols[ci];
      const nextCol = ci < workflowCols.length - 1 ? workflowCols[ci + 1] : laneCols.find((c) => c.type === "done");

      if (!nextCol) continue;

      // Find items in this column for this lane
      const colItems = s.items.filter(
        (it) => it.columnId === col.id && it.swimlaneId === lane.id && it.doneDay === null,
      );

      for (const item of colItems) {
        // Active columns: items have a chance of completing
        if (col.type === "active" || (col.subColumns.length > 0 && item.subColumnId)) {
          const roll = seededRandom();
          if (roll < def.settings.processingChance) {
            // If column has sub-columns and item is in "doing", move to "done" sub-column first
            if (col.subColumns.length > 0) {
              const doingSub = col.subColumns.find((sc) => sc.type === "active");
              const doneSub = col.subColumns.find((sc) => sc.type === "queue");
              if (item.subColumnId === doingSub?.id && doneSub) {
                // Move to done sub-column (queue)
                s = moveItem(s, item.id, col.id, doneSub.id);
                continue;
              }
            }
            // Try to move to next column
            const check = canMoveItem(s, item.id, nextCol.id);
            if (check.allowed) {
              const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
              s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
            }
          }
        } else if (col.type === "queue") {
          // Queue columns: try to pull to next active column
          const check = canMoveItem(s, item.id, nextCol.id);
          if (check.allowed) {
            const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
            s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
          }
        }
      }
    }

    // Pull from backlog into first workflow column
    const backlogCol = laneCols.find((c) => c.type === "backlog");
    const firstWorkCol = workflowCols[0];
    if (backlogCol && firstWorkCol) {
      const backlogItems = s.items.filter(
        (it) => it.columnId === backlogCol.id && it.swimlaneId === lane.id,
      );
      for (const item of backlogItems) {
        const check = canMoveItem(s, item.id, firstWorkCol.id);
        if (check.allowed) {
          const firstSub = firstWorkCol.subColumns.find((sc) => sc.type === "active");
          s = moveItem(s, item.id, firstWorkCol.id, firstSub?.id ?? null);
        }
      }
    }
  }

  return s;
}

/** Advance one round (day): arrivals → processing → snapshot */
export function advanceRound(state: BoardState): BoardState {
  let s = { ...state, currentDay: state.currentDay + 1 };

  // 1. Generate arrivals
  s = generateArrivals(s);

  // 2. Process items (pull from right to left)
  s = processItems(s);

  // 3. Take snapshot
  const snapshot = takeBoardSnapshot(s);
  s = { ...s, snapshots: [...s.snapshots, snapshot] };

  return s;
}

/** Run multiple rounds at once */
export function advanceMultipleRounds(state: BoardState, count: number): BoardState {
  let s = state;
  for (let i = 0; i < count; i++) {
    s = advanceRound(s);
  }
  return s;
}

// ─── Validation ─────────────────────────────────────────────

export interface ValidationResult {
  id: string;
  label: string;
  icon: string;
  color: string;
  pass: boolean;
  detail: string;
}

export function validateBoard(def: BoardDefinition): ValidationResult[] {
  const cols = def.columns;

  return [
    {
      id: "units", label: "Units of Value", icon: "\u{1F4E6}", color: "#3b82f6",
      ...(() => {
        const pass = def.itemTypes.length > 0;
        return { pass, detail: pass
          ? `${def.itemTypes.length} type${def.itemTypes.length > 1 ? "s" : ""}: ${def.itemTypes.map((t) => t.name).join(", ")}`
          : "No item types defined." };
      })(),
    },
    {
      id: "start", label: "Start of Workflow", icon: "\u{1F6AA}", color: "#22c55e",
      ...(() => {
        const hasBacklog = cols.some((c) => c.type === "backlog");
        const hasWorkflow = cols.some((c) => c.type === "active" || c.type === "queue");
        return { pass: hasBacklog && hasWorkflow, detail: hasBacklog && hasWorkflow
          ? `Items move from "${cols.find((c) => c.type === "backlog")?.name}" into the workflow`
          : "Need a backlog and at least one workflow column." };
      })(),
    },
    {
      id: "end", label: "End of Workflow", icon: "\u{1F3C1}", color: "#22c55e",
      ...(() => {
        const hasDone = cols.some((c) => c.type === "done");
        return { pass: hasDone, detail: hasDone
          ? `Items complete at "${cols.find((c) => c.type === "done")?.name}"`
          : "No done column." };
      })(),
    },
    {
      id: "states", label: "Workflow States", icon: "\u{1F4CB}", color: "#8b5cf6",
      ...(() => {
        const wf = cols.filter((c) => c.type === "active" || c.type === "queue");
        return { pass: wf.length >= 2, detail: wf.length >= 2
          ? `${wf.length} states: ${wf.map((c) => c.name).join(" \u2192 ")}`
          : `Only ${wf.length} state${wf.length === 1 ? "" : "s"}.` };
      })(),
    },
    {
      id: "wip", label: "WIP Control", icon: "\u{1F6A7}", color: "#f59e0b",
      ...(() => {
        const wl = cols.filter((c) => c.wipLimit !== null && c.type !== "backlog" && c.type !== "done");
        return { pass: wl.length > 0, detail: wl.length > 0
          ? `Limits on: ${wl.map((c) => `${c.name} (${c.wipLimit})`).join(", ")}`
          : "No WIP limits. No pull system." };
      })(),
    },
    {
      id: "policies", label: "Explicit Policies", icon: "\u{1F4DC}", color: "#ef4444",
      ...(() => {
        const wp = cols.filter((c) => c.policy.trim().length > 0);
        return { pass: wp.length >= 2, detail: wp.length >= 2
          ? `${wp.length}/${cols.length} columns have policies`
          : `Only ${wp.length} column${wp.length === 1 ? " has" : "s have"} a policy.` };
      })(),
    },
    {
      id: "sle", label: "Service Level Expectation", icon: "\u{23F1}\uFE0F", color: "#06b6d4",
      pass: def.settings.sleDays > 0 && def.settings.slePercentile > 0,
      detail: `${def.settings.slePercentile}% within ${def.settings.sleDays} days`,
    },
  ];
}
