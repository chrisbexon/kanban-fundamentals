"use client";

import type { Worker } from "@/types/wip-game";
import { WorkerToken } from "./worker-token";

interface WorkerPoolProps {
  workers: Worker[];
  selectedWorkerId: string | null;
  onSelectWorker: (id: string) => void;
  onUnassignWorker: (id: string) => void;
  disabled: boolean;
}

export function WorkerPool({ workers, selectedWorkerId, onSelectWorker, onUnassignWorker, disabled }: WorkerPoolProps) {
  return (
    <div
      className="rounded-xl p-3.5 mb-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2.5 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Workers
        <span className="text-[9px] font-normal normal-case tracking-normal ml-auto" style={{ color: "var(--text-muted)" }}>
          {disabled ? "Resolve to continue" : "Select a worker, then click an item"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {workers.map((w) => (
          <WorkerToken
            key={w.id}
            worker={w}
            selected={!disabled && selectedWorkerId === w.id}
            onClick={() => !disabled && onSelectWorker(w.id)}
            onUnassign={() => !disabled && onUnassignWorker(w.id)}
          />
        ))}
      </div>
    </div>
  );
}
