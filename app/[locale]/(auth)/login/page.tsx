"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
        >
          <div className="text-4xl mb-4">&#9993;</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Check Your Email</h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            We sent a login link to <strong>{email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
      >
        <div className="text-center mb-6">
          <div className="text-[10px] font-bold uppercase tracking-[3px] mb-1" style={{ color: "var(--text-dimmer)" }}>
            Genius Teams
          </div>
          <h1 className="text-xl font-extrabold m-0" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Log in to continue your training</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--bg-interactive)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--bg-interactive)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer border-none"
            style={{ background: "#3b82f6", color: "#fff", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px" style={{ background: "var(--border-faint)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-faint)" }} />
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer"
            style={{
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Send Magic Link
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold" style={{ color: "#3b82f6" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
