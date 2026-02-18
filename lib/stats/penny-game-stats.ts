import type { WorkItem, RunStats, ThroughputPoint, ItemBreakdownData } from "@/types/penny-game";
import { WORK_STATES, TOTAL_ITEMS } from "@/lib/constants/penny-game";

/** Compute summary stats for a set of items. Returns null if none are done. */
export function getStats(items: WorkItem[]): RunStats | null {
  const done = items.filter((x) => x.dt !== null);
  if (!done.length) return null;

  const ct = done.map((x) => x.dt! - x.st!);
  const ac = ct.reduce((a, b) => a + b, 0) / ct.length;

  const wt = done.map((x) => {
    const tw = WORK_STATES.reduce((s, st) => s + x.wr[st], 0);
    return Math.max(0, (x.dt! - x.st!) - tw);
  });
  const aw = wt.reduce((a, b) => a + b, 0) / wt.length;

  const ld: Record<string, number> = {};
  for (const s of WORK_STATES) {
    ld[s] = items.reduce((sum, x) => sum + x.wr[s], 0);
  }
  const bn = Object.entries(ld).sort((a, b) => b[1] - a[1])[0];

  return {
    done: done.length,
    first: Math.min(...done.map((x) => x.dt!)),
    all: done.length === TOTAL_ITEMS ? Math.max(...done.map((x) => x.dt!)) : null,
    ac: ac.toFixed(1),
    aw: Math.max(0, aw).toFixed(1),
    bn: bn[0],
  };
}

/** Generate cumulative throughput data for charting. */
export function throughputData(snap: WorkItem[], ticks: number): ThroughputPoint[] {
  const d: ThroughputPoint[] = [];
  for (let t = 0; t <= ticks; t++) {
    d.push({ tick: t, done: snap.filter((x) => x.dt !== null && x.dt <= t).length });
  }
  return d;
}

/** Per-item breakdown of work time vs wait time. */
export function itemBreakdown(snap: WorkItem[]): ItemBreakdownData[] {
  return snap
    .filter((x) => x.dt !== null)
    .map((x) => {
      const tw = WORK_STATES.reduce((s, st) => s + x.wr[st], 0);
      return {
        id: x.id,
        cycleTime: x.dt! - x.st!,
        workTime: tw,
        waitTime: Math.max(0, (x.dt! - x.st!) - tw),
      };
    })
    .sort((a, b) => a.id - b.id);
}
