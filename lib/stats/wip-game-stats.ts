import type {
  WipWorkItem, DaySnapshot, WipLocation,
  CfdDataPoint, CycleTimePoint, CycleTimeBucket, ThroughputDay,
  AgingWipItem, FlowEfficiencyItem, HeatMapCell, WipRunPoint,
  MonteCarloResult, DashboardMetrics,
} from "@/types/wip-game";
import { SLE_DAYS } from "@/lib/constants/wip-game";

// ─── CFD ────────────────────────────────────────────────────

/** Cumulative Flow Diagram data: stacked area chart */
export function cfdData(snapshots: DaySnapshot[]): CfdDataPoint[] {
  return snapshots.map((snap) => ({
    day: snap.day,
    backlog: snap.itemsByLocation["backlog"] ?? 0,
    redActive: snap.itemsByLocation["red-active"] ?? 0,
    redFinished: snap.itemsByLocation["red-finished"] ?? 0,
    blueActive: snap.itemsByLocation["blue-active"] ?? 0,
    blueFinished: snap.itemsByLocation["blue-finished"] ?? 0,
    green: snap.itemsByLocation["green"] ?? 0,
    done: snap.itemsByLocation["done"] ?? 0,
  }));
}

// ─── Cycle Time ─────────────────────────────────────────────

/** Scatter plot: cycle time per completed item */
export function cycleTimeScatter(items: WipWorkItem[]): CycleTimePoint[] {
  return items
    .filter((it) => it.dayDone !== null && it.dayStarted !== null)
    .map((it) => ({
      itemId: it.id,
      cycleTime: it.dayDone! - it.dayStarted!,
      dayDone: it.dayDone!,
    }))
    .sort((a, b) => a.dayDone - b.dayDone);
}

/** Histogram: cycle time distribution */
export function cycleTimeHistogram(items: WipWorkItem[]): CycleTimeBucket[] {
  const done = items.filter((it) => it.dayDone !== null && it.dayStarted !== null);
  if (done.length === 0) return [];

  const cts = done.map((it) => it.dayDone! - it.dayStarted!);
  const maxCt = Math.max(...cts);
  const buckets: CycleTimeBucket[] = [];

  for (let i = 1; i <= maxCt; i++) {
    buckets.push({ bucket: i, count: cts.filter((ct) => ct === i).length });
  }
  return buckets;
}

/** Compute percentiles from an array of numbers */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ─── Throughput ─────────────────────────────────────────────

/** Daily throughput with rolling average */
export function throughputPerDay(items: WipWorkItem[], minDay: number, maxDay: number): ThroughputDay[] {
  const result: ThroughputDay[] = [];
  const window = 5;

  for (let d = minDay; d <= maxDay; d++) {
    const count = items.filter((it) => it.dayDone === d).length;
    result.push({ day: d, count, rollingAvg: null });
  }

  // Compute rolling average
  for (let i = 0; i < result.length; i++) {
    if (i >= window - 1) {
      const slice = result.slice(i - window + 1, i + 1);
      result[i].rollingAvg = Math.round((slice.reduce((s, d) => s + d.count, 0) / window) * 100) / 100;
    }
  }

  return result;
}

/** Throughput run chart (cumulative) */
export function throughputRunChart(items: WipWorkItem[], minDay: number, maxDay: number): { day: number; cumulative: number }[] {
  const result: { day: number; cumulative: number }[] = [];
  let cum = items.filter((it) => it.dayDone !== null && it.dayDone < minDay).length;

  for (let d = minDay; d <= maxDay; d++) {
    cum += items.filter((it) => it.dayDone === d).length;
    result.push({ day: d, cumulative: cum });
  }
  return result;
}

// ─── Aging WIP ──────────────────────────────────────────────

/** Current aging WIP items (not done, not backlog) */
export function agingWip(items: WipWorkItem[], currentDay: number): AgingWipItem[] {
  return items
    .filter((it) => it.location !== "backlog" && it.location !== "done" && it.dayStarted !== null)
    .map((it) => {
      const totalWork = it.work.red.required + it.work.blue.required + it.work.green.required;
      const totalDone = it.work.red.done + it.work.blue.done + it.work.green.done;
      return {
        itemId: it.id,
        location: it.location,
        age: currentDay - it.dayStarted!,
        percentComplete: totalWork > 0 ? Math.round((totalDone / totalWork) * 100) : 0,
      };
    })
    .sort((a, b) => b.age - a.age);
}

// ─── Flow Efficiency ────────────────────────────────────────

/** Flow efficiency per completed item */
export function flowEfficiency(items: WipWorkItem[]): FlowEfficiencyItem[] {
  return items
    .filter((it) => it.dayDone !== null && it.dayStarted !== null)
    .map((it) => {
      const ct = it.dayDone! - it.dayStarted!;
      // Estimate work time as sum of work done across all stages
      // Each unit of work ≈ 1 day of effort (simplified model)
      const totalWorkRequired = it.work.red.required + it.work.blue.required + it.work.green.required;
      // Work time is proportional to the work needed divided by average worker output
      // For simplicity, estimate that each work unit takes ~0.3 days on average
      const workTime = Math.min(ct, Math.ceil(totalWorkRequired / 3.5));
      const waitTime = Math.max(0, ct - workTime);

      return {
        itemId: it.id,
        workTime,
        waitTime,
        efficiency: ct > 0 ? Math.round((workTime / ct) * 100) : 0,
      };
    })
    .sort((a, b) => a.efficiency - b.efficiency);
}

// ─── Heat Map ───────────────────────────────────────────────

/** WIP heat map: item count by location by day */
export function heatMapData(snapshots: DaySnapshot[]): HeatMapCell[] {
  const cells: HeatMapCell[] = [];
  const locations: WipLocation[] = ["red-active", "red-finished", "blue-active", "blue-finished", "green"];

  for (const snap of snapshots) {
    for (const loc of locations) {
      cells.push({
        location: loc,
        day: snap.day,
        count: snap.itemsByLocation[loc] ?? 0,
      });
    }
  }
  return cells;
}

// ─── WIP Run Chart ──────────────────────────────────────────

/** Total WIP over time */
export function wipRunChart(snapshots: DaySnapshot[], wipLimit: number): WipRunPoint[] {
  return snapshots.map((snap) => {
    const wip = snap.wipByColor.red + snap.wipByColor.blue + snap.wipByColor.green;
    return { day: snap.day, wip, limit: wipLimit };
  });
}

// ─── Monte Carlo: How Many ──────────────────────────────────

/** Monte Carlo simulation: how many items can be done in N days */
export function monteCarloHowMany(
  items: WipWorkItem[],
  daysToSimulate: number,
  simulations: number = 1000,
): MonteCarloResult[] {
  // Get historical daily throughput
  const done = items.filter((it) => it.dayDone !== null);
  if (done.length < 3) return [];

  const days = done.map((it) => it.dayDone!);
  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);

  const dailyThroughput: number[] = [];
  for (let d = minDay; d <= maxDay; d++) {
    dailyThroughput.push(done.filter((it) => it.dayDone === d).length);
  }

  if (dailyThroughput.length === 0) return [];

  // Run simulations
  const results: number[] = [];
  for (let s = 0; s < simulations; s++) {
    let total = 0;
    for (let d = 0; d < daysToSimulate; d++) {
      const sample = dailyThroughput[Math.floor(Math.random() * dailyThroughput.length)];
      total += sample;
    }
    results.push(total);
  }

  // Create histogram
  results.sort((a, b) => a - b);
  const maxVal = Math.max(...results);
  const buckets: MonteCarloResult[] = [];

  for (let i = 0; i <= maxVal; i++) {
    const count = results.filter((r) => r === i).length;
    const cumCount = results.filter((r) => r <= i).length;
    if (count > 0) {
      buckets.push({ bucket: i, count, cumPct: Math.round((cumCount / simulations) * 100) });
    }
  }

  return buckets;
}

// ─── Monte Carlo: When ──────────────────────────────────────

/** Monte Carlo simulation: when will N items be done */
export function monteCarloWhen(
  items: WipWorkItem[],
  targetItems: number,
  simulations: number = 1000,
): MonteCarloResult[] {
  const done = items.filter((it) => it.dayDone !== null);
  if (done.length < 3) return [];

  const days = done.map((it) => it.dayDone!);
  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);

  const dailyThroughput: number[] = [];
  for (let d = minDay; d <= maxDay; d++) {
    dailyThroughput.push(done.filter((it) => it.dayDone === d).length);
  }

  if (dailyThroughput.length === 0) return [];

  const results: number[] = [];
  for (let s = 0; s < simulations; s++) {
    let remaining = targetItems;
    let daysNeeded = 0;
    while (remaining > 0 && daysNeeded < 200) {
      const sample = dailyThroughput[Math.floor(Math.random() * dailyThroughput.length)];
      remaining -= sample;
      daysNeeded++;
    }
    results.push(daysNeeded);
  }

  results.sort((a, b) => a - b);
  const maxVal = Math.max(...results);
  const buckets: MonteCarloResult[] = [];

  for (let i = 1; i <= maxVal; i++) {
    const count = results.filter((r) => r === i).length;
    const cumCount = results.filter((r) => r <= i).length;
    if (count > 0) {
      buckets.push({ bucket: i, count, cumPct: Math.round((cumCount / simulations) * 100) });
    }
  }

  return buckets;
}

// ─── Dashboard Metrics ──────────────────────────────────────

/** Compute summary dashboard metrics */
export function dashboardMetrics(items: WipWorkItem[], currentDay: number): DashboardMetrics {
  const done = items.filter((it) => it.dayDone !== null && it.dayStarted !== null);
  const cts = done.map((it) => it.dayDone! - it.dayStarted!);

  const avgCycleTime = cts.length > 0 ? Math.round((cts.reduce((s, c) => s + c, 0) / cts.length) * 10) / 10 : 0;
  const p85CycleTime = cts.length > 0 ? percentile(cts, 85) : 0;

  // Throughput: items done per day (over all days with completions)
  const doneDays = done.map((it) => it.dayDone!);
  const uniqueDays = new Set(doneDays).size;
  const avgThroughput = uniqueDays > 0 ? Math.round((done.length / Math.max(1, (Math.max(...doneDays) - Math.min(...doneDays) + 1))) * 100) / 100 : 0;

  // Current WIP
  const currentWip = items.filter(
    (it) => it.location !== "backlog" && it.location !== "done",
  ).length;

  // SLE met: % of done items with cycle time <= SLE_DAYS
  const sleMet = cts.length > 0 ? cts.filter((ct) => ct <= SLE_DAYS).length : 0;
  const sleMetPct = cts.length > 0 ? Math.round((sleMet / cts.length) * 100) : 0;

  // Average age of in-progress items
  const inProgress = items.filter(
    (it) => it.location !== "backlog" && it.location !== "done" && it.dayStarted !== null,
  );
  const avgAge = inProgress.length > 0
    ? Math.round((inProgress.reduce((s, it) => s + (currentDay - it.dayStarted!), 0) / inProgress.length) * 10) / 10
    : 0;

  return { avgCycleTime, p85CycleTime, avgThroughput, currentWip, sleMetPct, avgAge };
}
