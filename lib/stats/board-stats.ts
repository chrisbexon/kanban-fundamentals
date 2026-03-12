/**
 * Board Statistics & Chart Adapters
 *
 * Pure functions that compute chart data from BoardState.
 * These produce the same data shapes used by existing chart components,
 * plus the new GenericCfdPoint for dynamic-column CFDs.
 *
 * Existing Kanban Game charts continue to use wip-game-stats.ts unchanged.
 * New board designer charts use these functions.
 * Shared chart components accept the common shapes (CycleTimePoint, etc.).
 */

import type {
  BoardDefinition,
  BoardWorkItem,
  BoardSnapshot,
  BoardState,
  GenericCfdPoint,
} from "@/types/board";
import {
  getWorkflowColumns,
  itemCycleTime,
  itemAge,
} from "@/types/board";

// Re-export compatible types from wip-game for chart components that accept both
import type {
  CycleTimePoint,
  CycleTimeBucket,
  AgingWipItem,
  FlowEfficiencyItem,
  DashboardMetrics,
} from "@/types/wip-game";

// ─── Cycle Time ─────────────────────────────────────────────

export interface BoardCycleTimePoint extends CycleTimePoint {
  wasBlocked: boolean;
  isExpedite: boolean;
  classOfService: string;
}

/** Scatter plot: cycle time per completed item, with blocked/expedite flags */
export function cycleTimeScatter(items: BoardWorkItem[]): CycleTimePoint[] {
  return items
    .filter((it) => it.commitDay !== null && it.doneDay !== null)
    .map((it) => ({
      itemId: it.id,
      cycleTime: it.doneDay! - it.commitDay!,
      dayDone: it.doneDay!,
    }))
    .sort((a, b) => a.dayDone - b.dayDone);
}

/** Extended scatter with blocked/expedite metadata for board designer chart.
 *  Only flags "wasBlocked" if the item spent 2+ days blocked (significant impact). */
export function cycleTimeScatterExtended(items: BoardWorkItem[]): BoardCycleTimePoint[] {
  return items
    .filter((it) => it.commitDay !== null && it.doneDay !== null)
    .map((it) => ({
      itemId: it.id,
      cycleTime: it.doneDay! - it.commitDay!,
      dayDone: it.doneDay!,
      wasBlocked: (it.blockedDays ?? 0) >= 2,
      isExpedite: it.classOfService === "expedite",
      classOfService: it.classOfService ?? "standard",
    }))
    .sort((a, b) => a.dayDone - b.dayDone);
}

/** Histogram: cycle time distribution */
export function cycleTimeHistogram(items: BoardWorkItem[]): CycleTimeBucket[] {
  const done = items.filter((it) => it.commitDay !== null && it.doneDay !== null);
  if (done.length === 0) return [];

  const cts = done.map((it) => it.doneDay! - it.commitDay!);
  const maxCt = Math.max(...cts);
  const buckets: CycleTimeBucket[] = [];

  for (let i = 1; i <= maxCt; i++) {
    buckets.push({ bucket: i, count: cts.filter((ct) => ct === i).length });
  }
  return buckets;
}

// ─── Throughput ─────────────────────────────────────────────

export interface BoardThroughputDay {
  day: number;
  count: number;
  rollingAvg: number | null;
}

/** Daily throughput with rolling average */
export function throughputPerDay(
  items: BoardWorkItem[],
  minDay: number,
  maxDay: number,
  windowSize: number = 5,
): BoardThroughputDay[] {
  const result: BoardThroughputDay[] = [];

  for (let d = minDay; d <= maxDay; d++) {
    const count = items.filter((it) => it.doneDay === d).length;
    result.push({ day: d, count, rollingAvg: null });
  }

  for (let i = 0; i < result.length; i++) {
    if (i >= windowSize - 1) {
      const slice = result.slice(i - windowSize + 1, i + 1);
      result[i].rollingAvg =
        Math.round((slice.reduce((s, d) => s + d.count, 0) / windowSize) * 100) / 100;
    }
  }

  return result;
}

// ─── CFD (Generic) ──────────────────────────────────────────

/** Cumulative Flow Diagram with dynamic columns. Optionally filter by swimlane. */
export function cfdData(
  snapshots: BoardSnapshot[],
  def: BoardDefinition,
  swimlaneId?: string | null,
): GenericCfdPoint[] {
  return snapshots.map((snap) => {
    const point: GenericCfdPoint = { day: snap.day };
    const source = swimlaneId && snap.itemsBySwimlane?.[swimlaneId]
      ? snap.itemsBySwimlane[swimlaneId]
      : snap.itemsByColumn;
    for (const col of def.columns) {
      point[col.id] = source[col.id] ?? 0;
    }
    return point;
  });
}

// ─── Aging WIP ──────────────────────────────────────────────

/** Current aging WIP items */
export function agingWip(
  items: BoardWorkItem[],
  def: BoardDefinition,
  currentDay: number,
): (AgingWipItem & { columnName: string; typeId: string })[] {
  const workflowColIds = new Set(getWorkflowColumns(def).map((c) => c.id));

  return items
    .filter((it) => workflowColIds.has(it.columnId) && it.commitDay !== null && it.doneDay === null)
    .map((it) => {
      const age = itemAge(it, currentDay);
      // Estimate percent complete from state history
      const totalCols = def.columns.filter((c) => c.type !== "backlog" && c.type !== "done").length;
      const currentIdx = def.columns.findIndex((c) => c.id === it.columnId);
      const startIdx = def.columns.findIndex((c) => c.type !== "backlog");
      const pct = totalCols > 0 ? Math.round(((currentIdx - startIdx) / totalCols) * 100) : 0;

      const col = def.columns.find((c) => c.id === it.columnId);
      return {
        itemId: it.id,
        location: it.columnId as never, // compatibility field
        age,
        percentComplete: Math.min(99, Math.max(0, pct)),
        columnName: col?.name ?? it.columnId,
        typeId: it.typeId,
      };
    })
    .sort((a, b) => b.age - a.age);
}

// ─── Flow Efficiency ────────────────────────────────────────

/** Flow efficiency per completed item (active time vs queue/wait time) */
export function flowEfficiency(
  items: BoardWorkItem[],
  def: BoardDefinition,
): FlowEfficiencyItem[] {
  // Build a set of "active" sub-column/column IDs
  const activeIds = new Set<string>();
  for (const col of def.columns) {
    if (col.subColumns.length > 0) {
      for (const sub of col.subColumns) {
        if (sub.type === "active") activeIds.add(`${col.id}:${sub.id}`);
      }
    } else if (col.type === "active") {
      activeIds.add(col.id);
    }
  }

  return items
    .filter((it) => it.commitDay !== null && it.doneDay !== null)
    .map((it) => {
      const ct = it.doneDay! - it.commitDay!;
      let workTime = 0;
      let waitTime = 0;

      for (const transition of it.stateHistory) {
        if (transition.exitedDay === null) continue;
        const duration = transition.exitedDay - transition.enteredDay;
        const key = transition.subColumnId
          ? `${transition.columnId}:${transition.subColumnId}`
          : transition.columnId;

        if (activeIds.has(key)) {
          workTime += duration;
        } else {
          waitTime += duration;
        }
      }

      // If no history detail, fall back to rough estimate
      if (workTime === 0 && waitTime === 0 && ct > 0) {
        workTime = Math.ceil(ct * 0.4);
        waitTime = ct - workTime;
      }

      return {
        itemId: it.id,
        workTime,
        waitTime,
        efficiency: ct > 0 ? Math.round((workTime / ct) * 100) : 0,
      };
    })
    .sort((a, b) => a.efficiency - b.efficiency);
}

// ─── Monte Carlo ────────────────────────────────────────────

/** Monte Carlo: how many items can be done in N days */
export function monteCarloHowMany(
  items: BoardWorkItem[],
  daysToSimulate: number,
  simulations: number = 1000,
): { bucket: number; count: number; cumPct: number }[] {
  const dailyThroughput = buildDailyThroughput(items);
  if (dailyThroughput.length === 0) return [];

  const results: number[] = [];
  for (let s = 0; s < simulations; s++) {
    let total = 0;
    for (let d = 0; d < daysToSimulate; d++) {
      total += dailyThroughput[Math.floor(Math.random() * dailyThroughput.length)];
    }
    results.push(total);
  }

  return buildHistogram(results, simulations);
}

/** Monte Carlo: when will N items be done */
export function monteCarloWhen(
  items: BoardWorkItem[],
  targetItems: number,
  simulations: number = 1000,
): { bucket: number; count: number; cumPct: number }[] {
  const dailyThroughput = buildDailyThroughput(items);
  if (dailyThroughput.length === 0) return [];

  const results: number[] = [];
  for (let s = 0; s < simulations; s++) {
    let remaining = targetItems;
    let daysNeeded = 0;
    while (remaining > 0 && daysNeeded < 200) {
      remaining -= dailyThroughput[Math.floor(Math.random() * dailyThroughput.length)];
      daysNeeded++;
    }
    results.push(daysNeeded);
  }

  return buildHistogram(results, simulations);
}

function buildDailyThroughput(items: BoardWorkItem[]): number[] {
  const done = items.filter((it) => it.doneDay !== null);
  if (done.length < 3) return [];

  const days = done.map((it) => it.doneDay!);
  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);

  const throughput: number[] = [];
  for (let d = minDay; d <= maxDay; d++) {
    throughput.push(done.filter((it) => it.doneDay === d).length);
  }
  return throughput;
}

function buildHistogram(
  results: number[],
  simulations: number,
): { bucket: number; count: number; cumPct: number }[] {
  results.sort((a, b) => a - b);
  const maxVal = Math.max(...results);
  const buckets: { bucket: number; count: number; cumPct: number }[] = [];

  for (let i = Math.min(...results); i <= maxVal; i++) {
    const count = results.filter((r) => r === i).length;
    const cumCount = results.filter((r) => r <= i).length;
    if (count > 0) {
      buckets.push({ bucket: i, count, cumPct: Math.round((cumCount / simulations) * 100) });
    }
  }
  return buckets;
}

// ─── Dashboard Metrics ──────────────────────────────────────

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

/** Compute summary dashboard metrics from board items */
export function dashboardMetrics(
  items: BoardWorkItem[],
  def: BoardDefinition,
  currentDay: number,
): DashboardMetrics {
  const done = items.filter((it) => it.commitDay !== null && it.doneDay !== null);
  const cts = done.map((it) => it.doneDay! - it.commitDay!);

  const avgCycleTime = cts.length > 0
    ? Math.round((cts.reduce((s, c) => s + c, 0) / cts.length) * 10) / 10
    : 0;
  const p85CycleTime = cts.length > 0 ? percentile(cts, 85) : 0;

  const doneDays = done.map((it) => it.doneDay!);
  const dayRange = doneDays.length > 0 ? Math.max(...doneDays) - Math.min(...doneDays) + 1 : 1;
  const avgThroughput = doneDays.length > 0
    ? Math.round((done.length / dayRange) * 100) / 100
    : 0;

  const workflowColIds = new Set(getWorkflowColumns(def).map((c) => c.id));
  const currentWip = items.filter((it) => workflowColIds.has(it.columnId)).length;

  const sleMet = cts.length > 0
    ? cts.filter((ct) => ct <= def.settings.sleDays).length
    : 0;
  const sleMetPct = cts.length > 0 ? Math.round((sleMet / cts.length) * 100) : 0;

  const inProgress = items.filter(
    (it) => workflowColIds.has(it.columnId) && it.commitDay !== null && it.doneDay === null,
  );
  const avgAge = inProgress.length > 0
    ? Math.round(
        (inProgress.reduce((s, it) => s + itemAge(it, currentDay), 0) / inProgress.length) * 10,
      ) / 10
    : 0;

  return { avgCycleTime, p85CycleTime, avgThroughput, currentWip, sleMetPct, avgAge };
}

// ─── Snapshot Factory ───────────────────────────────────────

/** Take a snapshot of current board state (called each day in run mode) */
export function takeBoardSnapshot(
  state: BoardState,
): BoardSnapshot {
  const { definition: def, items, currentDay } = state;

  const itemsByColumn: Record<string, number> = {};
  const itemsBySubColumn: Record<string, number> = {};

  for (const col of def.columns) {
    const colItems = items.filter((it) => it.columnId === col.id);
    itemsByColumn[col.id] = colItems.length;

    for (const sub of col.subColumns) {
      const key = `${col.id}:${sub.id}`;
      itemsBySubColumn[key] = colItems.filter((it) => it.subColumnId === sub.id).length;
    }
  }

  const wipByGroup: Record<string, number> = {};
  for (const group of def.columnGroups) {
    wipByGroup[group.id] = items.filter((it) => group.columnIds.includes(it.columnId)).length;
  }

  const workflowColIds = new Set(getWorkflowColumns(def).map((c) => c.id));
  const wip = items.filter((it) => workflowColIds.has(it.columnId)).length;

  const doneItems = items.filter((it) => it.doneDay !== null);
  const inProgress = items.filter(
    (it) => workflowColIds.has(it.columnId) && it.commitDay !== null && it.doneDay === null,
  );
  const avgAge = inProgress.length > 0
    ? Math.round(
        (inProgress.reduce((s, it) => s + itemAge(it, currentDay), 0) / inProgress.length) * 10,
      ) / 10
    : 0;

  // Per-swimlane item counts
  const itemsBySwimlane: Record<string, Record<string, number>> = {};
  for (const lane of def.swimlanes) {
    const laneCounts: Record<string, number> = {};
    const laneCols = lane.columns?.length ? lane.columns : def.columns;
    for (const col of laneCols) {
      laneCounts[col.id] = items.filter((it) => it.columnId === col.id && it.swimlaneId === lane.id).length;
    }
    itemsBySwimlane[lane.id] = laneCounts;
  }

  return {
    day: currentDay,
    itemsByColumn,
    itemsBySubColumn,
    wipByGroup,
    systemWip: wip,
    itemsDone: doneItems.length,
    totalItems: items.length,
    avgAge,
    itemsBySwimlane,
  };
}
