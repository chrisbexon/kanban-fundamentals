"use client";

import type { DaySnapshot, WipLocation } from "@/types/wip-game";
import { heatMapData } from "@/lib/stats/wip-game-stats";
import { COLUMN_DEFS } from "@/lib/constants/wip-game";

interface HeatmapChartProps {
  snapshots: DaySnapshot[];
}

const LOCATIONS: WipLocation[] = ["red-active", "red-finished", "blue-active", "blue-finished", "green"];

function intensityColor(count: number, maxCount: number): string {
  if (count === 0) return "rgba(255,255,255,0.02)";
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  if (intensity > 0.7) return `rgba(239, 68, 68, ${0.15 + intensity * 0.35})`;
  if (intensity > 0.4) return `rgba(245, 158, 11, ${0.1 + intensity * 0.3})`;
  return `rgba(59, 130, 246, ${0.08 + intensity * 0.25})`;
}

export function HeatmapChart({ snapshots }: HeatmapChartProps) {
  const cells = heatMapData(snapshots);
  if (cells.length === 0) return null;

  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const days = [...new Set(snapshots.map((s) => s.day))].sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="min-w-[400px]">
        {/* Header row with days */}
        <div className="flex">
          <div className="w-20 flex-shrink-0" />
          {days.map((d) => (
            <div key={d} className="flex-1 text-center text-[7px] font-mono px-0.5" style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {LOCATIONS.map((loc) => {
          const col = COLUMN_DEFS.find((c) => c.location === loc);
          return (
            <div key={loc} className="flex items-center">
              <div
                className="w-20 flex-shrink-0 text-[9px] font-bold truncate pr-1"
                style={{ color: col?.color ?? "#64748b" }}
              >
                {col?.label ?? loc}
              </div>
              {days.map((d) => {
                const cell = cells.find((c) => c.location === loc && c.day === d);
                const count = cell?.count ?? 0;
                return (
                  <div
                    key={d}
                    className="flex-1 aspect-square rounded-sm m-0.5 flex items-center justify-center text-[7px] font-mono"
                    style={{
                      background: intensityColor(count, maxCount),
                      color: count > 0 ? "var(--text-primary)" : "transparent",
                      minWidth: 16,
                      minHeight: 16,
                    }}
                    title={`Day ${d}: ${count} items`}
                  >
                    {count > 0 ? count : ""}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-20">
          <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Low</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="w-4 h-4 rounded-sm"
              style={{ background: intensityColor(v * maxCount, maxCount) }}
            />
          ))}
          <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>High</span>
        </div>
      </div>
    </div>
  );
}
