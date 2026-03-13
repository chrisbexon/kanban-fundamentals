/** === Little's Law Drive-Through Simulation Types === */

export type OrderSize = "small" | "medium" | "large";

export type CarStation =
  | "order-queue"
  | "ordering"
  | "wait-pay"
  | "paying"
  | "wait-collect"
  | "collecting"
  | "departed";

export interface Car {
  id: number;
  arrivalTick: number;
  orderSize: OrderSize;
  station: CarStation;
  stationEntryTick: number;
  /** Ticks remaining for current service (ordering / paying / collecting) */
  serviceRemaining: number;
  /** Kitchen: cooking ticks remaining (runs in parallel once order placed) */
  cookingRemaining: number;
  /** Which kitchen worker slot (0-based), null if not cooking */
  kitchenSlot: number | null;
  /** Food status */
  foodReady: boolean;
  departureTick: number | null;
  /** Which order window (0 or 1) when at ordering station */
  orderWindow: number | null;
}

export interface KitchenSlot {
  busy: boolean;
  carId: number | null;
}

export interface SimSettings {
  /** Mean seconds between car arrivals */
  arrivalInterval: number;
  /** Number of order windows (1 or 2) */
  orderServers: number;
  /** Number of kitchen workers (1-4) */
  kitchenWorkers: number;
}

export interface FlowPoint {
  tick: number;
  arrivals: number;
  departures: number;
  wip: number;
}

export interface SimSnapshot {
  tick: number;
  carsInSystem: number;
  avgCycleTime: number;
  throughput: number;
  littlesCheck: number;
  queueLengths: {
    order: number;
    pay: number;
    collect: number;
  };
  totalArrivals: number;
  totalDepartures: number;
}

export interface SimState {
  tick: number;
  cars: Car[];
  kitchenSlots: KitchenSlot[];
  nextCarId: number;
  /** Cumulative counters */
  totalArrivals: number;
  totalDepartures: number;
  /** Sum of cycle times for departed cars (for avg calculation) */
  totalCycleTime: number;
  /** Flow data for chart */
  flowData: FlowPoint[];
  /** Tick accumulator for next arrival */
  arrivalAccum: number;
  /** Is sim running */
  running: boolean;
  /** Speed multiplier */
  speed: number;
  settings: SimSettings;
}

export interface LittlesLawQuizQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}
