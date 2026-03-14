"use client";

import { useAuth } from "@/hooks/use-auth";
import { Link } from "@/i18n/navigation";

export function UserNav() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-[11px] font-bold px-4 py-2 min-h-[36px] rounded-lg no-underline transition-all inline-flex items-center"
        style={{
          background: "rgba(59,130,246,0.1)",
          color: "#3b82f6",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        Log In
      </Link>
    );
  }

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold" style={{ color: "var(--text-tertiary)" }}>
        {displayName}
      </span>
      <button
        onClick={signOut}
        className="text-[11px] font-bold px-3 py-2 min-h-[36px] rounded-lg cursor-pointer border-none transition-all"
        style={{ background: "var(--bg-interactive)", color: "var(--text-muted)" }}
      >
        Sign Out
      </button>
    </div>
  );
}
