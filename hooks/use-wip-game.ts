"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WipWorkItem, Worker, WipSettings, DaySnapshot,
  RoundResult, GameEvent, RoundPhase, WorkColor,
} from "@/types/wip-game";
import { DEFAULT_SETTINGS, SEED_DAYS, PLAYABLE_ROUNDS, TOTAL_GAME_DAYS } from "@/lib/constants/wip-game";
import { loadSeed } from "@/lib/engine/wip-seed-loader";
import {
  makeWorkers, assignWorker, unassignWorker, resolveRound,
  takeSnapshot, reorderBacklog, stageWip, canAssign, markDoneItems,
} from "@/lib/engine/wip-game";

export function useWipGame() {
  const seed = useMemo(() => loadSeed(), []);

  const [items, setItems] = useState<WipWorkItem[]>(() => seed.items.map((it) => ({ ...it })));
  const [workers, setWorkers] = useState<Worker[]>(() => makeWorkers());
  const [day, setDay] = useState(SEED_DAYS);
  const [phase, setPhase] = useState<RoundPhase>("assign");
  const [settings, setSettings] = useState<WipSettings>(() => ({
    wipLimits: { ...DEFAULT_SETTINGS.wipLimits },
    enforceWip: { ...DEFAULT_SETTINGS.enforceWip },
  }));
  const [snapshots, setSnapshots] = useState<DaySnapshot[]>(() => [...seed.snapshots]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

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

  const handleResolveRound = useCallback(() => {
    if (phase !== "assign") return;
    const nextDay = day + 1;

    const result = resolveRound(items, workers, nextDay, settings, events);
    // Mark any items that just arrived in done
    const finalItems = markDoneItems(result.items, nextDay);
    const snap = takeSnapshot(finalItems, nextDay);

    setItems(finalItems);
    setWorkers(result.workers);
    setDay(nextDay);
    setEvents(result.events);
    setLastResult(result.result);
    setRoundResults((prev) => [...prev, result.result]);
    setSnapshots((prev) => [...prev, snap]);
    setPhase("resolve");
    setSelectedWorkerId(null);

    if (nextDay >= TOTAL_GAME_DAYS) {
      setGameOver(true);
    }
  }, [phase, day, items, workers, settings, events]);

  const handleAcknowledgeRound = useCallback(() => {
    if (phase !== "resolve") return;
    setPhase("assign");
    setLastResult(null);
  }, [phase]);

  const handleUpdateSettings = useCallback((newSettings: Partial<WipSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      wipLimits: { ...prev.wipLimits, ...newSettings.wipLimits },
      enforceWip: { ...prev.enforceWip, ...newSettings.enforceWip },
    }));
  }, []);

  const handleReorderBacklog = useCallback((itemId: string, direction: "up" | "down") => {
    if (phase !== "assign") return;
    setItems((prev) => reorderBacklog(prev, itemId, direction));
  }, [phase]);

  const handleRestart = useCallback(() => {
    setItems(seed.items.map((it) => ({ ...it })));
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

  const handleAcknowledgeEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, acknowledged: true } : e)),
    );
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
    resolveRound: handleResolveRound,
    acknowledgeRound: handleAcknowledgeRound,
    updateSettings: handleUpdateSettings,
    reorderBacklog: handleReorderBacklog,
    restart: handleRestart,
    acknowledgeEvent: handleAcknowledgeEvent,
  };
}
