"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WipWorkItem, Worker, WipSettings, DaySnapshot,
  RoundResult, GameEvent, RoundPhase, WorkColor,
} from "@/types/wip-game";
import type { GameSaveState } from "./use-game-persistence";
import { DEFAULT_SETTINGS, SEED_DAYS, PLAYABLE_ROUNDS, TOTAL_GAME_DAYS } from "@/lib/constants/wip-game";
import { loadSeed } from "@/lib/engine/wip-seed-loader";
import {
  makeWorkers, assignWorker, unassignWorker, resolveRound,
  takeSnapshot, reorderBacklog, stageWip, canAssign, markDoneItems,
  pullFinishedItem, pullBacklogItem,
} from "@/lib/engine/wip-game";

/** Completed round data preserved for debrief comparison */
export interface RoundHistory {
  round: number;
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
  settings: WipSettings;
}

/** Deep-copy a work item so nested work bars aren't shared references */
function cloneItem(it: WipWorkItem): WipWorkItem {
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

export function useWipGame() {
  const seed = useMemo(() => loadSeed(), []);

  const [items, setItems] = useState<WipWorkItem[]>(() => seed.items.map(cloneItem));
  const [workers, setWorkers] = useState<Worker[]>(() => makeWorkers());
  const [day, setDay] = useState(SEED_DAYS);
  const [phase, setPhase] = useState<RoundPhase>("assign");
  const [settings, setSettings] = useState<WipSettings>(() => ({
    wipLimits: { ...DEFAULT_SETTINGS.wipLimits },
    enforceWip: { ...DEFAULT_SETTINGS.enforceWip },
    sleDays: DEFAULT_SETTINGS.sleDays,
  }));
  const [snapshots, setSnapshots] = useState<DaySnapshot[]>(() => [...seed.snapshots]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // ─── Multi-round state ────────────────────────────────────
  const [gameRound, setGameRound] = useState(1); // 1, 2, or 3
  const [roundHistories, setRoundHistories] = useState<RoundHistory[]>([]);

  const currentDay = day;
  const roundNumber = day - SEED_DAYS;
  const isLastRound = day >= TOTAL_GAME_DAYS;

  // Derived state
  const wipCounts = useMemo(() => ({
    red: stageWip(items, "red"),
    blue: stageWip(items, "blue"),
    green: stageWip(items, "green"),
  }), [items]);

  const doneCount = useMemo(() =>
    items.filter((it) => it.location === "done").length,
  [items]);

  const backlogItems = useMemo(() =>
    items.filter((it) => it.location === "backlog"),
  [items]);

  const activeItems = useMemo(() =>
    items.filter((it) => it.location !== "backlog" && it.location !== "done"),
  [items]);

  const assignedWorkerCount = useMemo(() =>
    workers.filter((w) => w.assignedItemId !== null).length,
  [workers]);

  // Total work item age (for round 3 display)
  const totalAge = useMemo(() => {
    const active = items.filter(
      (it) => it.location !== "backlog" && it.location !== "done" && it.dayStarted !== null,
    );
    return active.reduce((sum, it) => sum + (day - it.dayStarted!), 0);
  }, [items, day]);

  // All snapshots across all rounds (for debrief)
  const allSnapshots = useMemo(() => {
    const past = roundHistories.flatMap((rh) => rh.snapshots);
    return [...past, ...snapshots];
  }, [roundHistories, snapshots]);

  // All completed items across all rounds (for debrief)
  const allItems = useMemo(() => {
    const past = roundHistories.flatMap((rh) => rh.items);
    return [...past, ...items];
  }, [roundHistories, items]);

  // Actions

  const handleSelectWorker = useCallback((workerId: string) => {
    if (phase !== "assign") return;
    setSelectedWorkerId((prev) => (prev === workerId ? null : workerId));
  }, [phase]);

  const handleClickItem = useCallback((itemId: string) => {
    if (phase !== "assign" || !selectedWorkerId) return;
    const worker = workers.find((w) => w.id === selectedWorkerId);
    const item = items.find((it) => it.id === itemId);
    if (!worker || !item) return;
    if (!canAssign(items, item, worker, settings)) return;

    const result = assignWorker(items, workers, selectedWorkerId, itemId, settings);
    setItems(result.items);
    setWorkers(result.workers);
    setSelectedWorkerId(null);
  }, [phase, selectedWorkerId, items, workers, settings]);

  const handleUnassignWorker = useCallback((workerId: string) => {
    if (phase !== "assign") return;
    const result = unassignWorker(items, workers, workerId);
    setItems(result.items);
    setWorkers(result.workers);
  }, [phase, items, workers]);

  /** Direct assign: drop a worker onto an item (bypasses select step) */
  const handleAssignWorkerToItem = useCallback((workerId: string, itemId: string) => {
    if (phase !== "assign") return;
    const worker = workers.find((w) => w.id === workerId);
    const item = items.find((it) => it.id === itemId);
    if (!worker || !item) return;
    // Unassign first if worker is already assigned elsewhere
    let currentItems = items;
    let currentWorkers = workers;
    if (worker.assignedItemId !== null) {
      const unResult = unassignWorker(currentItems, currentWorkers, workerId);
      currentItems = unResult.items;
      currentWorkers = unResult.workers;
    }
    if (!canAssign(currentItems, item, worker, settings)) return;
    const result = assignWorker(currentItems, currentWorkers, workerId, itemId, settings);
    setItems(result.items);
    setWorkers(result.workers);
    setSelectedWorkerId(null);
  }, [phase, items, workers, settings]);

  const handleResolveRound = useCallback(() => {
    if (phase !== "assign") return;
    const nextDay = day + 1;

    const result = resolveRound(items, workers, nextDay, settings, events);
    const finalItems = markDoneItems(result.items, nextDay);
    const snap = takeSnapshot(finalItems, nextDay, gameRound);

    setItems(finalItems);
    setWorkers(result.workers);
    setDay(nextDay);
    setEvents(result.events);
    setLastResult(result.result);
    setRoundResults((prev) => [...prev, result.result]);
    setSnapshots((prev) => [...prev, snap]);
    setPhase("assign");
    setSelectedWorkerId(null);

    if (nextDay >= TOTAL_GAME_DAYS) {
      setGameOver(true);
    }
  }, [phase, day, items, workers, settings, events, gameRound]);

  const handleUpdateSettings = useCallback((newSettings: Partial<WipSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      wipLimits: { ...prev.wipLimits, ...newSettings.wipLimits },
      enforceWip: { ...prev.enforceWip, ...newSettings.enforceWip },
      sleDays: newSettings.sleDays ?? prev.sleDays,
    }));
  }, []);

  const handlePullItem = useCallback((itemId: string) => {
    if (phase !== "assign" || gameOver) return;
    const item = items.find((it) => it.id === itemId);
    if (!item) return;

    if (item.location === "backlog") {
      const result = pullBacklogItem(items, itemId, settings, day);
      if (result) setItems(result);
    } else {
      const result = pullFinishedItem(items, itemId, settings);
      if (result) setItems(result);
    }
  }, [phase, gameOver, items, settings, day]);

  const handleReorderBacklog = useCallback((itemId: string, direction: "up" | "down") => {
    if (phase !== "assign") return;
    setItems((prev) => reorderBacklog(prev, itemId, direction));
  }, [phase]);

  /** Restart within current round */
  const handleRestart = useCallback(() => {
    setItems(seed.items.map(cloneItem));
    setWorkers(makeWorkers());
    setDay(SEED_DAYS);
    setPhase("assign");
    setSnapshots([...seed.snapshots]);
    setRoundResults([]);
    setEvents([]);
    setLastResult(null);
    setSelectedWorkerId(null);
    setGameOver(false);
  }, [seed]);

  /** Save current round and start the next one */
  const handleStartNextRound = useCallback(() => {
    // Save current round history
    const history: RoundHistory = {
      round: gameRound,
      items: items.map(cloneItem),
      snapshots: snapshots.map((s) => ({ ...s })),
      settings: { ...settings, wipLimits: { ...settings.wipLimits }, enforceWip: { ...settings.enforceWip } },
    };
    setRoundHistories((prev) => [...prev, history]);

    // Reset board for next round
    const nextRound = gameRound + 1;
    setGameRound(nextRound);
    setItems(seed.items.map(cloneItem));
    setWorkers(makeWorkers());
    setDay(SEED_DAYS);
    setPhase("assign");
    // Seed snapshots tagged with new round number
    setSnapshots(seed.snapshots.map((s) => ({ ...s, round: nextRound })));
    setRoundResults([]);
    setEvents([]);
    setLastResult(null);
    setSelectedWorkerId(null);
    setGameOver(false);
  }, [gameRound, items, snapshots, settings, seed]);

  const handleAcknowledgeEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, acknowledged: true } : e)),
    );
  }, []);

  const loadSavedState = useCallback((saved: GameSaveState) => {
    setItems(saved.items);
    setWorkers(makeWorkers());
    setDay(saved.currentDay);
    setPhase("assign");
    setSettings(saved.settings);
    setSnapshots(saved.snapshots);
    setRoundResults([]);
    setEvents([]);
    setLastResult(null);
    setSelectedWorkerId(null);
    setGameOver(saved.gameOver);
    setGameRound(saved.gameRound);
    setRoundHistories(saved.roundHistories);
  }, []);

  return {
    // State
    items,
    workers,
    day: currentDay,
    phase,
    settings,
    snapshots,
    roundResults,
    events,
    lastResult,
    selectedWorkerId,
    gameOver,

    // Multi-round
    gameRound,
    roundHistories,
    allSnapshots,
    allItems,
    totalAge,

    // Derived
    roundNumber,
    isLastRound,
    wipCounts,
    doneCount,
    backlogItems,
    activeItems,
    assignedWorkerCount,

    // Actions
    selectWorker: handleSelectWorker,
    clickItem: handleClickItem,
    unassignWorker: handleUnassignWorker,
    assignWorkerToItem: handleAssignWorkerToItem,
    resolveRound: handleResolveRound,
    acknowledgeRound: () => {},
    updateSettings: handleUpdateSettings,
    pullItem: handlePullItem,
    reorderBacklog: handleReorderBacklog,
    restart: handleRestart,
    startNextRound: handleStartNextRound,
    acknowledgeEvent: handleAcknowledgeEvent,
    loadSavedState,
  };
}
