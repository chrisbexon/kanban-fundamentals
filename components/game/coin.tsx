"use client";

import type { WorkItem, GameStage, WorkState } from "@/types/penny-game";

interface CoinProps {
  item: WorkItem;
  sc: GameStage;
}

export function Coin({ item, sc }: CoinProps) {
  const isW = sc.type === "work";
  const isD = sc.id === "done";
  const c = sc.color;
  const sid = sc.id as WorkState;

  let p = 0;
  let comp = false;
  if (isW) {
    p = item.wr[sid] > 0 ? item.wd[sid] / item.wr[sid] : 0;
    comp = item.wd[sid] >= item.wr[sid];
  }

  let bg: string, bdr: string, tc: string, sh: string;
  if (isD) {
    bg = "linear-gradient(135deg, #fbbf24, #f59e0b)";
    bdr = "2px solid #fbbf24";
    tc = "#1e293b";
    sh = item.jm ? "0 0 16px rgba(251,191,36,0.5)" : "0 0 6px rgba(251,191,36,0.2)";
  } else if (isW && comp) {
    bg = `${c}30`;
    bdr = `2px solid ${c}77`;
    tc = c;
    sh = item.jc ? `0 0 14px ${c}55` : "none";
  } else if (isW && item.working) {
    bg = `linear-gradient(135deg, ${c}dd, ${c}99)`;
    bdr = `2px solid ${c}`;
    tc = "#fff";
    sh = `0 0 12px ${c}44`;
  } else if (isW) {
    bg = "var(--bg-coin-idle)";
    bdr = "2px solid var(--border-coin-idle)";
    tc = "var(--text-coin-idle)";
    sh = "none";
  } else {
    bg = "var(--bg-coin-queue)";
    bdr = "2px solid var(--border-coin-queue)";
    tc = "var(--text-coin-queue)";
    sh = "none";
  }

  const anim = item.jc
    ? "anim-flip-coin"
    : item.jm
    ? "anim-pop-in"
    : "";

  return (
    <div
      className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-[10px] font-bold font-mono relative transition-all duration-300 ${anim}`}
      style={{ background: bg, border: bdr, color: tc, boxShadow: sh }}
    >
      {item.id}
      {isW && !comp && item.wr[sid] > 0 && (
        <svg className="absolute -top-0.5 -left-0.5 w-[46px] h-[46px] -rotate-90 pointer-events-none">
          <circle cx="23" cy="23" r="19" fill="none" stroke={`${c}1a`} strokeWidth="2.5" />
          <circle
            cx="23" cy="23" r="19" fill="none" stroke={c} strokeWidth="2.5"
            strokeDasharray={`${p * 119.4} 119.4`} strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-350 ease-out"
          />
        </svg>
      )}
      {isW && !comp && (
        <div
          className="absolute -bottom-[7px] text-[7px] font-mono font-bold rounded px-[3px] leading-tight"
          style={{ color: item.working ? c : "var(--text-coin-counter-dim)", background: "var(--bg-coin-badge)" }}
        >
          {item.wd[sid]}/{item.wr[sid]}
        </div>
      )}
      {isW && comp && (
        <div
          className="absolute -top-[3px] -right-[3px] w-3 h-3 rounded-full bg-green-500 border-2 flex items-center justify-center text-[6px] text-white"
          style={{ borderColor: "var(--bg-coin-badge)" }}
        >
          {"\u2713"}
        </div>
      )}
    </div>
  );
}
