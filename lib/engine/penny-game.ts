import type { WorkItem, WorkState } from "@/types/penny-game";
import { WORK_STATES, STATE_AFTER, TOTAL_ITEMS } from "@/lib/constants/penny-game";

/** Generate random work requirements for each stage (1-4 ticks). */
export function rndWork(): Record<WorkState, number> {
  const w = {} as Record<WorkState, number>;
  for (const s of WORK_STATES) {
    w[s] = Math.floor(Math.random() * 4) + 1;
  }
  return w;
}

/** Create n fresh work items in the backlog. */
export function makeItems(n: number = TOTAL_ITEMS): WorkItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    state: "backlog" as const,
    wr: rndWork(),
    wd: { mint: 0, press: 0, polish: 0, inspect: 0 },
    st: null,
    dt: null,
    et: 0,
    working: false,
    jc: false,
    jm: false,
  }));
}

/** Advance the simulation by one tick. Pure function: returns new items array. */
export function simTick(prev: WorkItem[], bs: number, tick: number): WorkItem[] {
  const it = prev.map((x) => ({ ...x, jc: false, jm: false, working: false }));

  // Do work: one unit of work per stage per tick
  for (const s of WORK_STATES) {
    const inStage = it.filter((x) => x.state === s);
    const worker = inStage.find((x) => x.wd[s] < x.wr[s]);
    if (worker) {
      worker.wd[s]++;
      worker.working = true;
      if (worker.wd[s] >= worker.wr[s]) worker.jc = true;
    }
  }

  // Move completed batches (reverse order to avoid pileup)
  for (const s of [...WORK_STATES].reverse()) {
    const inStage = it.filter((x) => x.state === s);
    if (!inStage.length || !inStage.every((x) => x.wd[s] >= x.wr[s])) continue;

    const ns = STATE_AFTER[s];
    if (ns === "done") {
      for (const x of inStage) {
        x.state = "done";
        x.dt = tick;
        x.jm = true;
        x.et = tick;
      }
    } else if (!it.filter((x) => x.state === ns).length) {
      for (const x of inStage) {
        x.state = ns;
        x.jm = true;
        x.et = tick;
      }
    }
  }

  // Pull from backlog into first work stage
  if (!it.filter((x) => x.state === "mint").length) {
    const bl = it.filter((x) => x.state === "backlog").slice(0, bs);
    for (const x of bl) {
      x.state = "mint";
      x.st = tick;
      x.jm = true;
      x.et = tick;
    }
  }

  return it;
}
