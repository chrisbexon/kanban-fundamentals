import type { SimSettings, OrderSize } from "@/types/littles-law";

/** Ticks per sim-second (10 ticks = 1 second sim time) */
export const TICKS_PER_SECOND = 10;

/** Default simulation settings */
export const DEFAULT_SIM_SETTINGS: SimSettings = {
  arrivalInterval: 10,   // 1 car every 10 seconds on average — deliberately high to challenge students
  orderServers: 1,
  kitchenWorkers: 2,
};

/** Order size probabilities */
export const ORDER_SIZE_WEIGHTS: { size: OrderSize; weight: number }[] = [
  { size: "small", weight: 0.3 },
  { size: "medium", weight: 0.5 },
  { size: "large", weight: 0.2 },
];

/** Service times in sim-seconds (converted to ticks internally) */
export const ORDER_TIME: Record<OrderSize, { min: number; max: number }> = {
  small:  { min: 10, max: 20 },
  medium: { min: 15, max: 30 },
  large:  { min: 25, max: 45 },
};

export const PAYMENT_TIME = { min: 8, max: 15 };
export const PAYMENT_FAIL_CHANCE = 0.1;  // 10% chance of retry
export const PAYMENT_RETRY_EXTRA = 15;    // extra seconds on failure

/** Kitchen cooking time per order size (before worker count adjustment) */
export const KITCHEN_TIME: Record<OrderSize, { min: number; max: number }> = {
  small:  { min: 12, max: 25 },
  medium: { min: 20, max: 40 },
  large:  { min: 30, max: 55 },
};

/** Kitchen skill variance: multiplier range applied to cooking time */
export const KITCHEN_SKILL_RANGE = { min: 0.8, max: 1.3 };

/** Collection time (handing food through window) */
export const COLLECTION_TIME = { min: 3, max: 6 };

/** Flow data sample interval (ticks) — record a point every N ticks */
export const FLOW_SAMPLE_INTERVAL = TICKS_PER_SECOND * 5; // every 5 sim-seconds

/** Sim speed options */
export const SPEED_OPTIONS = [5, 10, 25, 50];

/** Visual: station positions as percentage along the lane (left to right) */
export const STATION_POSITIONS: Record<string, number> = {
  "order-queue": 10,
  "ordering": 26,
  "wait-pay": 40,
  "paying": 52,
  "wait-collect": 62,
  "collecting": 72,
  "departed": 97,
};

/** Car colours by order size */
export const CAR_COLORS: Record<OrderSize, string> = {
  small: "#3b82f6",
  medium: "#8b5cf6",
  large: "#ef4444",
};
