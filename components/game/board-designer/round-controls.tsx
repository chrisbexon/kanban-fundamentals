"use client";

import React, { useState } from "react";
import type { BoardDefinition } from "@/types/board";
import type { ValidationResult } from "@/lib/engine/board-designer";

interface RoundControlsProps {
  currentDay: number;
  itemCount: number;
  doneCount: number;
  wipCount: number;
  validation: ValidationResult[];
  passCount: number;
  totalChecks: number;
  definition: BoardDefinition;
  onAdvanceRound: () => void;
  onAdvanceMultiple: (n: number) => void;
  onAddItem: (typeId: string, swimlaneId: string) => void;
  onReset: () => void;
  onToggleSettings: () => void;
  onToggleCharts: () => void;
  settingsOpen: boolean;
  chartsOpen: boolean;
}

export function RoundControls({
  currentDay, itemCount, doneCount, wipCount,
  validation, passCount, totalChecks, definition,
  onAdvanceRound, onAdvanceMultiple, onAddItem, onReset,
  onToggleSettings, onToggleCharts, settingsOpen, chartsOpen,
}: RoundControlsProps) {
  const [showAddItem, setShowAddItem] = useState(false);

  const allValid = passCount === totalChecks;

  return (
    <div className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}>

      {/* Day counter */}
      <div className="flex items-center gap-2">
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Day</div>
        <div className="text-[18px] font-extrabold font-mono" style={{ color: "var(--text-primary)" }}>
          {currentDay}
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
        <span>WIP <strong style={{ color: "var(--text-primary)" }}>{wipCount}</strong></span>
        <span>Done <strong style={{ color: "#22c55e" }}>{doneCount}</strong></span>
        <span>Total <strong style={{ color: "var(--text-primary)" }}>{itemCount}</strong></span>
      </div>

      {/* Validation indicator */}
      <div className="flex items-center gap-1">
        {validation.map((v) => (
          <div
            key={v.id}
            className="w-2 h-2 rounded-full"
            title={`${v.label}: ${v.pass ? "Pass" : v.detail}`}
            style={{ background: v.pass ? "#22c55e" : "rgba(239,68,68,0.4)" }}
          />
        ))}
        <span className="text-[9px] font-bold ml-1" style={{ color: allValid ? "#22c55e" : "#f59e0b" }}>
          {passCount}/{totalChecks}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Toggle buttons */}
      <button onClick={onToggleSettings}
        className="text-[10px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
        style={{ background: settingsOpen ? "rgba(139,92,246,0.1)" : "transparent", color: settingsOpen ? "#8b5cf6" : "var(--text-muted)" }}>
        &#x2699;&#xFE0F; Settings
      </button>
      <button onClick={onToggleCharts}
        className="text-[10px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
        style={{ background: chartsOpen ? "rgba(59,130,246,0.1)" : "transparent", color: chartsOpen ? "#3b82f6" : "var(--text-muted)" }}>
        &#x1F4CA; Charts
      </button>

      {/* Add item */}
      <div className="relative">
        <button onClick={() => setShowAddItem(!showAddItem)}
          className="text-[10px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer"
          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
          + Item
        </button>
        {showAddItem && (
          <div className="absolute bottom-full mb-1 right-0 rounded-lg p-2 z-50 min-w-[180px]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            {definition.itemTypes.length === 0 ? (
              <div className="text-[10px] p-2" style={{ color: "var(--text-muted)" }}>
                Add item types in Settings first.
              </div>
            ) : (
              definition.itemTypes.map((type) => (
                <button key={type.id}
                  onClick={() => {
                    const lane = type.defaultSwimlane
                      ? definition.swimlanes.find((l) => l.id === type.defaultSwimlane) ?? definition.swimlanes[0]
                      : definition.swimlanes.find((l) => !l.name.toLowerCase().includes("expedite")) ?? definition.swimlanes[0];
                    onAddItem(type.id, lane.id);
                    setShowAddItem(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-md border-none cursor-pointer flex items-center gap-2 transition-all hover:opacity-80"
                  style={{ background: "transparent" }}>
                  <span className="text-[11px]">{type.icon}</span>
                  <span className="text-[11px] font-bold" style={{ color: type.color }}>{type.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Advance buttons */}
      <button onClick={onAdvanceRound}
        className="text-[11px] font-bold px-4 py-1.5 rounded-lg border-none cursor-pointer transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff" }}>
        Advance Day &rarr;
      </button>
      <button onClick={() => onAdvanceMultiple(5)}
        className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-none cursor-pointer"
        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
        +5
      </button>
      <button onClick={() => onAdvanceMultiple(10)}
        className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-none cursor-pointer"
        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
        +10
      </button>

      {/* Reset */}
      {currentDay > 0 && (
        <button onClick={onReset}
          className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-none cursor-pointer"
          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
          Reset
        </button>
      )}
    </div>
  );
}
