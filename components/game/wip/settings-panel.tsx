"use client";

import type { WipSettings, WorkColor } from "@/types/wip-game";
import { STAGE_COLORS } from "@/lib/constants/wip-game";
import { Btn } from "@/components/ui/button";

interface SettingsPanelProps {
  settings: WipSettings;
  onUpdate: (s: Partial<WipSettings>) => void;
  onRestart: () => void;
}

function WipLimitRow({ color, label, settings, onUpdate }: {
  color: WorkColor;
  label: string;
  settings: WipSettings;
  onUpdate: (s: Partial<WipSettings>) => void;
}) {
  const limit = settings.wipLimits[color];
  const enforce = settings.enforceWip[color];

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ background: STAGE_COLORS[color] }}
      />
      <div className="text-xs font-bold w-12" style={{ color: "var(--text-primary)" }}>{label}</div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdate({ wipLimits: { ...settings.wipLimits, [color]: Math.max(1, limit - 1) } })}
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer border-none"
          style={{ background: "var(--bg-interactive)", color: "var(--text-secondary)" }}
        >
          -
        </button>
        <div
          className="w-8 h-6 rounded flex items-center justify-center text-xs font-bold font-mono"
          style={{ background: "var(--bg-progress-track)", color: STAGE_COLORS[color] }}
        >
          {limit}
        </div>
        <button
          onClick={() => onUpdate({ wipLimits: { ...settings.wipLimits, [color]: Math.min(10, limit + 1) } })}
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer border-none"
          style={{ background: "var(--bg-interactive)", color: "var(--text-secondary)" }}
        >
          +
        </button>
      </div>
      <label className="flex items-center gap-1.5 cursor-pointer ml-2">
        <input
          type="checkbox"
          checked={enforce}
          onChange={() => onUpdate({ enforceWip: { ...settings.enforceWip, [color]: !enforce } })}
          className="accent-blue-500"
        />
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Enforce</span>
      </label>
    </div>
  );
}

export function SettingsPanel({ settings, onUpdate, onRestart }: SettingsPanelProps) {
  return (
    <div
      className="rounded-xl p-3.5 mb-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
        WIP Limits
      </div>
      <WipLimitRow color="red" label="Red" settings={settings} onUpdate={onUpdate} />
      <WipLimitRow color="blue" label="Blue" settings={settings} onUpdate={onUpdate} />
      <WipLimitRow color="green" label="Green" settings={settings} onUpdate={onUpdate} />
      <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border-hairline)" }}>
        <Btn small onClick={onRestart}>Restart Game</Btn>
      </div>
    </div>
  );
}
