"use client";

import type { SimSettings } from "@/types/littles-law";
import { SPEED_OPTIONS } from "@/lib/constants/littles-law";
import { Btn } from "@/components/ui/button";

interface SimControlsProps {
  running: boolean;
  speed: number;
  settings: SimSettings;
  simTimeMinutes: number;
  onToggleRunning: () => void;
  onSetSpeed: (s: number) => void;
  onUpdateSettings: (s: Partial<SimSettings>) => void;
  onReset: () => void;
}

export function SimControls({
  running, speed, settings, simTimeMinutes,
  onToggleRunning, onSetSpeed, onUpdateSettings, onReset,
}: SimControlsProps) {
  return (
    <div
      className="rounded-xl p-3.5 mb-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      {/* Playback */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <Btn primary onClick={onToggleRunning}>
          {running ? "Pause" : "Play"}
        </Btn>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className="px-2 py-1 rounded text-[10px] font-bold transition-all"
              style={{
                background: speed === s ? "rgba(59,130,246,0.15)" : "transparent",
                color: speed === s ? "#60a5fa" : "var(--text-muted)",
                border: speed === s ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-faint)",
              }}
            >
              {s}x
            </button>
          ))}
        </div>
        <span className="text-xs font-mono ml-auto" style={{ color: "var(--text-tertiary)" }}>
          {simTimeMinutes} min
        </span>
        <Btn small onClick={onReset}>Reset</Btn>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-4">
        {/* Arrival rate */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            Car arrival (every)
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={settings.arrivalInterval}
              onChange={(e) => onUpdateSettings({ arrivalInterval: Number(e.target.value) })}
              className="w-24 accent-blue-500"
            />
            <span className="text-xs font-mono w-8 text-right" style={{ color: "var(--text-secondary)" }}>{settings.arrivalInterval}s</span>
          </div>
        </div>

        {/* Order terminals */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            Order windows
          </div>
          <div className="flex gap-1">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => onUpdateSettings({ orderServers: n })}
                className="px-3 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: settings.orderServers === n ? "rgba(139,92,246,0.15)" : "transparent",
                  color: settings.orderServers === n ? "#a78bfa" : "var(--text-muted)",
                  border: settings.orderServers === n ? "1px solid rgba(139,92,246,0.3)" : "1px solid var(--border-faint)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Kitchen workers */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            Kitchen staff
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => onUpdateSettings({ kitchenWorkers: n })}
                className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: settings.kitchenWorkers === n ? "rgba(245,158,11,0.15)" : "transparent",
                  color: settings.kitchenWorkers === n ? "#fbbf24" : "var(--text-muted)",
                  border: settings.kitchenWorkers === n ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border-faint)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Balk threshold */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            Max queue before leave
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={settings.balkThreshold}
              onChange={(e) => onUpdateSettings({ balkThreshold: Number(e.target.value) })}
              className="w-20 accent-red-500"
            />
            <span className="text-xs font-mono w-6 text-right" style={{ color: "var(--text-secondary)" }}>{settings.balkThreshold}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
