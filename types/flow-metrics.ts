/** === Flow Metrics Lesson Types === */

export interface FlowItem {
  id: string;
  name: string;
  backlog: string | null;
  analysisActive: string | null;
  analysisDone: string | null;
  devActive: string | null;
  devDone: string | null;
  testing: string | null;
  done: string | null;
  team: string;
  type: string;
  blockedDays: number;
  labels: string;
}

export interface FlowSeedData {
  dataEndDate: string;
  items: FlowItem[];
}

/** A single day's throughput */
export interface ThroughputDay {
  date: string;
  count: number;
}

/** Monte Carlo trial result */
export interface MCTrial {
  value: number; // items completed (howMany) or days needed (when)
}

/** Bucketed distribution for chart */
export interface MCBucket {
  bucket: number;
  count: number;
  cumPct: number;
}

/** Calendar cell for heatmap */
export interface CalendarCell {
  date: string;
  probability: number; // 0-100
  dayOfWeek: number;   // 0=Sun, 6=Sat
}

export type MCMode = "howMany" | "when";

export interface MCConfig {
  mode: MCMode;
  startDate: string;
  endDate?: string;     // for howMany
  targetItems?: number; // for when
  trials: number;
  throughputStart: string;
  throughputEnd: string;
}
