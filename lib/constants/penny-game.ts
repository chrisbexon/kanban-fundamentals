import type { GameStage, WorkState } from "@/types/penny-game";

export const TOTAL_ITEMS = 20;

export const WORK_STATES: WorkState[] = ["mint", "press", "polish", "inspect"];

export const STATE_AFTER: Record<WorkState, WorkState | "done"> = {
  mint: "press",
  press: "polish",
  polish: "inspect",
  inspect: "done",
};

export const STAGES: GameStage[] = [
  { id: "backlog", label: "Backlog", icon: "\u{1F4E5}", color: "#64748b", type: "buffer" },
  { id: "mint", label: "Mint", icon: "\u{1F528}", color: "#f59e0b", type: "work" },
  { id: "press", label: "Press", icon: "\u{2699}\uFE0F", color: "#3b82f6", type: "work" },
  { id: "polish", label: "Polish", icon: "\u2728", color: "#10b981", type: "work" },
  { id: "inspect", label: "Inspect", icon: "\u{1F50D}", color: "#8b5cf6", type: "work" },
  { id: "done", label: "Done", icon: "\u2705", color: "#22c55e", type: "buffer" },
];

export const BATCH_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#10b981",
  3: "#14b8a6",
  4: "#06b6d4",
  5: "#3b82f6",
  10: "#8b5cf6",
  15: "#a855f7",
  20: "#f59e0b",
};

export function getBatchColor(bs: number): string {
  return BATCH_COLORS[bs] || "#64748b";
}
