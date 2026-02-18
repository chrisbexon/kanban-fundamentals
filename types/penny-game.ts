export type WorkState = "mint" | "press" | "polish" | "inspect";
export type ItemState = WorkState | "backlog" | "done";
export type StageType = "work" | "buffer";

export interface WorkItem {
  id: number;
  state: ItemState;
  /** Work required at each stage */
  wr: Record<WorkState, number>;
  /** Work done at each stage */
  wd: Record<WorkState, number>;
  /** Start tick (entered first work stage) */
  st: number | null;
  /** Done tick (entered done) */
  dt: number | null;
  /** Last event tick */
  et: number;
  /** Currently being worked on this tick */
  working: boolean;
  /** Just completed current stage this tick */
  jc: boolean;
  /** Just moved to a new stage this tick */
  jm: boolean;
}

export interface GameStage {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: StageType;
}

export interface SimulationRun {
  bs: number;
  done: number;
  first: number;
  all: number | null;
  ac: string;
  aw: string;
  bn: string;
}

export interface GameSnapshot {
  bs: number;
  items: WorkItem[];
  ticks: number;
}

export interface QuizQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface RunStats {
  done: number;
  first: number;
  all: number | null;
  ac: string;
  aw: string;
  bn: string;
}

export interface ItemBreakdownData {
  id: number;
  cycleTime: number;
  workTime: number;
  waitTime: number;
}

export interface ThroughputPoint {
  tick: number;
  done: number;
}
