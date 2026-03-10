"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SimState, SimSettings } from "@/types/littles-law";
import { DEFAULT_SIM_SETTINGS } from "@/lib/constants/littles-law";
import { TICKS_PER_SECOND } from "@/lib/constants/littles-law";
import { createSimState, advanceTick, updateSimSettings, getSnapshot } from "@/lib/engine/littles-law";

export function useLittlesLaw() {
  const [state, setState] = useState<SimState>(() => createSimState(DEFAULT_SIM_SETTINGS));
  const stateRef = useRef(state);
  stateRef.current = state;

  const animRef = useRef<number | null>(null);
  const lastTickTime = useRef<number>(0);

  // Tick loop
  const tick = useCallback((timestamp: number) => {
    const s = stateRef.current;
    if (!s.running) {
      animRef.current = null;
      return;
    }

    // Calculate how many ticks to advance based on elapsed time and speed
    const elapsed = timestamp - lastTickTime.current;
    const msPerTick = 1000 / (TICKS_PER_SECOND * s.speed);
    const ticksToAdvance = Math.floor(elapsed / msPerTick);

    if (ticksToAdvance > 0) {
      lastTickTime.current = timestamp - (elapsed % msPerTick);

      let newState = s;
      const maxTicks = Math.min(ticksToAdvance, TICKS_PER_SECOND * s.speed); // cap per frame
      for (let i = 0; i < maxTicks; i++) {
        newState = advanceTick(newState);
      }
      setState(newState);
    }

    animRef.current = requestAnimationFrame(tick);
  }, []);

  // Start/stop
  const toggleRunning = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, running: !prev.running };
      if (next.running && !animRef.current) {
        lastTickTime.current = performance.now();
        animRef.current = requestAnimationFrame(tick);
      }
      return next;
    });
  }, [tick]);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SimSettings>) => {
    setState((prev) => updateSimSettings(prev, newSettings));
  }, []);

  const reset = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setState(createSimState(stateRef.current.settings));
  }, []);

  const resetWithSettings = useCallback((settings: SimSettings) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setState(createSimState(settings));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // If running state changes to true, ensure loop is started
  useEffect(() => {
    if (state.running && !animRef.current) {
      lastTickTime.current = performance.now();
      animRef.current = requestAnimationFrame(tick);
    }
  }, [state.running, tick]);

  const snapshot = getSnapshot(state);

  return {
    state,
    snapshot,
    toggleRunning,
    setSpeed,
    updateSettings,
    reset,
    resetWithSettings,
  };
}
