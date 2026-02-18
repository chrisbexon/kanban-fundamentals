"use client";

interface LessonNavProps {
  step: number;
  labels: string[];
  onNav: (step: number) => void;
  canAdv: boolean;
}

export function LessonNav({ step, labels, onNav, canAdv }: LessonNavProps) {
  return (
    <div className="flex items-center gap-0 pb-3.5 mb-[18px] border-b overflow-x-auto" style={{ borderColor: "var(--border-faint)" }}>
      {labels.map((l, i) => {
        const act = i === step;
        const dn = i < step;
        const ok = i <= step || (i === step + 1 && canAdv);
        return (
          <div key={i} className="flex items-center min-w-fit" style={{ flex: i < labels.length - 1 ? 1 : "none" }}>
            <button
              onClick={() => ok && onNav(i)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border-none whitespace-nowrap transition-all duration-250"
              style={{
                background: act ? "rgba(59,130,246,0.12)" : "transparent",
                cursor: ok ? "pointer" : "default",
                opacity: ok ? 1 : 0.35,
              }}
            >
              <div
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold font-mono flex-shrink-0 transition-all duration-300"
                style={{
                  background: dn ? "#22c55e" : act ? "#3b82f6" : "var(--bg-nav-inactive)",
                  color: dn || act ? "#fff" : "var(--text-muted)",
                  border: act ? "2px solid #60a5fa" : dn ? "2px solid #22c55e" : "2px solid var(--border-nav-inactive)",
                }}
              >
                {dn ? "\u2713" : i + 1}
              </div>
              <span
                className="text-xs transition-colors duration-200"
                style={{
                  fontWeight: act ? 700 : 500,
                  color: act ? "var(--text-primary)" : dn ? "var(--text-secondary)" : "var(--text-muted)",
                }}
              >
                {l}
              </span>
            </button>
            {i < labels.length - 1 && (
              <div
                className="h-0.5 mx-0.5 min-w-3 rounded-sm transition-colors duration-400"
                style={{ flex: 1, background: dn ? "rgba(34,197,94,0.3)" : "var(--border-hairline)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
