"use client";

interface TotalAgeIndicatorProps {
  totalAge: number;
  targetAge: number;
}

export function TotalAgeIndicator({ totalAge, targetAge }: TotalAgeIndicatorProps) {
  const ratio = targetAge > 0 ? totalAge / targetAge : 0;
  const isOver = ratio > 1;
  const isWarning = ratio > 0.8 && !isOver;

  const color = isOver ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const barWidth = Math.min(100, ratio * 100);

  return (
    <div
      className="rounded-xl px-4 py-3 mb-3"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          Total Work Item Age
        </div>
        <div className="text-sm font-extrabold font-mono" style={{ color }}>
          {totalAge} <span className="text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>/ {targetAge} target</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(100,116,139,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barWidth}%`, background: color }}
        />
      </div>
      <div className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
        {isOver
          ? "Over target! Stop starting, focus on finishing."
          : isWarning
          ? "Approaching target. Be selective about starting new work."
          : "Within target. Good flow control."}
      </div>
    </div>
  );
}
