"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BackToDashboard() {
  const pathname = usePathname();
  if (!pathname?.startsWith("/lessons/")) return null;

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 text-[11px] font-medium no-underline mb-2 py-1 px-2 -ml-2 rounded-lg transition-colors"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
    >
      &larr; Dashboard
    </Link>
  );
}
