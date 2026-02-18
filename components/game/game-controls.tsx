"use client";

interface GameControlsProps {
  batchSize: number;
  onSelectBatch: (bs: number) => void;
  customBatch: string;
  onCustomBatchChange: (v: string) => void;
  onCustomBatchApply: () => void;
  running: boolean;
  allDone: boolean;
  tick: number;
  speed: number;
  onSpeedChange: (spd: number) => void;
  onStep: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function GameControls({
  batchSize,
  onSelectBatch,
  customBatch,
  onCustomBatchChange,
  onCustomBatchApply,
  running,
  allDone,
  tick,
  speed,
  onSpeedChange,
  onStep,
  onStart,
  onPause,
  onReset,
}: GameControlsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 items-center p-3 mb-3.5 rounded-xl"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      <span className="text-[9px] font-bold uppercase tracking-[1.2px]" style={{ color: "var(--text-muted)" }}>Batch</span>
      <div className="flex gap-1 flex-wrap">
        {[20, 10, 5, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => onSelectBatch(s)}
            disabled={running}
            className="py-1.5 px-3.5 rounded-lg font-bold text-[13px] font-mono min-w-[40px] text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              border: batchSize === s ? "2px solid #3b82f6" : "2px solid var(--border-subtle)",
              background: batchSize === s ? "rgba(59,130,246,0.1)" : "transparent",
              color: batchSize === s ? "#60a5fa" : "var(--text-muted)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        <input
          type="number"
          min="1"
          max="20"
          placeholder="1-20"
          value={customBatch}
          onChange={(e) => onCustomBatchChange(e.target.value)}
          disabled={running}
          className="w-[52px] py-1.5 px-2 rounded-lg border-2 bg-transparent text-[13px] font-mono outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        />
        <button
          onClick={onCustomBatchApply}
          disabled={running || !customBatch}
          className="py-1.5 px-2.5 rounded-[7px] border-2 bg-transparent text-[9px] font-bold cursor-pointer uppercase"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          Go
        </button>
      </div>
      <div className="flex-[1_0_100%] h-0" />
      <div className="flex gap-1.5 items-center flex-1 justify-end flex-wrap">
        <span className="text-[8px] font-bold uppercase" style={{ color: "var(--text-dimmer)" }}>Speed</span>
        <input
          type="range"
          min={40}
          max={650}
          step={20}
          value={690 - speed}
          onChange={(e) => onSpeedChange(690 - parseInt(e.target.value))}
          className="w-16 accent-blue-500"
        />
        <button
          onClick={onStep}
          disabled={running || allDone}
          className="py-1.5 px-3 rounded-lg border-2 bg-transparent text-[11px] font-bold font-mono cursor-pointer disabled:cursor-not-allowed"
          style={{ borderColor: "var(--border-subtle)", color: running || allDone ? "var(--text-faint)" : "var(--text-tertiary)" }}
        >
          Step &#9654;
        </button>
        {!running ? (
          <button
            onClick={onStart}
            className="py-[7px] px-5 rounded-[10px] border-none text-white font-bold text-[13px] cursor-pointer transition-shadow duration-200"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 3px 12px rgba(59,130,246,0.2)" }}
          >
            {allDone ? "\u25B6 New Run" : tick > 0 ? "\u25B6 Resume" : "\u25B6 Start"}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="py-[7px] px-5 rounded-[10px] border-none font-bold text-[13px] cursor-pointer"
            style={{ background: "var(--bg-pause)", color: "var(--text-tertiary)" }}
          >
            &#9208; Pause
          </button>
        )}
        <button
          onClick={onReset}
          className="py-1.5 px-3.5 rounded-lg border bg-transparent font-semibold text-[11px] cursor-pointer"
          style={{ borderColor: "var(--border-subtle)", color: "var(--border-disabled)" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
