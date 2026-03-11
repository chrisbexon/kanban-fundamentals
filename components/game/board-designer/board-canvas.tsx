"use client";

import React, { useState, useCallback } from "react";
import type { BoardDefinition, BoardWorkItem, BoardSettings, RunMode } from "@/types/board";
import { BoardColumn } from "./board-column";

interface BoardCanvasProps {
  definition: BoardDefinition;
  items: BoardWorkItem[];
  currentDay: number;
  runMode: RunMode;
  onMoveItem: (itemId: string, columnId: string, subColumnId: string | null) => void;
  canMoveItem: (itemId: string, columnId: string) => { allowed: boolean; reason: string };
}

export function BoardCanvas({ definition, items, currentDay, runMode, onMoveItem, canMoveItem }: BoardCanvasProps) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDragItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  }, []);

  const handleDrop = useCallback((columnId: string, subColumnId: string | null) => {
    if (dragItemId) {
      onMoveItem(dragItemId, columnId, subColumnId);
    }
    setDragItemId(null);
  }, [dragItemId, onMoveItem]);

  const handleDragEnd = useCallback(() => {
    setDragItemId(null);
  }, []);

  const checkCanDrop = useCallback((columnId: string) => {
    if (!dragItemId) return { allowed: false, reason: "" };
    return canMoveItem(dragItemId, columnId);
  }, [dragItemId, canMoveItem]);

  // Calculate lane heights: expedite lanes get fixed compact height, standard lanes share the rest
  const EXPEDITE_HEIGHT = 120; // ~2 cards
  const expediteLaneCount = definition.swimlanes.filter((l) => l.name.toLowerCase().includes("expedite")).length;
  const standardLaneCount = definition.swimlanes.length - expediteLaneCount;
  const totalExpediteHeight = expediteLaneCount * EXPEDITE_HEIGHT;

  return (
    <div className="flex-1 overflow-x-auto" onDragEnd={handleDragEnd}>
      {definition.swimlanes.map((lane) => {
        const laneCols = lane.columns?.length > 0 ? lane.columns : definition.columns;
        const laneItems = items.filter((it) => it.swimlaneId === lane.id);
        const isExpedite = lane.name.toLowerCase().includes("expedite");

        const laneHeight = isExpedite
          ? `${EXPEDITE_HEIGHT}px`
          : standardLaneCount > 0
            ? `calc((100vh - 240px - ${totalExpediteHeight}px) / ${standardLaneCount})`
            : "calc(100vh - 240px)";

        return (
          <div key={lane.id} className="mb-1">
            {/* Lane header */}
            {definition.swimlanes.length > 1 && (
              <div
                className="flex items-center gap-2 px-2 py-0.5 mb-0.5 rounded-t-lg"
                style={{ background: `${lane.color}08`, borderLeft: `3px solid ${lane.color}` }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: lane.color }}>
                  {lane.name}
                </div>
                {lane.wipLimit !== null && (
                  <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                    Lane WIP: {laneItems.filter((it) => it.doneDay === null && it.commitDay !== null).length}/{lane.wipLimit}
                  </span>
                )}
                {lane.policy && (
                  <span className="text-[8px] ml-auto truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>
                    {lane.policy}
                  </span>
                )}
              </div>
            )}

            {/* Columns */}
            <div className="flex gap-1" style={{ height: laneHeight }}>
              {laneCols.map((col) => {
                const colItems = laneItems.filter((it) => it.columnId === col.id);
                return (
                  <BoardColumn
                    key={col.id}
                    column={col}
                    items={colItems}
                    itemTypes={definition.itemTypes}
                    currentDay={currentDay}
                    settings={definition.settings}
                    runMode={runMode}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    canDrop={checkCanDrop}
                    dragActive={dragItemId !== null}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
