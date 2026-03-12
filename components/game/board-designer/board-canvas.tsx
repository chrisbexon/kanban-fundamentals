"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const touchGhostRef = useRef<HTMLDivElement | null>(null);
  const touchItemIdRef = useRef<string | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchDragging = useRef(false);

  // Clean up touch ghost on unmount
  useEffect(() => {
    return () => {
      if (touchGhostRef.current) {
        touchGhostRef.current.remove();
        touchGhostRef.current = null;
      }
    };
  }, []);

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
    if (!dragItemId && !touchItemIdRef.current) return { allowed: false, reason: "" };
    return canMoveItem(dragItemId ?? touchItemIdRef.current!, columnId);
  }, [dragItemId, canMoveItem]);

  // ── Touch drag-and-drop ──────────────────────────────────────
  const handleTouchStart = useCallback((itemId: string, e: React.TouchEvent) => {
    if (runMode !== "manual") return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchItemIdRef.current = itemId;
    touchDragging.current = false;
  }, [runMode]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchItemIdRef.current || !touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;

    // Require 8px of movement to start drag (avoids accidental drags)
    if (!touchDragging.current) {
      if (Math.abs(dx) + Math.abs(dy) < 8) return;
      touchDragging.current = true;
      setDragItemId(touchItemIdRef.current);

      // Create ghost element
      const ghost = document.createElement("div");
      ghost.className = "fixed pointer-events-none z-[100] rounded-lg px-2 py-1 text-[9px] font-bold";
      ghost.style.cssText = "background:rgba(59,130,246,0.2);border:1.5px solid #3b82f6;color:#93c5fd;white-space:nowrap;transform:translate(-50%,-50%)";
      ghost.textContent = touchItemIdRef.current;
      document.body.appendChild(ghost);
      touchGhostRef.current = ghost;
    }

    e.preventDefault(); // prevent scroll while dragging
    if (touchGhostRef.current) {
      touchGhostRef.current.style.left = `${touch.clientX}px`;
      touchGhostRef.current.style.top = `${touch.clientY}px`;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchItemIdRef.current || !touchDragging.current) {
      touchItemIdRef.current = null;
      touchStartPos.current = null;
      touchDragging.current = false;
      return;
    }

    const itemId = touchItemIdRef.current;

    // Remove ghost
    if (touchGhostRef.current) {
      touchGhostRef.current.remove();
      touchGhostRef.current = null;
    }

    // Find drop target under finger
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = el?.closest("[data-drop-column]") as HTMLElement | null;

    if (dropZone) {
      const columnId = dropZone.getAttribute("data-drop-column")!;
      const subColumnId = dropZone.getAttribute("data-drop-subcolumn") || null;
      const check = canMoveItem(itemId, columnId);
      if (check.allowed) {
        onMoveItem(itemId, columnId, subColumnId);
      }
    }

    setDragItemId(null);
    touchItemIdRef.current = null;
    touchStartPos.current = null;
    touchDragging.current = false;
  }, [canMoveItem, onMoveItem]);

  // Calculate lane heights
  const EXPEDITE_SUB_HEIGHT = 140;
  const laneCount = definition.swimlanes.length;
  const totalExpSubHeight = definition.swimlanes.filter((l) => l.expediteEnabled).length * EXPEDITE_SUB_HEIGHT;

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-x-auto"
      onDragEnd={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {definition.swimlanes.map((lane) => {
        const laneCols = lane.columns?.length > 0 ? lane.columns : definition.columns;
        const laneItems = items.filter((it) => it.swimlaneId === lane.id);
        const standardItems = laneItems.filter((it) => it.classOfService !== "expedite");
        const expediteItems = laneItems.filter((it) => it.classOfService === "expedite");

        const mainHeight = laneCount > 0
          ? `calc((100vh - 240px - ${totalExpSubHeight}px) / ${laneCount})`
          : "calc(100vh - 240px)";

        const showLaneHeader = definition.swimlanes.length > 1;
        const standardWip = standardItems.filter((it) => it.doneDay === null && it.commitDay !== null).length;
        const expediteWip = expediteItems.filter((it) => it.doneDay === null && it.commitDay !== null).length;

        return (
          <div key={lane.id} className="mb-1">
            {/* Expedite sub-row — rendered ABOVE the parent lane */}
            {lane.expediteEnabled && (
              <>
                <div
                  className="flex items-center gap-2 px-2 py-0.5 mb-0.5 rounded-t-lg"
                  style={{ background: "rgba(239,68,68,0.04)", borderLeft: "3px solid #ef4444" }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                    Expedite
                  </div>
                  {lane.expediteWipLimit !== null && (
                    <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                      WIP: {expediteWip}/{lane.expediteWipLimit}
                    </span>
                  )}
                  {lane.expeditePolicy && (
                    <span className="text-[8px] ml-auto truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>
                      {lane.expeditePolicy}
                    </span>
                  )}
                </div>
                <div className="flex gap-1" style={{ height: `${EXPEDITE_SUB_HEIGHT}px` }}>
                  {laneCols.map((col) => {
                    const colItems = expediteItems.filter((it) => it.columnId === col.id);
                    return (
                      <BoardColumn
                        key={`${col.id}-exp`}
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
                        onTouchItemStart={handleTouchStart}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Lane header */}
            {showLaneHeader && (
              <div
                className="flex items-center gap-2 px-2 py-0.5 mb-0.5"
                style={{ background: `${lane.color}08`, borderLeft: `3px solid ${lane.color}`, borderRadius: lane.expediteEnabled ? 0 : "0.5rem 0.5rem 0 0" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: lane.color }}>
                  {lane.name}
                </div>
                {lane.wipLimit !== null && (
                  <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                    WIP: {standardWip}/{lane.wipLimit}
                  </span>
                )}
                {lane.policy && (
                  <span className="text-[8px] ml-auto truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>
                    {lane.policy}
                  </span>
                )}
              </div>
            )}

            {/* Main row (standard + regulatory items) */}
            <div className="flex gap-1" style={{ height: mainHeight }}>
              {laneCols.map((col) => {
                const colItems = standardItems.filter((it) => it.columnId === col.id);
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
                    onTouchItemStart={handleTouchStart}
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
