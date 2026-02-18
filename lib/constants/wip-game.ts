import type { WipLocation, WorkColor, WipSettings, Worker } from "@/types/wip-game";

/** Ordered locations items flow through */
export const LOCATIONS_IN_ORDER: WipLocation[] = [
  "backlog",
  "red-active",
  "red-finished",
  "blue-active",
  "blue-finished",
  "green",
  "done",
];

/** What location comes after each */
export const STAGE_AFTER: Record<Exclude<WipLocation, "done">, WipLocation> = {
  "backlog": "red-active",
  "red-active": "red-finished",
  "red-finished": "blue-active",
  "blue-active": "blue-finished",
  "blue-finished": "green",
  "green": "done",
};

/** Which color does work at each active location */
export const LOCATION_WORK_COLOR: Partial<Record<WipLocation, WorkColor>> = {
  "red-active": "red",
  "blue-active": "blue",
  "green": "green",
};

/** Which locations count toward each color's WIP */
export const WIP_LOCATIONS: Record<WorkColor, WipLocation[]> = {
  red: ["red-active", "red-finished"],
  blue: ["blue-active", "blue-finished"],
  green: ["green"],
};

/** Stage display config */
export interface ColumnDef {
  location: WipLocation;
  label: string;
  shortLabel: string;
  color: string;
  wipColor: WorkColor | null;
  isActive: boolean;
}

export const COLUMN_DEFS: ColumnDef[] = [
  { location: "backlog", label: "Backlog", shortLabel: "BL", color: "#64748b", wipColor: null, isActive: false },
  { location: "red-active", label: "Red Active", shortLabel: "RA", color: "#ef4444", wipColor: "red", isActive: true },
  { location: "red-finished", label: "Red Finished", shortLabel: "RF", color: "#f87171", wipColor: "red", isActive: false },
  { location: "blue-active", label: "Blue Active", shortLabel: "BA", color: "#3b82f6", wipColor: "blue", isActive: true },
  { location: "blue-finished", label: "Blue Finished", shortLabel: "BF", color: "#60a5fa", wipColor: "blue", isActive: false },
  { location: "green", label: "Green", shortLabel: "G", color: "#22c55e", wipColor: "green", isActive: true },
  { location: "done", label: "Done", shortLabel: "DN", color: "#a3e635", wipColor: null, isActive: false },
];

export const STAGE_COLORS: Record<WorkColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
};

export const DEFAULT_SETTINGS: WipSettings = {
  wipLimits: { red: 4, blue: 4, green: 3 },
  enforceWip: { red: true, blue: true, green: true },
};

export const INITIAL_WORKERS: Worker[] = [
  { id: "r1", color: "red", name: "Red 1", assignedItemId: null },
  { id: "r2", color: "red", name: "Red 2", assignedItemId: null },
  { id: "b1", color: "blue", name: "Blue 1", assignedItemId: null },
  { id: "b2", color: "blue", name: "Blue 2", assignedItemId: null },
  { id: "g1", color: "green", name: "Green 1", assignedItemId: null },
  { id: "g2", color: "green", name: "Green 2", assignedItemId: null },
];

/** Workers roll 1-6 on own-color stages, 1-3 on cross-trained */
export const OWN_STAGE_DICE = { min: 1, max: 6 };
export const CROSS_TRAINED_DICE = { min: 1, max: 3 };

/** Work required range per color bar */
export const WORK_REQUIRED_RANGE = { min: 3, max: 12 };

/** Blocker config */
export const BLOCK_CHANCE = 0.15;
export const BLOCKER_WORK_REQUIRED = 5;

/** Game timing */
export const SEED_DAYS = 45;
export const PLAYABLE_ROUNDS = 15;
export const TOTAL_GAME_DAYS = 60;

/** SLE (Service Level Expectation) - 85th percentile target */
export const SLE_DAYS = 12;

/** Events config */
export const EVENTS_CONFIG = [
  {
    id: "compliance-1",
    type: "compliance" as const,
    triggerDay: 48,
    dueDay: 55,
    label: "Compliance Audit",
    description: "A compliance audit item has been added. Must reach Done by day 55.",
    work: { red: 4, blue: 6, green: 3 },
  },
  {
    id: "security-1",
    type: "security" as const,
    triggerDay: 50,
    dueDay: 58,
    label: "Security Patch",
    description: "A critical security patch has arrived. Must reach Done by day 58.",
    work: { red: 3, blue: 4, green: 5 },
  },
];

/** Backlog arrival rate: items per day during player rounds */
export const ARRIVAL_RATE = { min: 0, max: 2 };

export function getColumnDef(loc: WipLocation): ColumnDef {
  return COLUMN_DEFS.find((c) => c.location === loc)!;
}
