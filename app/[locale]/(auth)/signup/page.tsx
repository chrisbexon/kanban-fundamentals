"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-faint)" }}
        >
          <div className="text-4xl mb-4">&#9989;</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Account Created!</h1>
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
            Check your email to confirm your account, then log in.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold no-underline"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            Go to Login
          </Link>
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
          <h1 className="text-xl font-extrabold m-0" style={{ color: "var(--text-primary)" }}>Create Account</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Start your Kanban Fundamentals training</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--bg-interactive)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              placeholder="Your name"
            />
          </div>
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
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--bg-interactive)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              placeholder="Min 6 characters"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-bold" style={{ color: "#3b82f6" }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
