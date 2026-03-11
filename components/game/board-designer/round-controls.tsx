"use client";

import React, { useState } from "react";
import type { BoardDefinition, RunMode } from "@/types/board";
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
  runMode: RunMode;
  isPlaying: boolean;
  playSpeed: number;
  targetDay: number;
  onAdvanceRound: () => void;
  onAddItem: (typeId: string, swimlaneId: string) => void;
  onReset: () => void;
  onToggleSettings: () => void;
  onToggleCharts: () => void;
  onSetRunMode: (mode: RunMode) => void;
  onPlay: () => void;
  onPause: () => void;
  onSetPlaySpeed: (ms: number) => void;
  onSetTargetDay: (day: number) => void;
  settingsOpen: boolean;
  chartsOpen: boolean;
}

export function RoundControls({
  currentDay, itemCount, doneCount, wipCount,
  validation, passCount, totalChecks, definition,
  runMode, isPlaying, playSpeed, targetDay,
  onAdvanceRound, onAddItem, onReset,
  onToggleSettings, onToggleCharts,
  onSetRunMode, onPlay, onPause, onSetPlaySpeed, onSetTargetDay,
  settingsOpen, chartsOpen,
}: RoundControlsProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const hasMultipleLanes = definition.swimlanes.length > 1;
  const allValid = passCount === totalChecks;
  const isAuto = runMode === "auto";
  const atTarget = currentDay >= targetDay;

  return (
    <div className="rounded-xl px-3 py-2 flex flex-col gap-2"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}>

      {/* Row 1: Mode toggle + Stats + Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-faint)" }}>
          <button onClick={() => onSetRunMode("manual")}
            className="text-[9px] font-bold px-2.5 py-1 border-none cursor-pointer transition-all"
            style={{
              background: !isAuto ? "rgba(59,130,246,0.12)" : "transparent",
              color: !isAuto ? "#3b82f6" : "var(--text-muted)",
            }}>
            Manual
          </button>
          <button onClick={() => onSetRunMode("auto")}
            className="text-[9px] font-bold px-2.5 py-1 border-none cursor-pointer transition-all"
            style={{
              background: isAuto ? "rgba(139,92,246,0.12)" : "transparent",
              color: isAuto ? "#8b5cf6" : "var(--text-muted)",
            }}>
            Simulate
          </button>
        </div>

        {/* Day counter */}
        <div className="flex items-center gap-1.5">
          <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Day</div>
          <div className="text-[16px] font-extrabold font-mono" style={{ color: "var(--text-primary)" }}>
            {currentDay}
          </div>
          {isAuto && (
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>/ {targetDay}</span>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex gap-2 text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
          <span>WIP <strong style={{ color: "var(--text-primary)" }}>{wipCount}</strong></span>
          <span>Done <strong style={{ color: "#22c55e" }}>{doneCount}</strong></span>
          <span>Total <strong style={{ color: "var(--text-primary)" }}>{itemCount}</strong></span>
        </div>

        {/* Validation indicator */}
        <div className="flex items-center gap-1">
          {validation.map((v) => (
            <div key={v.id} className="w-1.5 h-1.5 rounded-full"
              title={`${v.label}: ${v.pass ? "Pass" : v.detail}`}
              style={{ background: v.pass ? "#22c55e" : "rgba(239,68,68,0.4)" }} />
          ))}
          <span className="text-[8px] font-bold ml-0.5" style={{ color: allValid ? "#22c55e" : "#f59e0b" }}>
            {passCount}/{totalChecks}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Toggle buttons */}
        <button onClick={onToggleSettings}
          className="text-[9px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
          style={{ background: settingsOpen ? "rgba(139,92,246,0.1)" : "transparent", color: settingsOpen ? "#8b5cf6" : "var(--text-muted)" }}>
          Settings
        </button>
        <button onClick={onToggleCharts}
          className="text-[9px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
          style={{ background: chartsOpen ? "rgba(59,130,246,0.1)" : "transparent", color: chartsOpen ? "#3b82f6" : "var(--text-muted)" }}>
          Charts
        </button>
      </div>

      {/* Row 2: Action controls (mode-dependent) */}
      <div className="flex flex-wrap items-center gap-2">
        {isAuto ? (
          /* ─── Auto mode controls ─── */
          <>
            {/* Play / Pause */}
            <button onClick={isPlaying ? onPause : onPlay}
              disabled={atTarget}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all"
              style={{
                background: isPlaying
                  ? "rgba(245,158,11,0.15)"
                  : "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                color: isPlaying ? "#f59e0b" : "#fff",
                opacity: atTarget ? 0.4 : 1,
              }}>
              {isPlaying ? "\u23F8 Pause" : "\u25B6 Play"}
            </button>

            {/* Step forward */}
            <button onClick={onAdvanceRound}
              disabled={isPlaying || atTarget}
              className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-none cursor-pointer"
              style={{
                background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                opacity: isPlaying || atTarget ? 0.4 : 1,
              }}>
              Step &rarr;
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Speed</span>
              <input type="range" min={50} max={2000} step={50}
                value={2050 - playSpeed}
                onChange={(e) => onSetPlaySpeed(2050 - parseInt(e.target.value))}
                className="w-[80px] h-1 accent-purple-500"
                title={`${playSpeed}ms per day`}
                style={{ accentColor: "#8b5cf6" }} />
              <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>
                {playSpeed <= 200 ? "Fast" : playSpeed <= 800 ? "Med" : "Slow"}
              </span>
            </div>

            {/* Target day */}
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>To day</span>
              <input type="number" min={10} max={365} value={targetDay}
                onChange={(e) => onSetTargetDay(parseInt(e.target.value) || 60)}
                className="w-[50px] rounded-md px-1.5 py-0.5 text-[10px] font-mono border-none text-center"
                style={{ background: "var(--bg-deeper)", color: "var(--text-primary)", outline: "1px solid var(--border-faint)" }} />
            </div>

            {/* Progress bar */}
            {currentDay > 0 && (
              <div className="flex-1 min-w-[60px] max-w-[150px] h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deeper)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (currentDay / targetDay) * 100)}%`,
                    background: atTarget ? "#22c55e" : "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                  }} />
              </div>
            )}
          </>
        ) : (
          /* ─── Manual mode controls ─── */
          <>
            {/* Advance day */}
            <button onClick={onAdvanceRound}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff" }}>
              Advance Day &rarr;
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
                    <>
                      {hasMultipleLanes && (
                        <div className="mb-1.5 pb-1.5" style={{ borderBottom: "1px solid var(--border-faint)" }}>
                          <div className="text-[8px] font-bold uppercase tracking-wider mb-1 px-1" style={{ color: "var(--text-muted)" }}>
                            Swimlane
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {definition.swimlanes.map((lane) => (
                              <button key={lane.id}
                                onClick={() => setSelectedLaneId(lane.id)}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded border-none cursor-pointer flex items-center gap-1"
                                style={{
                                  background: selectedLaneId === lane.id ? `${lane.color}20` : "var(--bg-deeper)",
                                  color: selectedLaneId === lane.id ? lane.color : "var(--text-muted)",
                                  border: selectedLaneId === lane.id ? `1px solid ${lane.color}40` : "1px solid var(--border-faint)",
                                }}>
                                <div className="w-1.5 h-1.5 rounded-sm" style={{ background: lane.color }} />
                                {lane.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {definition.itemTypes.map((type) => (
                        <button key={type.id}
                          onClick={() => {
                            const laneId = hasMultipleLanes && selectedLaneId
                              ? selectedLaneId
                              : type.defaultSwimlane
                                ? (definition.swimlanes.find((l) => l.id === type.defaultSwimlane) ?? definition.swimlanes[0]).id
                                : (definition.swimlanes.find((l) => !l.name.toLowerCase().includes("expedite")) ?? definition.swimlanes[0]).id;
                            onAddItem(type.id, laneId);
                            setShowAddItem(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md border-none cursor-pointer flex items-center gap-2 transition-all hover:opacity-80"
                          style={{ background: "transparent" }}>
                          <span className="text-[11px]">{type.icon}</span>
                          <span className="text-[11px] font-bold" style={{ color: type.color }}>{type.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Reset (both modes) */}
        {currentDay > 0 && (
          <button onClick={onReset}
            className="text-[9px] font-bold px-2 py-1 rounded-lg border-none cursor-pointer"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
