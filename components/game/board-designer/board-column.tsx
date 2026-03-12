"use client";

import React, { useState } from "react";
import type { ColumnDefinition, BoardWorkItem, ItemTypeDefinition, BoardSettings, RunMode } from "@/types/board";
import { BoardCard } from "./board-card";

interface BoardColumnProps {
  column: ColumnDefinition;
  items: BoardWorkItem[];
  itemTypes: ItemTypeDefinition[];
  currentDay: number;
  settings: BoardSettings;
  runMode: RunMode;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDrop: (columnId: string, subColumnId: string | null) => void;
  canDrop: (columnId: string) => { allowed: boolean; reason: string };
  dragActive: boolean;
  onTouchItemStart?: (itemId: string, e: React.TouchEvent) => void;
}

export function BoardColumn({
  column, items, itemTypes, currentDay, settings, runMode,
  onDragStart, onDrop, canDrop, dragActive, onTouchItemStart,
}: BoardColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const c = column;
  const wipCount = items.length;
  const atLimit = c.wipLimit !== null && wipCount >= c.wipLimit;
  const overLimit = c.wipLimit !== null && wipCount > c.wipLimit;
  const dropCheck = dragActive ? canDrop(c.id) : { allowed: true, reason: "" };

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragActive) return;
    if (dropCheck.allowed) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onDrop(c.id, null);
  };

  // If column has sub-columns, render them
  if (c.subColumns.length > 0) {
    return (
      <div className="flex-1 min-w-[120px] min-h-0 flex flex-col">
        {/* Column header */}
        <div className="rounded-t-lg px-2 py-1.5 text-center" style={{ background: `${c.color}10`, borderBottom: `2px solid ${c.color}30` }}>
          <div className="text-[10px] font-bold" style={{ color: c.color }}>{c.name}</div>
          {c.wipLimit !== null && (
            <div className="text-[8px] font-mono font-bold" style={{ color: overLimit ? "#ef4444" : atLimit ? "#f59e0b" : "var(--text-muted)" }}>
              {wipCount}/{c.wipLimit}
            </div>
          )}
        </div>
        {/* Sub-columns */}
        <div className="flex gap-px flex-1 min-h-0">
          {c.subColumns.map((sc) => {
            const scItems = items.filter((it) => it.subColumnId === sc.id);
            const scDropCheck = dragActive ? canDrop(c.id) : { allowed: true, reason: "" };
            return (
              <SubColumn
                key={sc.id}
                parentColumn={c}
                subColumn={sc}
                items={scItems}
                itemTypes={itemTypes}
                currentDay={currentDay}
                settings={settings}
                runMode={runMode}
                onDragStart={onDragStart}
                onDrop={() => onDrop(c.id, sc.id)}
                canDrop={scDropCheck.allowed}
                dragActive={dragActive}
                onTouchItemStart={onTouchItemStart}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Simple column (no sub-columns)
  return (
    <div
      data-drop-column={c.id}
      className="flex-1 min-w-[100px] min-h-0 flex flex-col rounded-lg transition-all"
      style={{
        background: dragOver && dropCheck.allowed
          ? `${c.color}12`
          : dragOver && !dropCheck.allowed
            ? "rgba(239,68,68,0.06)"
            : `${c.color}04`,
        border: dragOver
          ? dropCheck.allowed
            ? `2px dashed ${c.color}60`
            : "2px dashed rgba(239,68,68,0.4)"
          : `1px solid ${c.color}15`,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="px-2 py-1.5 text-center flex-shrink-0" style={{ borderBottom: `2px solid ${c.color}20` }}>
        <div className="text-[10px] font-bold" style={{ color: c.color }}>{c.name}</div>
        {c.wipLimit !== null && (
          <div className="text-[8px] font-mono font-bold" style={{ color: overLimit ? "#ef4444" : atLimit ? "#f59e0b" : "var(--text-muted)" }}>
            {wipCount}/{c.wipLimit}
          </div>
        )}
        {c.policy && (
          <div className="text-[8px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{c.policy}</div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 min-h-0 p-1 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            itemType={itemTypes.find((t) => t.id === item.typeId)}
            currentDay={currentDay}
            settings={settings}
            runMode={runMode}
            onDragStart={onDragStart}
            onTouchStart={onTouchItemStart}
          />
        ))}
      </div>

      {/* Drop hint */}
      {dragActive && dropCheck.allowed && items.length === 0 && (
        <div className="text-[8px] text-center py-2" style={{ color: c.color, opacity: 0.5 }}>
          Drop here
        </div>
      )}
      {dragActive && !dropCheck.allowed && (
        <div className="text-[8px] text-center py-1 px-1" style={{ color: "#ef4444" }}>
          {dropCheck.reason}
        </div>
      )}
    </div>
  );
}

// ─── Sub-Column ─────────────────────────────────────────────

function SubColumn({
  parentColumn, subColumn, items, itemTypes, currentDay, settings, runMode,
  onDragStart, onDrop, canDrop, dragActive, onTouchItemStart,
}: {
  parentColumn: ColumnDefinition;
  subColumn: { id: string; name: string; type: string; policy: string };
  items: BoardWorkItem[];
  itemTypes: ItemTypeDefinition[];
  currentDay: number;
  settings: BoardSettings;
  runMode: RunMode;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDrop: () => void;
  canDrop: boolean;
  dragActive: boolean;
  onTouchItemStart?: (itemId: string, e: React.TouchEvent) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      data-drop-column={parentColumn.id}
      data-drop-subcolumn={subColumn.id}
      className="flex-1 min-h-0 flex flex-col transition-all"
      style={{
        background: dragOver && canDrop ? `${parentColumn.color}08` : "transparent",
        borderLeft: `1px dashed ${parentColumn.color}12`,
      }}
      onDragOver={(e) => {
        if (!dragActive || !canDrop) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop();
      }}
    >
      <div className="text-[8px] font-bold text-center py-1" style={{ color: "var(--text-muted)" }}>
        {subColumn.name}
      </div>
      <div className="flex-1 min-h-0 p-0.5 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            itemType={itemTypes.find((t) => t.id === item.typeId)}
            currentDay={currentDay}
            settings={settings}
            runMode={runMode}
            onDragStart={onDragStart}
            onTouchStart={onTouchItemStart}
          />
        ))}
      </div>
    </div>
  );
}
