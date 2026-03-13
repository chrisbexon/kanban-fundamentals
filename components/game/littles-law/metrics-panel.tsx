"use client";

interface MetricsPanelProps {
  carsInSystem: number;
  avgCycleTime: number;
  throughputPerMin: number;
  littlesLaw: { wip: number; throughput: number; cycleTime: number };
  totalArrivals: number;
  totalDepartures: number;
  simTimeMinutes: number;
}

function Metric({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div
      className="rounded-xl py-2.5 px-3 text-center min-w-[80px]"
      style={{ background: `${color}08`, border: `1px solid ${color}15` }}
    >
      <div className="text-xl font-extrabold font-mono" style={{ color }}>
        {value}
        {unit && <span className="text-[10px] font-normal ml-0.5" style={{ color: "var(--text-tertiary)" }}>{unit}</span>}
      </div>
      <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

export function MetricsPanel({
  carsInSystem, avgCycleTime, throughputPerMin, littlesLaw,
  totalArrivals, totalDepartures, simTimeMinutes,
}: MetricsPanelProps) {
  // Little's Law check: WIP ≈ Throughput × Cycle Time
  const computed = littlesLaw.throughput * littlesLaw.cycleTime;
  const computedRounded = Math.round(computed * 10) / 10;

  return (
    <div aria-live="polite" aria-atomic="true">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
        <Metric label="Cars in System" value={carsInSystem} color="#8b5cf6" />
        <Metric label="Avg Cycle Time" value={avgCycleTime} unit="s" color="#f59e0b" />
        <Metric label="Throughput" value={throughputPerMin} unit="/min" color="#22c55e" />
        <Metric label="Arrivals" value={totalArrivals} color="#3b82f6" />
        <Metric label="Departed" value={totalDepartures} color="#22c55e" />
      </div>

      {/* Little's Law formula */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap items-center justify-center gap-3"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
      >
        <div className="text-xs font-bold text-amber-400">Little&apos;s Law</div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="font-bold text-amber-300" title="Avg Cycle Time">{avgCycleTime}s</span>
          <span style={{ color: "var(--text-muted)" }}>=</span>
          <span className="font-bold text-violet-400" title="Avg WIP">{littlesLaw.wip}</span>
          <span style={{ color: "var(--text-muted)" }}>&divide;</span>
          <span className="font-bold text-emerald-400" title="Avg Throughput">{littlesLaw.throughput}/s</span>
        </div>
        {littlesLaw.throughput > 0 && (
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            ({littlesLaw.wip} &divide; {littlesLaw.throughput} = {computedRounded}s)
          </div>
        )}
        <div className="text-[9px] w-full text-center mt-1" style={{ color: "var(--text-muted)" }}>
          Avg Cycle Time = Avg Work in Progress &divide; Avg Throughput
        </div>
      </div>
    </div>
  );
}
