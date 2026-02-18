"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WorkItem, SimulationRun, GameSnapshot } from "@/types/penny-game";
import { TOTAL_ITEMS } from "@/lib/constants/penny-game";
import { makeItems, simTick } from "@/lib/engine/penny-game";
import { getStats } from "@/lib/stats/penny-game-stats";

export function usePennyGame() {
  const [batchSize, setBatchSize] = useState(20);
  const [customBatch, setCustomBatch] = useState("");
  const [items, setItems] = useState<WorkItem[]>(() => makeItems(TOTAL_ITEMS));
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(280);
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [snaps, setSnaps] = useState<GameSnapshot[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allDone = items.every((x) => x.state === "done");
  const stats = getStats(items);
  const doneCount = items.filter((x) => x.state === "done").length;
  const enough = runs.length >= 2;

  useEffect(() => {
    if (running && !allDone) {
      timerRef.current = setTimeout(() => {
        setTick((t) => {
          const nt = t + 1;
          setItems((p) => simTick(p, batchSize, nt));
          return nt;
        });
      }, speed);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    if (running && allDone && stats) {
      setRunning(false);
      setRuns((p) => [...p, { bs: batchSize, ...stats }]);
      setSnaps((p) => [...p, { bs: batchSize, items: items.map((x) => ({ ...x })), ticks: tick }]);
    }
  }, [running, tick, allDone, speed, batchSize, stats, items]);

  const start = useCallback(() => {
    setItems(makeItems(TOTAL_ITEMS));
    setTick(0);
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setItems(makeItems(TOTAL_ITEMS));
    setTick(0);
  }, []);

  const selectBatch = useCallback((s: number) => {
    setBatchSize(s);
    setCustomBatch("");
    setRunning(false);
    setItems(makeItems(TOTAL_ITEMS));
    setTick(0);
  }, []);

  const applyCustomBatch = useCallback(() => {
    const v = parseInt(customBatch);
    if (v >= 1 && v <= 20) {
      setBatchSize(v);
      reset();
    }
  }, [customBatch, reset]);

  const step = useCallback(() => {
    if (!allDone) {
      const nt = tick + 1;
      setItems((p) => simTick(p, batchSize, nt));
      setTick(nt);
    }
  }, [allDone, tick, batchSize]);

  const handleStart = useCallback(() => {
    if (allDone) {
      start();
    } else if (tick > 0) {
      setRunning(true);
    } else {
      start();
    }
  }, [allDone, tick, start]);

  const pause = useCallback(() => setRunning(false), []);

  const clearRuns = useCallback(() => {
    setRuns([]);
    setSnaps([]);
  }, []);

  return {
    batchSize,
    customBatch,
    setCustomBatch,
    items,
    tick,
    running,
    speed,
    setSpeed,
    runs,
    snaps,
    allDone,
    stats,
    doneCount,
    enough,
    selectBatch,
    applyCustomBatch,
    step,
    handleStart,
    pause,
    reset,
    clearRuns,
  };
}
