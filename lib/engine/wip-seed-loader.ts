import type { WipWorkItem, DaySnapshot, WipLocation, WorkColor } from "@/types/wip-game";
import { LOCATIONS_IN_ORDER } from "@/lib/constants/wip-game";
import seedData from "@/data/wip-game-seed.json";

export interface SeedData {
  seedDay: number;
  nextItemId: number;
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
}

const ACTIVE_LOCATIONS = new Set(["red-active", "blue-active", "green"]);

/** Deep-copy a work item so the original seed JSON is never mutated */
function cloneSeedItem(it: WipWorkItem): WipWorkItem {
  return {
    ...it,
    work: {
      red: { ...it.work.red },
      blue: { ...it.work.blue },
      green: { ...it.work.green },
    },
    blockerWork: { ...it.blockerWork },
    assignedWorkerIds: [...it.assignedWorkerIds],
  };
}

/** Load and parse the seed JSON — returns a fresh deep copy every call */
export function loadSeed(): SeedData {
  const raw = seedData as unknown as SeedData;
  validateSeed(raw);

  // Deep-copy items so the imported module is never mutated
  const items = raw.items.map(cloneSeedItem);

  // Sanitize: clear blocked state on items not in active columns
  for (const item of items) {
    if (item.blocked && !ACTIVE_LOCATIONS.has(item.location)) {
      item.blocked = false;
      item.blockerWork = { required: 0, done: 0 };
    }
  }

  // Deep-copy snapshots and ensure round field
  const snapshots = raw.snapshots.map((snap) => ({
    ...snap,
    round: snap.round ?? 1,
  }));

  return {
    seedDay: raw.seedDay,
    nextItemId: raw.nextItemId,
    items,
    snapshots: snapshots as DaySnapshot[],
  };
}

/** Validate seed data structure */
export function validateSeed(data: SeedData): void {
  if (typeof data.seedDay !== "number" || data.seedDay < 1) {
    throw new Error("Invalid seedDay");
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Seed must contain items");
  }
  if (!Array.isArray(data.snapshots) || data.snapshots.length === 0) {
    throw new Error("Seed must contain snapshots");
  }

  const validLocations = new Set<string>(LOCATIONS_IN_ORDER);
  const validColors: WorkColor[] = ["red", "blue", "green"];

  for (const item of data.items) {
    if (!item.id || typeof item.id !== "string") {
      throw new Error(`Invalid item id: ${item.id}`);
    }
    if (!validLocations.has(item.location)) {
      throw new Error(`Invalid location "${item.location}" for item ${item.id}`);
    }
    for (const c of validColors) {
      if (!item.work[c] || typeof item.work[c].required !== "number" || typeof item.work[c].done !== "number") {
        throw new Error(`Invalid work bar for ${c} on item ${item.id}`);
      }
      if (item.work[c].done > item.work[c].required) {
        throw new Error(`Work done exceeds required for ${c} on item ${item.id}`);
      }
    }
  }

  for (const snap of data.snapshots) {
    if (typeof snap.day !== "number") {
      throw new Error("Invalid snapshot day");
    }
    for (const loc of LOCATIONS_IN_ORDER) {
      if (typeof snap.itemsByLocation[loc as WipLocation] !== "number") {
        throw new Error(`Missing location count for ${loc} in snapshot day ${snap.day}`);
      }
    }
  }
}
