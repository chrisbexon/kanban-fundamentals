/** === WIP Limits & Work Item Age Game Types === */

export type WorkColor = "red" | "blue" | "green";

export type WipLocation =
  | "backlog"
  | "red-active"
  | "red-finished"
  | "blue-active"
  | "blue-finished"
  | "green"
  | "done";

export type RoundPhase = "assign" | "resolve" | "between";

export interface WorkBar {
  required: number;
  done: number;
}

export interface WipWorkItem {
  id: string;
  location: WipLocation;
  work: Record<WorkColor, WorkBar>;
  blocked: boolean;
  blockerWork: WorkBar;
  dayCreated: number;
  dayStarted: number | null;
  dayDone: number | null;
  assignedWorkerIds: string[];
  /** Class of service: "standard" | "expedite" | "compliance" | "security" */
  class: string;
  /** Due date for special items (compliance/security events) */
  dueDay: number | null;
}

export interface Worker {
  id: string;
  color: WorkColor;
  name: string;
  assignedItemId: string | null;
}

export interface WipSettings {
  wipLimits: Record<WorkColor, number>;
  enforceWip: Record<WorkColor, boolean>;
}

export interface GameEvent {
  id: string;
  type: "compliance" | "security";
  triggerDay: number;
  dueDay: number;
  itemId: string | null;
  acknowledged: boolean;
}

export interface WorkerRollResult {
  workerId: string;
  itemId: string;
  roll: number;
  crossTrained: boolean;
}

export interface RoundResult {
  day: number;
  workerRolls: WorkerRollResult[];
  itemsAdvanced: string[];
  itemsPulled: string[];
  blockerApplied: string | null;
  blockerCleared: string[];
  eventTriggered: GameEvent | null;
  throughput: number;
}

export interface DaySnapshot {
  day: number;
  itemsByLocation: Record<WipLocation, number>;
  wipByColor: Record<WorkColor, number>;
  itemsDone: number;
  totalItems: number;
  avgAge: number;
  items?: WipWorkItem[];
}

/** Chart data types */

export interface CfdDataPoint {
  day: number;
  backlog: number;
  redActive: number;
  redFinished: number;
  blueActive: number;
  blueFinished: number;
  green: number;
  done: number;
}

export interface CycleTimePoint {
  itemId: string;
  cycleTime: number;
  dayDone: number;
}

export interface CycleTimeBucket {
  bucket: number;
  count: number;
}

export interface ThroughputDay {
  day: number;
  count: number;
  rollingAvg: number | null;
}

export interface AgingWipItem {
  itemId: string;
  location: WipLocation;
  age: number;
  percentComplete: number;
}

export interface FlowEfficiencyItem {
  itemId: string;
  workTime: number;
  waitTime: number;
  efficiency: number;
}

export interface HeatMapCell {
  location: WipLocation;
  day: number;
  count: number;
}

export interface WipRunPoint {
  day: number;
  wip: number;
  limit: number | null;
}

export interface MonteCarloResult {
  bucket: number;
  count: number;
  cumPct: number;
}

export interface DashboardMetrics {
  avgCycleTime: number;
  p85CycleTime: number;
  avgThroughput: number;
  currentWip: number;
  sleMetPct: number;
  avgAge: number;
}

export interface WipQuizQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}
