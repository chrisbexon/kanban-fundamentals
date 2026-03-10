/**
 * Board Designer — State Management Hook
 *
 * Manages the full BoardState and exposes all actions for both
 * design mode (editing structure) and run mode (moving items, advancing rounds).
 */

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  BoardState,
  BoardDefinition,
  ColumnDefinition,
  SwimlaneDefinition,
  ItemTypeDefinition,
  BoardSettings,
} from "@/types/board";
import { createEmptyBoardState } from "@/types/board";
import {
  createWorkItem,
  moveItem,
  canMoveItem,
  advanceRound,
  advanceMultipleRounds,
  validateBoard,
  type ValidationResult,
} from "@/lib/engine/board-designer";

const STORAGE_KEY = "kanban-board-state";

// ─── Sync board.columns from primary swimlane ───────────────
function syncColumns(def: BoardDefinition): BoardDefinition {
  const primary = def.swimlanes[0];
  return {
    ...def,
    columns: primary?.columns?.length > 0 ? primary.columns : def.columns,
  };
}

export function useBoardDesigner() {
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [chartsOpen, setChartsOpen] = useState(false);

  // ─── Persistence ────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BoardState;
        if (parsed?.definition?.columns?.length > 0) {
          setBoardState(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!boardState) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
    } catch { /* ignore */ }
  }, [boardState]);

  // ─── Init from template ─────────────────────────────────────
  const initFromTemplate = useCallback((def: BoardDefinition) => {
    const state = createEmptyBoardState(def);
    setBoardState(state);
    setSettingsOpen(true);
    setChartsOpen(false);
  }, []);

  // ─── Definition mutations ───────────────────────────────────
  const updateDefinition = useCallback((updates: Partial<BoardDefinition>) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      const def = syncColumns({ ...prev.definition, ...updates });
      return { ...prev, definition: def };
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<BoardSettings>) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        definition: { ...prev.definition, settings: { ...prev.definition.settings, ...updates } },
      };
    });
  }, []);

  // ─── Swimlane mutations ─────────────────────────────────────
  const updateSwimlane = useCallback((laneId: string, updates: Partial<SwimlaneDefinition>) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      const def = syncColumns({
        ...prev.definition,
        swimlanes: prev.definition.swimlanes.map((l) =>
          l.id === laneId ? { ...l, ...updates } : l,
        ),
      });
      return { ...prev, definition: def };
    });
  }, []);

  const setLaneColumns = useCallback((laneId: string, cols: ColumnDefinition[]) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      const def = syncColumns({
        ...prev.definition,
        swimlanes: prev.definition.swimlanes.map((l) =>
          l.id === laneId ? { ...l, columns: cols } : l,
        ),
      });
      return { ...prev, definition: def };
    });
  }, []);

  const addSwimlane = useCallback((lane: SwimlaneDefinition) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return { ...prev, definition: { ...prev.definition, swimlanes: [...prev.definition.swimlanes, lane] } };
    });
  }, []);

  const removeSwimlane = useCallback((laneId: string) => {
    setBoardState((prev) => {
      if (!prev || prev.definition.swimlanes.length <= 1) return prev;
      const def = syncColumns({
        ...prev.definition,
        swimlanes: prev.definition.swimlanes
          .filter((l) => l.id !== laneId)
          .map((l, i) => ({ ...l, order: i })),
      });
      // Remove items in deleted lane
      const items = prev.items.filter((it) => it.swimlaneId !== laneId);
      return { ...prev, definition: def, items };
    });
  }, []);

  // ─── Item type mutations ────────────────────────────────────
  const updateItemType = useCallback((typeId: string, updates: Partial<ItemTypeDefinition>) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        definition: {
          ...prev.definition,
          itemTypes: prev.definition.itemTypes.map((t) =>
            t.id === typeId ? { ...t, ...updates } : t,
          ),
        },
      };
    });
  }, []);

  const addItemType = useCallback((type: ItemTypeDefinition) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return { ...prev, definition: { ...prev.definition, itemTypes: [...prev.definition.itemTypes, type] } };
    });
  }, []);

  const removeItemType = useCallback((typeId: string) => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        definition: { ...prev.definition, itemTypes: prev.definition.itemTypes.filter((t) => t.id !== typeId) },
      };
    });
  }, []);

  // ─── Run-mode actions ───────────────────────────────────────
  const addWorkItem = useCallback((typeId: string, swimlaneId: string, title?: string) => {
    setBoardState((prev) => prev ? createWorkItem(prev, typeId, swimlaneId, title) : prev);
  }, []);

  const doMoveItem = useCallback((itemId: string, targetColumnId: string, targetSubColumnId: string | null = null) => {
    setBoardState((prev) => prev ? moveItem(prev, itemId, targetColumnId, targetSubColumnId) : prev);
  }, []);

  const checkCanMove = useCallback((itemId: string, targetColumnId: string) => {
    if (!boardState) return { allowed: false, reason: "No board" };
    return canMoveItem(boardState, itemId, targetColumnId);
  }, [boardState]);

  const doAdvanceRound = useCallback(() => {
    setBoardState((prev) => prev ? advanceRound(prev) : prev);
  }, []);

  const doAdvanceMultiple = useCallback((count: number) => {
    setBoardState((prev) => prev ? advanceMultipleRounds(prev, count) : prev);
  }, []);

  const resetRun = useCallback(() => {
    setBoardState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [],
        currentDay: 0,
        nextItemNumber: 1,
        snapshots: [],
      };
    });
  }, []);

  // ─── Computed values ────────────────────────────────────────
  const validation = useMemo<ValidationResult[]>(() => {
    if (!boardState) return [];
    return validateBoard(boardState.definition);
  }, [boardState?.definition]);

  const isValid = useMemo(() => validation.every((v) => v.pass), [validation]);
  const passCount = useMemo(() => validation.filter((v) => v.pass).length, [validation]);

  return {
    // State
    boardState,
    definition: boardState?.definition ?? null,
    items: boardState?.items ?? [],
    currentDay: boardState?.currentDay ?? 0,
    snapshots: boardState?.snapshots ?? [],

    // UI state
    settingsOpen,
    chartsOpen,
    toggleSettings: () => setSettingsOpen((v) => !v),
    toggleCharts: () => setChartsOpen((v) => !v),
    setSettingsOpen,
    setChartsOpen,

    // Init
    initFromTemplate,
    hasSavedState: boardState !== null,

    // Definition mutations
    updateDefinition,
    updateSettings,
    updateSwimlane,
    setLaneColumns,
    addSwimlane,
    removeSwimlane,
    updateItemType,
    addItemType,
    removeItemType,

    // Run actions
    addWorkItem,
    moveItem: doMoveItem,
    canMoveItem: checkCanMove,
    advanceRound: doAdvanceRound,
    advanceMultiple: doAdvanceMultiple,
    resetRun,

    // Validation
    validation,
    isValid,
    passCount,
  };
}
