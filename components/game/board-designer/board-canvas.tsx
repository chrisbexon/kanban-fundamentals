"use client";

import React, { useState, useCallback } from "react";
import type { BoardDefinition, BoardWorkItem, BoardSettings } from "@/types/board";
import { BoardColumn } from "./board-column";

interface BoardCanvasProps {
  definition: BoardDefinition;
  items: BoardWorkItem[];
  currentDay: number;
  onMoveItem: (itemId: string, columnId: string, subColumnId: string | null) => void;
  canMoveItem: (itemId: string, columnId: string) => { allowed: boolean; reason: string };
}

export function BoardCanvas({ definition, items, currentDay, onMoveItem, canMoveItem }: BoardCanvasProps) {
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

  return (
    <div className="flex-1 overflow-x-auto" onDragEnd={handleDragEnd}>
      {definition.swimlanes.map((lane) => {
        const laneCols = lane.columns?.length > 0 ? lane.columns : definition.columns;
        const laneItems = items.filter((it) => it.swimlaneId === lane.id);

        return (
          <div key={lane.id} className="mb-2">
            {/* Lane header */}
            {definition.swimlanes.length > 1 && (
              <div
                className="flex items-center gap-2 px-2 py-1 mb-1 rounded-t-lg"
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
            <div className="flex gap-1" style={{ minHeight: definition.swimlanes.length > 1 ? 120 : 180 }}>
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
