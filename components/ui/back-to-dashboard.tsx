"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function BackToDashboard() {
  const pathname = usePathname();
  const t = useTranslations("common");
  if (!pathname?.startsWith("/lessons/")) return null;

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 text-[11px] font-medium no-underline mb-2 py-1.5 px-2.5 -ml-2 rounded-lg transition-colors min-h-[36px] hover:bg-[var(--bg-surface)] focus:bg-[var(--bg-surface)]"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
      onFocus={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
      onBlur={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      &larr; {t("backToDashboard")}
    </Link>
  );
}
