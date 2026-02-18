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
      className="pop-in rounded-xl p-4 mb-3 flex items-start gap-3"
      style={{
        background: `rgba(${bgColor}, 0.06)`,
        border: `1px solid rgba(${bgColor}, 0.2)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `rgba(${bgColor}, 0.12)` }}
      >
        {isSecurity ? "\uD83D\uDD12" : "\uD83D\uDCCB"}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold mb-0.5" style={{ color }}>
          {isSecurity ? "Security Patch Required!" : "Compliance Audit Incoming!"}
        </div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          A new {event.type} work item has been added to your backlog.
          It must reach <strong style={{ color: "var(--text-primary)" }}>Done</strong> by{" "}
          <strong style={{ color }}>Day {event.dueDay}</strong>.
          Prioritise accordingly.
        </div>
      </div>
      <Btn small onClick={onAcknowledge}>Got it</Btn>
    </div>
  );
}
