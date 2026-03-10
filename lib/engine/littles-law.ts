import type {
  Car, SimState, SimSettings, KitchenSlot, FlowPoint, OrderSize, CarStation,
} from "@/types/littles-law";
import {
  TICKS_PER_SECOND, ORDER_SIZE_WEIGHTS, ORDER_TIME, PAYMENT_TIME,
  PAYMENT_FAIL_CHANCE, PAYMENT_RETRY_EXTRA, KITCHEN_TIME,
  KITCHEN_SKILL_RANGE, COLLECTION_TIME, FLOW_SAMPLE_INTERVAL,
} from "@/lib/constants/littles-law";

// ─── Helpers ────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function rndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toTicks(seconds: number): number {
  return Math.round(seconds * TICKS_PER_SECOND);
}

function pickOrderSize(): OrderSize {
  const r = Math.random();
  let cum = 0;
  for (const { size, weight } of ORDER_SIZE_WEIGHTS) {
    cum += weight;
    if (r <= cum) return size;
  }
  return "medium";
}

// ─── State Creation ─────────────────────────────────────────

export function createSimState(settings: SimSettings): SimState {
  return {
    tick: 0,
    cars: [],
    kitchenSlots: makeKitchenSlots(settings.kitchenWorkers),
    nextCarId: 1,
    totalArrivals: 0,
    totalDepartures: 0,
    totalBalked: 0,
    totalCycleTime: 0,
    flowData: [{ tick: 0, arrivals: 0, departures: 0, wip: 0 }],
    arrivalAccum: 0,
    running: false,
    speed: 5,
    settings: { ...settings },
  };
}

function makeKitchenSlots(count: number): KitchenSlot[] {
  return Array.from({ length: count }, () => ({ busy: false, carId: null }));
}

// ─── Main Tick ──────────────────────────────────────────────

/** Advance simulation by one tick. Pure function. */
export function advanceTick(state: SimState): SimState {
  let s = { ...state, cars: state.cars.map((c) => ({ ...c })), kitchenSlots: state.kitchenSlots.map((k) => ({ ...k })) };

  // 1. Maybe spawn a new car
  s = maybeSpawnCar(s);

  // 2. Decrement service timers
  s = processServiceTimers(s);

  // 3. Process kitchen (parallel — cooking happens for all cars whose order is placed)
  s = processKitchen(s);

  // 4. Pull-based advancement (back-to-front)
  s = pullCarsForward(s);

  // 5. Record flow data
  s = recordFlow(s);

  s.tick += 1;
  return s;
}

// ─── Car Spawning ───────────────────────────────────────────

function maybeSpawnCar(state: SimState): SimState {
  const s = { ...state };
  const intervalTicks = toTicks(s.settings.arrivalInterval);
  s.arrivalAccum += 1 + (Math.random() - 0.5) * 0.5;

  if (s.arrivalAccum >= intervalTicks) {
    s.arrivalAccum -= intervalTicks;

    // Check balking
    const orderQueueLen = s.cars.filter((c) => c.station === "order-queue").length;
    if (orderQueueLen >= s.settings.balkThreshold) {
      s.totalBalked += 1;
      return s;
    }

    const car: Car = {
      id: s.nextCarId,
      arrivalTick: s.tick,
      orderSize: pickOrderSize(),
      station: "order-queue",
      stationEntryTick: s.tick,
      serviceRemaining: 0,
      cookingRemaining: 0,
      kitchenSlot: null,
      foodReady: false,
      departureTick: null,
      orderWindow: null,
    };

    s.cars = [...s.cars, car];
    s.nextCarId += 1;
    s.totalArrivals += 1;
  }

  return s;
}

// ─── Service Timer Decrements ───────────────────────────────

function processServiceTimers(state: SimState): SimState {
  const s = { ...state };
  for (const car of s.cars) {
    if (car.serviceRemaining > 0 && (car.station === "ordering" || car.station === "paying")) {
      car.serviceRemaining -= 1;
    }
    // Collecting: handover timer starts when food arrives at window
    if (car.station === "collecting") {
      if (car.foodReady && car.serviceRemaining === 0) {
        // Food just became ready — start handover timer
        car.serviceRemaining = toTicks(rndInt(COLLECTION_TIME.min, COLLECTION_TIME.max));
      } else if (car.serviceRemaining > 0) {
        car.serviceRemaining -= 1;
      }
      // else: still waiting for food (serviceRemaining stays 0)
    }
  }
  return s;
}

// ─── Kitchen (parallel, independent of lane position) ───────

function processKitchen(state: SimState): SimState {
  const s = { ...state };

  // Decrement cooking for all cars being cooked
  for (const car of s.cars) {
    if (car.kitchenSlot !== null && car.cookingRemaining > 0) {
      car.cookingRemaining -= 1;
      if (car.cookingRemaining <= 0) {
        car.foodReady = true;
        if (car.kitchenSlot < s.kitchenSlots.length) {
          s.kitchenSlots[car.kitchenSlot] = { busy: false, carId: null };
        }
        car.kitchenSlot = null;
      }
    }
  }

  // Assign free kitchen slots to cars that have finished ordering
  const waitingForKitchen = s.cars
    .filter((c) => !c.foodReady && c.kitchenSlot === null && c.station !== "order-queue" && c.station !== "ordering")
    .sort((a, b) => a.stationEntryTick - b.stationEntryTick);

  for (const car of waitingForKitchen) {
    const freeSlot = s.kitchenSlots.findIndex((k) => !k.busy);
    if (freeSlot === -1) break;

    const baseTime = KITCHEN_TIME[car.orderSize];
    const skillMult = rnd(KITCHEN_SKILL_RANGE.min, KITCHEN_SKILL_RANGE.max);
    car.cookingRemaining = toTicks(rnd(baseTime.min, baseTime.max) * skillMult);
    car.kitchenSlot = freeSlot;
    s.kitchenSlots[freeSlot] = { busy: true, carId: car.id };
  }

  return s;
}

// ─── Pull-Based Car Advancement ─────────────────────────────
//
// Station pipeline (single lane, cars cannot pass each other):
//   order-queue → ordering → wait-pay → paying → wait-collect → collecting → departed
//
// WIP limits:
//   ordering:      orderServers (1 or 2)
//   wait-pay:      1
//   paying:        1
//   wait-collect:  1
//   collecting:    1
//
// Pull runs back-to-front: downstream frees up first, then pulls from upstream.

function pullCarsForward(state: SimState): SimState {
  const s = { ...state };

  const countAt = (station: CarStation) => s.cars.filter((c) => c.station === station).length;

  // ── 1. Collecting → departed ──
  // Departs when: food is ready, handover timer was set (>0 at some point) and reached 0.
  // We know handover was completed when serviceRemaining === -1 (set below after decrement).
  // Simpler: food ready + been here long enough for at least one handover cycle.
  for (const car of s.cars) {
    if (car.station === "collecting" && car.foodReady) {
      const timeHere = s.tick - car.stationEntryTick;
      // Must have been here at least COLLECTION_TIME.min to ensure handover happened
      if (timeHere > toTicks(COLLECTION_TIME.min) && car.serviceRemaining <= 0) {
        car.station = "departed";
        car.departureTick = s.tick;
        s.totalDepartures += 1;
        s.totalCycleTime += (s.tick - car.arrivalTick);
      }
    }
  }

  // ── 2. Wait-collect → collecting (WIP=1) ──
  // Car moves to window regardless of food status — they wait AT the window
  if (countAt("collecting") === 0) {
    const waiting = s.cars
      .filter((c) => c.station === "wait-collect")
      .sort((a, b) => a.stationEntryTick - b.stationEntryTick);
    if (waiting.length > 0) {
      const car = waiting[0];
      car.station = "collecting";
      car.stationEntryTick = s.tick;
      // Handover timer only starts once food is ready (set in processCollection)
      car.serviceRemaining = 0;
    }
  }

  // ── 3. Paying done → wait-collect or skip to collecting ──
  // Can ONLY skip if BOTH wait-collect AND collecting are empty (no overtaking)
  {
    const done = s.cars
      .filter((c) => c.station === "paying" && c.serviceRemaining <= 0)
      .sort((a, b) => a.stationEntryTick - b.stationEntryTick);
    if (done.length > 0) {
      const car = done[0];
      if (countAt("wait-collect") === 0 && countAt("collecting") === 0) {
        // Nothing ahead — skip straight to collecting
        car.station = "collecting";
        car.stationEntryTick = s.tick;
        car.serviceRemaining = 0;
      } else if (countAt("wait-collect") === 0) {
        // Collecting occupied, wait behind
        car.station = "wait-collect";
        car.stationEntryTick = s.tick;
        car.serviceRemaining = 0;
      }
      // else: wait-collect occupied — stay at paying (blocked)
    }
  }

  // ── 4. Wait-pay → paying (WIP=1) ──
  if (countAt("paying") === 0) {
    const waiting = s.cars
      .filter((c) => c.station === "wait-pay")
      .sort((a, b) => a.stationEntryTick - b.stationEntryTick);
    if (waiting.length > 0) {
      const car = waiting[0];
      car.station = "paying";
      car.stationEntryTick = s.tick;

      let payTime = rndInt(PAYMENT_TIME.min, PAYMENT_TIME.max);
      if (Math.random() < PAYMENT_FAIL_CHANCE) {
        payTime += PAYMENT_RETRY_EXTRA;
      }
      car.serviceRemaining = toTicks(payTime);
    }
  }

  // ── 5. Ordering done → wait-pay or skip to paying ──
  // Can ONLY skip if BOTH wait-pay AND paying are empty (no overtaking)
  {
    const done = s.cars
      .filter((c) => c.station === "ordering" && c.serviceRemaining <= 0)
      .sort((a, b) => a.stationEntryTick - b.stationEntryTick);
    if (done.length > 0) {
      const car = done[0];
      if (countAt("wait-pay") === 0 && countAt("paying") === 0) {
        // Nothing ahead — skip straight to paying
        car.station = "paying";
        car.stationEntryTick = s.tick;
        car.orderWindow = null;
        let payTime = rndInt(PAYMENT_TIME.min, PAYMENT_TIME.max);
        if (Math.random() < PAYMENT_FAIL_CHANCE) {
          payTime += PAYMENT_RETRY_EXTRA;
        }
        car.serviceRemaining = toTicks(payTime);
      } else if (countAt("wait-pay") === 0) {
        // Paying occupied, wait behind
        car.station = "wait-pay";
        car.stationEntryTick = s.tick;
        car.orderWindow = null;
      }
      // else: wait-pay occupied — stay at ordering (blocked)
    }
  }

  // ── 6. Order-queue → ordering (WIP = orderServers) ──
  const orderingCars = s.cars.filter((c) => c.station === "ordering");
  const availableSlots = s.settings.orderServers - orderingCars.length;
  if (availableSlots > 0) {
    // Figure out which windows are free
    const usedWindows = new Set(orderingCars.map((c) => c.orderWindow));
    const freeWindows: number[] = [];
    for (let w = 0; w < s.settings.orderServers; w++) {
      if (!usedWindows.has(w)) freeWindows.push(w);
    }

    const waiting = s.cars
      .filter((c) => c.station === "order-queue")
      .sort((a, b) => a.arrivalTick - b.arrivalTick);

    for (let i = 0; i < Math.min(freeWindows.length, waiting.length); i++) {
      const car = waiting[i];
      const time = ORDER_TIME[car.orderSize];
      car.station = "ordering";
      car.stationEntryTick = s.tick;
      car.serviceRemaining = toTicks(rndInt(time.min, time.max));
      car.orderWindow = freeWindows[i];
    }
  }

  return s;
}

// ─── Flow Recording ─────────────────────────────────────────

function recordFlow(state: SimState): SimState {
  if (state.tick % FLOW_SAMPLE_INTERVAL !== 0) return state;

  const wip = state.cars.filter((c) => c.station !== "departed" && c.station !== "balked").length;

  const point: FlowPoint = {
    tick: state.tick,
    arrivals: state.totalArrivals,
    departures: state.totalDepartures,
    wip,
  };

  return { ...state, flowData: [...state.flowData, point] };
}

// ─── Metrics ────────────────────────────────────────────────

/** Compute current snapshot metrics */
export function getSnapshot(state: SimState): {
  carsInSystem: number;
  avgCycleTime: number;
  throughputPerMin: number;
  littlesLaw: { wip: number; throughput: number; cycleTime: number };
  queueLengths: { order: number; waitPay: number; waitCollect: number; kitchen: number };
  totalArrivals: number;
  totalDepartures: number;
  totalBalked: number;
  simTimeMinutes: number;
} {
  const activeCars = state.cars.filter((c) => c.station !== "departed" && c.station !== "balked");
  const carsInSystem = activeCars.length;

  const simSeconds = state.tick / TICKS_PER_SECOND;
  const simMinutes = simSeconds / 60;

  const avgCycleTime = state.totalDepartures > 0
    ? (state.totalCycleTime / state.totalDepartures) / TICKS_PER_SECOND
    : 0;

  const throughputPerMin = simMinutes > 0 ? state.totalDepartures / simMinutes : 0;
  const throughputPerSec = simSeconds > 0 ? state.totalDepartures / simSeconds : 0;

  const avgWip = state.flowData.length > 1
    ? state.flowData.reduce((s, p) => s + p.wip, 0) / state.flowData.length
    : carsInSystem;

  return {
    carsInSystem,
    avgCycleTime: Math.round(avgCycleTime * 10) / 10,
    throughputPerMin: Math.round(throughputPerMin * 100) / 100,
    littlesLaw: {
      wip: Math.round(avgWip * 10) / 10,
      throughput: Math.round(throughputPerSec * 1000) / 1000,
      cycleTime: Math.round(avgCycleTime * 10) / 10,
    },
    queueLengths: {
      order: state.cars.filter((c) => c.station === "order-queue").length,
      waitPay: state.cars.filter((c) => c.station === "wait-pay").length,
      waitCollect: state.cars.filter((c) => c.station === "wait-collect").length,
      kitchen: state.cars.filter((c) => c.kitchenSlot !== null).length,
    },
    totalArrivals: state.totalArrivals,
    totalDepartures: state.totalDepartures,
    totalBalked: state.totalBalked,
    simTimeMinutes: Math.round(simMinutes * 10) / 10,
  };
}

/** Update settings on a running sim (e.g., change kitchen workers) */
export function updateSimSettings(state: SimState, newSettings: Partial<SimSettings>): SimState {
  const s = { ...state, settings: { ...state.settings, ...newSettings } };

  // If kitchen workers changed, resize slots
  if (newSettings.kitchenWorkers !== undefined) {
    const target = newSettings.kitchenWorkers;
    const current = s.kitchenSlots.length;

    if (target > current) {
      s.kitchenSlots = [
        ...s.kitchenSlots,
        ...Array.from({ length: target - current }, () => ({ busy: false, carId: null })),
      ];
    } else if (target < current) {
      const newSlots = [...s.kitchenSlots];
      while (newSlots.length > target) {
        const last = newSlots[newSlots.length - 1];
        if (!last.busy) {
          newSlots.pop();
        } else {
          break;
        }
      }
      s.kitchenSlots = newSlots;
    }
  }

  return s;
}
