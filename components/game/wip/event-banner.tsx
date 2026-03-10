"use client";

import type { GameEvent } from "@/types/wip-game";
import { Btn } from "@/components/ui/button";

interface EventBannerProps {
  event: GameEvent;
  onAcknowledge: () => void;
}

export function EventBanner({ event, onAcknowledge }: EventBannerProps) {
  const isSecurity = event.type === "security";
  const color = isSecurity ? "#ef4444" : "#8b5cf6";
  const bgColor = isSecurity ? "239,68,68" : "139,92,246";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onAcknowledge}
    >
      <div
        className="pop-in rounded-2xl p-6 max-w-md mx-4 flex flex-col items-center text-center gap-4"
        style={{
          background: "var(--bg-base, #1a1a2e)",
          border: `2px solid rgba(${bgColor}, 0.4)`,
          boxShadow: `0 0 40px rgba(${bgColor}, 0.15)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `rgba(${bgColor}, 0.12)` }}
        >
          {isSecurity ? "\uD83D\uDD12" : "\uD83D\uDCCB"}
        </div>
        <div>
          <div className="text-lg font-bold mb-2" style={{ color }}>
            {isSecurity ? "Security Patch Required!" : "Compliance Audit Incoming!"}
          </div>
          <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A new <strong style={{ color }}>{event.type}</strong> work item has been added to your{" "}
            <strong style={{ color: "var(--text-primary)" }}>Backlog</strong>.
            It must reach <strong style={{ color: "var(--text-primary)" }}>Done</strong> by{" "}
            <strong style={{ color }}>Day {event.dueDay}</strong>.
            Prioritise accordingly.
          </div>
        </div>
        <Btn primary onClick={onAcknowledge}>Got it</Btn>
      </div>
    </div>
  );
}
