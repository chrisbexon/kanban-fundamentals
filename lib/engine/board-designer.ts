/**
 * Board Designer — Pure Simulation Engine
 *
 * All functions are pure: state in, new state out. No side effects.
 *
 * Two run modes:
 *  Manual — player drags items, advance day only takes snapshots
 *  Auto   — realistic simulation with work-unit processing, blockers,
 *           classes of service, and right-to-left pull mechanics
 *
 * Auto mode round mechanics:
 *  1. Arrivals: Poisson arrivals + random regulatory items
 *  2. Blocker resolution: blocked items count down effort
 *  3. Processing: items decrement work remaining (normal distribution per column)
 *  4. Pull: completed items move right-to-left (respecting WIP limits)
 *  5. New blockers: random chance of blocking active items
 *  6. Snapshot: board snapshot taken for charting
 */

import type {
  BoardState,
  BoardDefinition,
  BoardWorkItem,
  ColumnDefinition,
  SwimlaneDefinition,
  StateTransition,
  ClassOfService,
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
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= seededRandom();
  } while (p > L);
  return k - 1;
}

/** Box-Muller normal distribution. Returns max(1, round(value)). */
function normalRandom(mean: number, stdDev: number): number {
  const u1 = seededRandom();
  const u2 = seededRandom();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  return Math.max(1, Math.round(mean + stdDev * z));
}

// ─── Item Creation ──────────────────────────────────────────

/** Create a new work item and add it to backlog */
export function createWorkItem(
  state: BoardState,
  typeId: string,
  swimlaneId: string,
  title?: string,
  classOfService: ClassOfService = "standard",
  dueDay: number | null = null,
): BoardState {
  const { definition: def, items, nextItemNumber, currentDay } = state;
  const itemType = def.itemTypes.find((t) => t.id === typeId);
  const lane = def.swimlanes.find((l) => l.id === swimlaneId);
  const laneCols = lane?.columns?.length ? lane.columns : def.columns;
  const backlogCol = laneCols.find((c) => c.type === "backlog");
  if (!backlogCol || !itemType) return state;

  const prefix = classOfService === "regulatory" ? "REG"
    : classOfService === "expedite" ? "EXP"
    : itemType.name.substring(0, 3).toUpperCase();
  const id = `${prefix}-${nextItemNumber}`;

  const newItem: BoardWorkItem = {
    id,
    title: title ?? (classOfService === "regulatory"
      ? `Regulatory #${nextItemNumber}`
      : `${itemType.name} #${nextItemNumber}`),
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
    dueDay,
    order: items.filter((it) => it.columnId === backlogCol.id && it.swimlaneId === swimlaneId).length,
    classOfService,
    workRemaining: 0,
    workTotal: 0,
    blockerEffort: 0,
    blockedDays: 0,
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

  const hasLaneWip = lane?.wipLimit !== null && lane?.wipLimit !== undefined;

  // Check column WIP limit — skipped if lane WIP is set (lane WIP governs instead)
  if (!hasLaneWip && targetCol.wipLimit !== null) {
    const inCol = state.items.filter(
      (it) => it.columnId === targetColumnId && it.swimlaneId === item.swimlaneId && it.id !== itemId,
    ).length;
    if (inCol >= targetCol.wipLimit) {
      return { allowed: false, reason: `WIP limit reached (${targetCol.wipLimit})` };
    }
  }

  // Check lane WIP limit (overrides column WIP when set)
  if (hasLaneWip) {
    const workflowColIds = new Set(
      laneCols.filter((c) => c.type !== "backlog" && c.type !== "done").map((c) => c.id),
    );
    // When lane has expedite sub-lane, only count items of the same class for lane WIP
    const isExpediteItem = item.classOfService === "expedite";
    const laneWip = state.items.filter(
      (it) => it.swimlaneId === item.swimlaneId && workflowColIds.has(it.columnId) && it.id !== itemId
        && (isExpediteItem ? it.classOfService === "expedite" : it.classOfService !== "expedite"),
    ).length;
    if (laneWip >= lane!.wipLimit!) {
      return { allowed: false, reason: `Lane WIP limit reached (${lane!.wipLimit})` };
    }
  }

  // Check expedite sub-lane WIP limit
  if (item.classOfService === "expedite" && lane?.expediteEnabled && lane.expediteWipLimit !== null) {
    const workflowColIds = new Set(
      laneCols.filter((c) => c.type !== "backlog" && c.type !== "done").map((c) => c.id),
    );
    const expediteWip = state.items.filter(
      (it) => it.swimlaneId === item.swimlaneId && it.classOfService === "expedite"
        && workflowColIds.has(it.columnId) && it.id !== itemId,
    ).length;
    if (expediteWip >= lane.expediteWipLimit) {
      return { allowed: false, reason: `Expedite WIP limit reached (${lane.expediteWipLimit})` };
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
  if (targetCol.type !== "done" && doneDay !== null) {
    doneDay = null;
  }

  // Assign work for auto mode when entering an active column
  let workRemaining = item.workRemaining;
  let workTotal = item.workTotal;
  if (state.runMode === "auto" && targetCol.type === "active") {
    const sim = state.definition.settings.autoSim;
    const baseWork = normalRandom(sim.meanProcessingDays, sim.stdDevProcessingDays);
    // Expedite items take more effort (context switching, rushed work)
    const mult = item.classOfService === "expedite" ? (sim.expediteWorkMultiplier ?? 1) : 1;
    workRemaining = Math.max(1, Math.round(baseWork * mult));
    workTotal = workRemaining;
  } else if (targetCol.type === "queue" || targetCol.type === "done" || targetCol.type === "backlog") {
    workRemaining = 0;
    workTotal = 0;
  }

  const updatedItem: BoardWorkItem = {
    ...item,
    columnId: targetColumnId,
    subColumnId: targetSubColumnId,
    stateHistory: updatedHistory,
    commitDay,
    doneDay,
    workRemaining,
    workTotal,
  };

  return {
    ...state,
    items: state.items.map((it) => (it.id === itemId ? updatedItem : it)),
  };
}

// ─── Manual Mode Processing ─────────────────────────────────

/** Manual mode: advance day only takes a snapshot, no auto-processing */
function advanceManual(state: BoardState): BoardState {
  const snapshot = takeBoardSnapshot(state);
  const MAX_SNAPSHOTS = 200;
  const snaps = [...state.snapshots, snapshot];
  return { ...state, snapshots: snaps.length > MAX_SNAPSHOTS ? snaps.slice(-MAX_SNAPSHOTS) : snaps };
}

// ─── Auto Mode Processing ───────────────────────────────────

/** Process items in auto mode: work-unit model with blockers and pull */
function processItemsAuto(state: BoardState): BoardState {
  const { definition: def } = state;
  const sim = def.settings.autoSim;
  let s = state;

  // Phase 1: Resolve blockers (decrement effort) and count blocked days
  s = {
    ...s,
    items: s.items.map((item) => {
      if (!item.blocked) return item;
      const days = (item.blockedDays ?? 0) + 1;
      if (item.blockerEffort <= 0) return { ...item, blockedDays: days };
      const newEffort = item.blockerEffort - 1;
      if (newEffort <= 0) {
        return { ...item, blocked: false, blockerDescription: "", blockerEffort: 0, blockedDays: days };
      }
      return { ...item, blockerEffort: newEffort, blockedDays: days };
    }),
  };

  // Phase 2: Decrement work on active items (not blocked)
  s = {
    ...s,
    items: s.items.map((item) => {
      if (item.blocked || item.workRemaining <= 0 || item.doneDay !== null) return item;
      return { ...item, workRemaining: item.workRemaining - 1 };
    }),
  };

  // Phase 3: Pull right-to-left (same swimlane logic as before)
  for (const lane of def.swimlanes) {
    const laneCols = lane.columns?.length ? lane.columns : def.columns;
    const workflowCols = laneCols.filter((c) => c.type !== "backlog" && c.type !== "done");
    const doneCol = laneCols.find((c) => c.type === "done");

    // Process columns from right to left
    for (let ci = workflowCols.length - 1; ci >= 0; ci--) {
      const col = workflowCols[ci];
      const nextCol = ci < workflowCols.length - 1 ? workflowCols[ci + 1] : doneCol;
      if (!nextCol) continue;

      // Get items in this column for this lane, sorted: oldest first for fair pulling
      const colItems = s.items
        .filter((it) => it.columnId === col.id && it.swimlaneId === lane.id && it.doneDay === null)
        .sort((a, b) => (a.commitDay ?? a.createdDay) - (b.commitDay ?? b.createdDay));

      for (const item of colItems) {
        // Handle sub-columns: doing → done split
        if (col.subColumns.length > 0) {
          const doingSub = col.subColumns.find((sc) => sc.type === "active");
          const doneSub = col.subColumns.find((sc) => sc.type === "queue");

          // Item in "doing" sub: move to "done" sub when work complete
          if (item.subColumnId === doingSub?.id && doneSub && item.workRemaining <= 0 && !item.blocked) {
            s = moveItem(s, item.id, col.id, doneSub.id);
            continue;
          }

          // Item in "done" sub (queue): try to pull to next column
          if (item.subColumnId === doneSub?.id) {
            const check = canMoveItem(s, item.id, nextCol.id);
            if (check.allowed) {
              const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
              s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
            }
            continue;
          }
        }

        // Simple column (no sub-columns): move when work complete
        if (item.workRemaining <= 0 && !item.blocked) {
          if (col.type === "active") {
            const check = canMoveItem(s, item.id, nextCol.id);
            if (check.allowed) {
              const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
              s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
            }
          } else if (col.type === "queue") {
            const check = canMoveItem(s, item.id, nextCol.id);
            if (check.allowed) {
              const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
              s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
            }
          }
        }
      }
    }

    // Pull from backlog into first workflow column (with priority ordering)
    const backlogCol = laneCols.find((c) => c.type === "backlog");
    const firstWorkCol = workflowCols[0];
    if (backlogCol && firstWorkCol) {
      const backlogItems = s.items
        .filter((it) => it.columnId === backlogCol.id && it.swimlaneId === lane.id)
        .sort((a, b) => {
          // Priority: expedite first, then regulatory (by due date), then standard (by age)
          const priority = (cls: ClassOfService) =>
            cls === "expedite" ? 0 : cls === "regulatory" ? 1 : 2;
          const pa = priority(a.classOfService ?? "standard");
          const pb = priority(b.classOfService ?? "standard");
          if (pa !== pb) return pa - pb;
          // Within regulatory, sort by due date (soonest first)
          if (a.classOfService === "regulatory" && b.classOfService === "regulatory") {
            return (a.dueDay ?? Infinity) - (b.dueDay ?? Infinity);
          }
          // Otherwise by age (oldest first = lowest createdDay)
          return a.createdDay - b.createdDay;
        });

      for (const item of backlogItems) {
        const check = canMoveItem(s, item.id, firstWorkCol.id);
        if (check.allowed) {
          const firstSub = firstWorkCol.subColumns.find((sc) => sc.type === "active");
          s = moveItem(s, item.id, firstWorkCol.id, firstSub?.id ?? null);
        }
      }
    }
  }

  // Phase 4: Apply new blockers (expedite items have higher blocker chance — context switching cost)
  const activeItems = s.items.filter(
    (it) => !it.blocked && it.doneDay === null && it.commitDay !== null && it.workRemaining > 0,
  );
  for (const item of activeItems) {
    const blockMult = item.classOfService === "expedite" ? (sim.expediteBlockerMultiplier ?? 1) : 1;
    if (seededRandom() < sim.blockChance * blockMult) {
      s = {
        ...s,
        items: s.items.map((it) =>
          it.id === item.id
            ? { ...it, blocked: true, blockerDescription: item.classOfService === "expedite" ? "Expedite disruption / context switch" : "Dependency / impediment", blockerEffort: sim.blockerEffort }
            : it,
        ),
      };
    }
  }

  // Phase 5: Generate regulatory items at random
  if (sim.regulatoryChance > 0 && seededRandom() < sim.regulatoryChance && def.itemTypes.length > 0) {
    const typeIdx = Math.floor(seededRandom() * def.itemTypes.length);
    const type = def.itemTypes[typeIdx];
    const standardLane = def.swimlanes.find((l) => !l.name.toLowerCase().includes("expedite"));
    const laneId = standardLane?.id ?? def.swimlanes[0]?.id ?? "default";
    const dueDay = s.currentDay + sim.regulatoryDueDayOffset;
    s = createWorkItem(s, type.id, laneId, undefined, "regulatory", dueDay);
  }

  return s;
}

// ─── Legacy Mode Processing (original probability model) ────

/** Original processing for backward compat in manual mode advance */
function processItemsLegacy(state: BoardState): BoardState {
  const { definition: def } = state;
  let s = state;

  for (const lane of def.swimlanes) {
    const laneCols = lane.columns?.length ? lane.columns : def.columns;
    const workflowCols = laneCols.filter((c) => c.type !== "backlog" && c.type !== "done");

    for (let ci = workflowCols.length - 1; ci >= 0; ci--) {
      const col = workflowCols[ci];
      const nextCol = ci < workflowCols.length - 1 ? workflowCols[ci + 1] : laneCols.find((c) => c.type === "done");
      if (!nextCol) continue;

      const colItems = s.items.filter(
        (it) => it.columnId === col.id && it.swimlaneId === lane.id && it.doneDay === null,
      );

      for (const item of colItems) {
        if (col.type === "active" || (col.subColumns.length > 0 && item.subColumnId)) {
          const roll = seededRandom();
          if (roll < def.settings.processingChance) {
            if (col.subColumns.length > 0) {
              const doingSub = col.subColumns.find((sc) => sc.type === "active");
              const doneSub = col.subColumns.find((sc) => sc.type === "queue");
              if (item.subColumnId === doingSub?.id && doneSub) {
                s = moveItem(s, item.id, col.id, doneSub.id);
                continue;
              }
            }
            const check = canMoveItem(s, item.id, nextCol.id);
            if (check.allowed) {
              const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
              s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
            }
          }
        } else if (col.type === "queue") {
          const check = canMoveItem(s, item.id, nextCol.id);
          if (check.allowed) {
            const firstSub = nextCol.subColumns.find((sc) => sc.type === "active");
            s = moveItem(s, item.id, nextCol.id, firstSub?.id ?? null);
          }
        }
      }
    }

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

// ─── Round Advancement ──────────────────────────────────────

/** Generate random arrivals into backlog */
export function generateArrivals(state: BoardState): BoardState {
  // Manual mode: no auto arrivals
  if (state.runMode === "manual") return state;

  const { definition: def } = state;
  if (def.itemTypes.length === 0) return state;

  const sim = def.settings.autoSim;
  const count = poisson(def.settings.arrivalRate);
  let s = state;

  // Standard arrivals — distribute across all swimlanes
  for (let i = 0; i < count; i++) {
    const typeIdx = Math.floor(seededRandom() * def.itemTypes.length);
    const type = def.itemTypes[typeIdx];

    let swimlaneId = type.defaultSwimlane;
    if (!swimlaneId || !def.swimlanes.some((l) => l.id === swimlaneId)) {
      // Pick a random swimlane (weighted equally)
      const laneIdx = Math.floor(seededRandom() * def.swimlanes.length);
      swimlaneId = def.swimlanes[laneIdx]?.id ?? "default";
    }

    s = createWorkItem(s, type.id, swimlaneId);
  }

  // Expedite arrivals (for any swimlane with expedite enabled)
  if ((sim.expediteChance ?? 0) > 0 && seededRandom() < sim.expediteChance) {
    const expediteLanes = def.swimlanes.filter((l) => l.expediteEnabled);
    if (expediteLanes.length > 0) {
      const lane = expediteLanes[Math.floor(seededRandom() * expediteLanes.length)];
      const typeIdx = Math.floor(seededRandom() * def.itemTypes.length);
      const type = def.itemTypes[typeIdx];
      s = createWorkItem(s, type.id, lane.id, undefined, "expedite");
    }
  }

  return s;
}

/** Advance one round (day) */
export function advanceRound(state: BoardState): BoardState {
  const runMode = state.runMode ?? "manual";
  let s = { ...state, currentDay: state.currentDay + 1 };

  if (runMode === "auto") {
    // Auto mode: arrivals → auto processing → snapshot
    s = generateArrivals(s);
    s = processItemsAuto(s);
  } else {
    // Manual mode: just take snapshot (player controls everything)
    s = advanceManual(s);
    return s;
  }

  const snapshot = takeBoardSnapshot(s);
  // Cap snapshots to prevent unbounded memory growth
  const MAX_SNAPSHOTS = 200;
  const snaps = [...s.snapshots, snapshot];

  // Trim stateHistory on long-done items to reduce memory
  const items = s.items.map((it) => {
    if (it.doneDay !== null && it.stateHistory.length > 2 && s.currentDay - it.doneDay > 30) {
      // Keep only first and last transition for completed items
      return { ...it, stateHistory: [it.stateHistory[0], it.stateHistory[it.stateHistory.length - 1]] };
    }
    return it;
  });

  s = { ...s, items, snapshots: snaps.length > MAX_SNAPSHOTS ? snaps.slice(-MAX_SNAPSHOTS) : snaps };
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
        const laneWl = def.swimlanes.filter((l) => l.wipLimit !== null);
        const hasAnyWip = wl.length > 0 || laneWl.length > 0;
        const details: string[] = [];
        if (wl.length > 0) details.push(`Columns: ${wl.map((c) => `${c.name} (${c.wipLimit})`).join(", ")}`);
        if (laneWl.length > 0) details.push(`Lanes: ${laneWl.map((l) => `${l.name} (${l.wipLimit})`).join(", ")}`);
        return { pass: hasAnyWip, detail: hasAnyWip
          ? details.join(". ")
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
