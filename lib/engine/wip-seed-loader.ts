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

/** Load and parse the seed JSON */
export function loadSeed(): SeedData {
  const data = seedData as SeedData;
  validateSeed(data);

  // Sanitize: clear blocked state on items not in active columns
  for (const item of data.items) {
    if (item.blocked && !ACTIVE_LOCATIONS.has(item.location)) {
      item.blocked = false;
      item.blockerWork = { required: 0, done: 0 };
    }
  }

  return data;
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
