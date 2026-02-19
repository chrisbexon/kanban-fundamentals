import type {
  WipWorkItem, Worker, WipLocation, WorkColor, WipSettings,
  DaySnapshot, RoundResult, WorkerRollResult, GameEvent, WorkBar,
} from "@/types/wip-game";
import {
  LOCATIONS_IN_ORDER, STAGE_AFTER, LOCATION_WORK_COLOR, WIP_LOCATIONS,
  OWN_STAGE_DICE, CROSS_TRAINED_DICE, WORK_REQUIRED_RANGE,
  BLOCK_CHANCE, BLOCKER_WORK_REQUIRED, EVENTS_CONFIG, INITIAL_WORKERS,
} from "@/lib/constants/wip-game";

// ─── Helpers ────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate random work requirements for a new item */
export function rndWork(): Record<WorkColor, WorkBar> {
  return {
    red: { required: rnd(WORK_REQUIRED_RANGE.min, WORK_REQUIRED_RANGE.max), done: 0 },
    blue: { required: rnd(WORK_REQUIRED_RANGE.min, WORK_REQUIRED_RANGE.max), done: 0 },
    green: { required: rnd(WORK_REQUIRED_RANGE.min, WORK_REQUIRED_RANGE.max), done: 0 },
  };
}

/** Create a new work item */
export function makeItem(id: string, day: number, cls: string = "standard", dueDay: number | null = null, workOverride?: Record<WorkColor, number>): WipWorkItem {
  const work = workOverride
    ? {
        red: { required: workOverride.red, done: 0 },
        blue: { required: workOverride.blue, done: 0 },
        green: { required: workOverride.green, done: 0 },
      }
    : rndWork();
  return {
    id,
    location: "backlog",
    work,
    blocked: false,
    blockerWork: { required: 0, done: 0 },
    dayCreated: day,
    dayStarted: null,
    dayDone: null,
    assignedWorkerIds: [],
    class: cls,
    dueDay,
  };
}

/** Create fresh set of workers */
export function makeWorkers(): Worker[] {
  return INITIAL_WORKERS.map((w) => ({ ...w, assignedItemId: null }));
}

// ─── WIP Counting ───────────────────────────────────────────

/** Count items at locations for a color's WIP */
export function stageWip(items: WipWorkItem[], color: WorkColor): number {
  const locs = WIP_LOCATIONS[color];
  return items.filter((it) => locs.includes(it.location)).length;
}

/** Check if assigning a worker would violate WIP limits */
function wouldViolateWip(
  items: WipWorkItem[],
  item: WipWorkItem,
  worker: Worker,
  settings: WipSettings,
): boolean {
  // Only check if the item would need to be in the worker's active column
  // Workers work on items in active columns; items in finished/buffer don't get worked on
  const targetColor = worker.color;
  if (!settings.enforceWip[targetColor]) return false;

  // If the item is already in a location that counts toward this color's WIP, no new WIP added
  const wipLocs = WIP_LOCATIONS[targetColor];
  if (wipLocs.includes(item.location)) return false;

  // Otherwise, the item isn't in this color's WIP area yet, so assignment is fine
  // (WIP is about items in columns, not about worker assignments)
  return false;
}

/** Can this worker be assigned to this item? */
export function canAssign(
  items: WipWorkItem[],
  item: WipWorkItem,
  worker: Worker,
  settings: WipSettings,
): boolean {
  // Worker already assigned somewhere
  if (worker.assignedItemId !== null) return false;

  // Item must be in an active stage or blocked
  const workColor = LOCATION_WORK_COLOR[item.location];
  const isActiveStage = workColor !== undefined;
  const isBlocked = item.blocked;

  if (!isActiveStage && !isBlocked) return false;

  // Item already has this worker
  if (item.assignedWorkerIds.includes(worker.id)) return false;

  return !wouldViolateWip(items, item, worker, settings);
}

/** Assign a worker to an item. Returns new items and workers arrays. */
export function assignWorker(
  items: WipWorkItem[],
  workers: Worker[],
  workerId: string,
  itemId: string,
  settings: WipSettings,
): { items: WipWorkItem[]; workers: Worker[] } {
  const worker = workers.find((w) => w.id === workerId);
  const item = items.find((it) => it.id === itemId);
  if (!worker || !item) return { items, workers };
  if (!canAssign(items, item, worker, settings)) return { items, workers };

  const newWorkers = workers.map((w) =>
    w.id === workerId ? { ...w, assignedItemId: itemId } : w,
  );
  const newItems = items.map((it) =>
    it.id === itemId
      ? { ...it, assignedWorkerIds: [...it.assignedWorkerIds, workerId] }
      : it,
  );
  return { items: newItems, workers: newWorkers };
}

/** Unassign a worker from their current item */
export function unassignWorker(
  items: WipWorkItem[],
  workers: Worker[],
  workerId: string,
): { items: WipWorkItem[]; workers: Worker[] } {
  const worker = workers.find((w) => w.id === workerId);
  if (!worker || !worker.assignedItemId) return { items, workers };

  const itemId = worker.assignedItemId;
  const newWorkers = workers.map((w) =>
    w.id === workerId ? { ...w, assignedItemId: null } : w,
  );
  const newItems = items.map((it) =>
    it.id === itemId
      ? { ...it, assignedWorkerIds: it.assignedWorkerIds.filter((wid) => wid !== workerId) }
      : it,
  );
  return { items: newItems, workers: newWorkers };
}

// ─── Dice Rolling ───────────────────────────────────────────

/** Roll work for a single worker-item pair */
export function rollWork(worker: Worker, item: WipWorkItem): number {
  const workColor = LOCATION_WORK_COLOR[item.location];
  if (item.blocked) {
    // Any worker can work on a blocker; own-color dice
    const dice = worker.color === workColor ? OWN_STAGE_DICE : CROSS_TRAINED_DICE;
    return rnd(dice.min, dice.max);
  }
  if (!workColor) return 0;
  const isCrossTrained = worker.color !== workColor;
  const dice = isCrossTrained ? CROSS_TRAINED_DICE : OWN_STAGE_DICE;
  return rnd(dice.min, dice.max);
}

// ─── Round Resolution ───────────────────────────────────────

/** Apply work from all assigned workers, advance items, check blockers/events */
export function resolveRound(
  items: WipWorkItem[],
  workers: Worker[],
  day: number,
  settings: WipSettings,
  events: GameEvent[],
): { items: WipWorkItem[]; workers: Worker[]; result: RoundResult; events: GameEvent[] } {
  let its = items.map((it) => ({ ...it }));
  const workerRolls: WorkerRollResult[] = [];
  const blockerCleared: string[] = [];

  // 1. Roll work for each assigned worker
  for (const w of workers) {
    if (!w.assignedItemId) continue;
    const item = its.find((it) => it.id === w.assignedItemId);
    if (!item) continue;

    const roll = rollWork(w, item);
    const workColor = LOCATION_WORK_COLOR[item.location];
    const isCross = workColor ? w.color !== workColor : true;

    workerRolls.push({
      workerId: w.id,
      itemId: item.id,
      roll,
      crossTrained: isCross,
    });

    // 2. Apply work: blocked items first (excess to work bar)
    if (item.blocked) {
      const remaining = item.blockerWork.required - item.blockerWork.done;
      const blockerApply = Math.min(roll, remaining);
      item.blockerWork.done += blockerApply;
      const excess = roll - blockerApply;
      if (item.blockerWork.done >= item.blockerWork.required) {
        item.blocked = false;
        item.blockerWork = { required: 0, done: 0 };
        blockerCleared.push(item.id);
      }
      // Apply excess to the item's work bar if in an active stage
      if (excess > 0 && workColor) {
        item.work[workColor].done = Math.min(
          item.work[workColor].done + excess,
          item.work[workColor].required,
        );
      }
    } else if (workColor) {
      // Normal work application
      item.work[workColor].done = Math.min(
        item.work[workColor].done + roll,
        item.work[workColor].required,
      );
    }
  }

  // 3. Advance completed items (process from downstream to upstream to avoid cascading)
  const itemsAdvanced: string[] = [];
  its = advanceItems(its, settings, itemsAdvanced);

  // 4. Pull from backlog into red-active if space
  const itemsPulled: string[] = [];
  its = pullFromBacklog(its, settings, day, itemsPulled);

  // 5. Random blocker check
  let blockerApplied: string | null = null;
  its = applyBlocker(its, (id) => { blockerApplied = id; });

  // 6. Check for events
  let newEvents = [...events];
  let eventTriggered: GameEvent | null = null;
  const eventResult = checkEvents(its, day, newEvents);
  its = eventResult.items;
  newEvents = eventResult.events;
  eventTriggered = eventResult.triggered;

  // 7. Clear worker assignments
  const clearedWorkers = workers.map((w) => ({ ...w, assignedItemId: null }));
  its = its.map((it) => ({ ...it, assignedWorkerIds: [] }));

  // Count throughput this round
  const throughput = its.filter(
    (it) => it.dayDone === day,
  ).length;

  return {
    items: its,
    workers: clearedWorkers,
    result: {
      day,
      workerRolls,
      itemsAdvanced,
      itemsPulled,
      blockerApplied,
      blockerCleared,
      eventTriggered,
      throughput,
    },
    events: newEvents,
  };
}

/** Advance items whose current stage work is complete */
export function advanceItems(
  items: WipWorkItem[],
  settings: WipSettings,
  advanced: string[],
): WipWorkItem[] {
  const its = items.map((it) => ({ ...it }));
  let changed = true;

  // Keep looping until no more items can advance (cascade)
  while (changed) {
    changed = false;
    // Process from downstream to upstream
    const activeLocations: WipLocation[] = ["green", "blue-active", "red-active"];
    const bufferLocations: WipLocation[] = ["blue-finished", "red-finished"];

    // Advance from active stages when work is done
    for (const loc of activeLocations) {
      const workColor = LOCATION_WORK_COLOR[loc];
      if (!workColor) continue;
      const nextLoc = STAGE_AFTER[loc as Exclude<WipLocation, "done">];

      for (const item of its.filter((it) => it.location === loc && !it.blocked)) {
        const bar = item.work[workColor];
        if (bar.done >= bar.required) {
          // Check WIP of destination if it's an active/counted column
          if (canMoveToLocation(its, item, nextLoc, settings)) {
            item.location = nextLoc;
            if (nextLoc === "done") {
              item.dayDone = item.dayStarted !== null ? item.dayDone : null;
            }
            advanced.push(item.id);
            changed = true;
          }
        }
      }
    }

    // Advance from buffer/finished stages (no work needed, just WIP check)
    for (const loc of bufferLocations) {
      const nextLoc = STAGE_AFTER[loc as Exclude<WipLocation, "done">];

      for (const item of its.filter((it) => it.location === loc && !it.blocked)) {
        if (canMoveToLocation(its, item, nextLoc, settings)) {
          item.location = nextLoc;
          advanced.push(item.id);
          changed = true;
        }
      }
    }
  }

  return its;
}

/** Check if an item can move to a target location respecting WIP limits */
function canMoveToLocation(
  items: WipWorkItem[],
  item: WipWorkItem,
  targetLoc: WipLocation,
  settings: WipSettings,
): boolean {
  if (targetLoc === "done") return true;
  if (targetLoc === "backlog") return true;

  // Find which color owns the target location
  for (const color of (["red", "blue", "green"] as WorkColor[])) {
    const locs = WIP_LOCATIONS[color];
    if (locs.includes(targetLoc)) {
      if (!settings.enforceWip[color]) return true;

      // Count current WIP for this color, excluding the item itself
      const currentWip = items.filter(
        (it) => it.id !== item.id && locs.includes(it.location),
      ).length;
      return currentWip < settings.wipLimits[color];
    }
  }

  return true;
}

/** Pull top items from backlog into red-active */
export function pullFromBacklog(
  items: WipWorkItem[],
  settings: WipSettings,
  day: number,
  pulled: string[],
): WipWorkItem[] {
  const its = items.map((it) => ({ ...it }));
  const backlog = its.filter((it) => it.location === "backlog").sort(
    (a, b) => {
      // Expedite/compliance/security items first, then by dayCreated
      const priority = (it: WipWorkItem) => {
        if (it.class === "expedite") return 0;
        if (it.class === "compliance" || it.class === "security") return 1;
        return 2;
      };
      const pa = priority(a);
      const pb = priority(b);
      if (pa !== pb) return pa - pb;
      return a.dayCreated - b.dayCreated;
    },
  );

  for (const item of backlog) {
    // Check red WIP
    const redWip = stageWip(its, "red");
    if (settings.enforceWip.red && redWip >= settings.wipLimits.red) break;

    item.location = "red-active";
    item.dayStarted = day;
    pulled.push(item.id);
  }

  return its;
}

/** Randomly apply a blocker to an active item */
export function applyBlocker(
  items: WipWorkItem[],
  onBlock: (id: string) => void,
): WipWorkItem[] {
  if (Math.random() > BLOCK_CHANCE) return items;

  const its = items.map((it) => ({ ...it }));
  const activeItems = its.filter(
    (it) =>
      !it.blocked &&
      (it.location === "red-active" || it.location === "blue-active" || it.location === "green"),
  );

  if (activeItems.length === 0) return its;

  const target = activeItems[Math.floor(Math.random() * activeItems.length)];
  target.blocked = true;
  target.blockerWork = { required: BLOCKER_WORK_REQUIRED, done: 0 };
  onBlock(target.id);

  return its;
}

/** Check if any events should trigger this day */
export function checkEvents(
  items: WipWorkItem[],
  day: number,
  events: GameEvent[],
): { items: WipWorkItem[]; events: GameEvent[]; triggered: GameEvent | null } {
  let its = items.map((it) => ({ ...it }));
  let newEvents = [...events];
  let triggered: GameEvent | null = null;

  for (const config of EVENTS_CONFIG) {
    if (config.triggerDay !== day) continue;
    // Check if this event already exists
    if (newEvents.some((e) => e.id === config.id)) continue;

    // Create the event item
    const itemId = `EVT-${config.id}`;
    const newItem = makeItem(itemId, day, config.type, config.dueDay, config.work);
    its = [...its, newItem];

    const event: GameEvent = {
      id: config.id,
      type: config.type,
      triggerDay: day,
      dueDay: config.dueDay,
      itemId,
      acknowledged: false,
    };
    newEvents = [...newEvents, event];
    triggered = event;
  }

  return { items: its, events: newEvents, triggered };
}

// ─── Snapshots ──────────────────────────────────────────────

/** Take a snapshot of the current board state */
export function takeSnapshot(items: WipWorkItem[], day: number): DaySnapshot {
  const itemsByLocation = {} as Record<WipLocation, number>;
  for (const loc of LOCATIONS_IN_ORDER) {
    itemsByLocation[loc as WipLocation] = items.filter((it) => it.location === loc).length;
  }

  const wipByColor: Record<WorkColor, number> = {
    red: stageWip(items, "red"),
    blue: stageWip(items, "blue"),
    green: stageWip(items, "green"),
  };

  const activeItems = items.filter(
    (it) => it.location !== "backlog" && it.location !== "done" && it.dayStarted !== null,
  );
  const avgAge =
    activeItems.length > 0
      ? activeItems.reduce((sum, it) => sum + (day - it.dayStarted!), 0) / activeItems.length
      : 0;

  return {
    day,
    itemsByLocation,
    wipByColor,
    itemsDone: items.filter((it) => it.location === "done").length,
    totalItems: items.length,
    avgAge: Math.round(avgAge * 10) / 10,
    items: items.map((it) => ({ ...it })),
  };
}

// ─── Manual Pull from Finished ──────────────────────────────

/** Manually pull a finished item to the next active column (respecting WIP limits) */
export function pullFinishedItem(
  items: WipWorkItem[],
  itemId: string,
  settings: WipSettings,
): WipWorkItem[] | null {
  const item = items.find((it) => it.id === itemId);
  if (!item) return null;

  // Only finished columns can be manually pulled
  if (item.location !== "red-finished" && item.location !== "blue-finished") return null;

  const target = STAGE_AFTER[item.location]; // blue-active or green

  // Inline WIP check (same logic as canMoveToLocation)
  if (target !== "done" && target !== "backlog") {
    for (const color of (["red", "blue", "green"] as WorkColor[])) {
      const locs = WIP_LOCATIONS[color];
      if (locs.includes(target)) {
        if (settings.enforceWip[color]) {
          const currentWip = items.filter(
            (it) => it.id !== item.id && locs.includes(it.location),
          ).length;
          if (currentWip >= settings.wipLimits[color]) return null;
        }
        break;
      }
    }
  }

  return items.map((it) =>
    it.id === itemId ? { ...it, location: target } : it,
  );
}

/** Check if a finished item can be pulled to the next column */
export function canPullFinishedItem(
  items: WipWorkItem[],
  itemId: string,
  settings: WipSettings,
): boolean {
  const item = items.find((it) => it.id === itemId);
  if (!item) return false;
  if (item.location !== "red-finished" && item.location !== "blue-finished") return false;

  const target = STAGE_AFTER[item.location];

  if (target !== "done" && target !== "backlog") {
    for (const color of (["red", "blue", "green"] as WorkColor[])) {
      const locs = WIP_LOCATIONS[color];
      if (locs.includes(target)) {
        if (settings.enforceWip[color]) {
          const currentWip = items.filter(
            (it) => it.id !== item.id && locs.includes(it.location),
          ).length;
          if (currentWip >= settings.wipLimits[color]) return false;
        }
        break;
      }
    }
  }

  return true;
}

// ─── Backlog Reorder ────────────────────────────────────────

/** Move a backlog item up or down */
export function reorderBacklog(
  items: WipWorkItem[],
  itemId: string,
  direction: "up" | "down",
): WipWorkItem[] {
  const backlog = items.filter((it) => it.location === "backlog");
  const rest = items.filter((it) => it.location !== "backlog");

  const idx = backlog.findIndex((it) => it.id === itemId);
  if (idx === -1) return items;

  const newIdx = direction === "up" ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= backlog.length) return items;

  const newBacklog = [...backlog];
  [newBacklog[idx], newBacklog[newIdx]] = [newBacklog[newIdx], newBacklog[idx]];

  return [...newBacklog, ...rest];
}

// ─── Done marking ───────────────────────────────────────────

/** Set dayDone on items that just arrived in done column.
 *  Called as part of advanceItems. We also need a pass to fix items
 *  that reached done but didn't get dayDone set. */
export function markDoneItems(items: WipWorkItem[], day: number): WipWorkItem[] {
  return items.map((it) => {
    if (it.location === "done" && it.dayDone === null) {
      return { ...it, dayDone: day };
    }
    return it;
  });
}
