"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  lessonContext?: string;
}

export function ChatWidget({ lessonContext }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, lessonContext }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lessonContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 rounded-2xl overflow-hidden flex flex-col"
          style={{
            width: 380,
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            background: "var(--bg-page-mid, #0d1424)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-faint)", background: "rgba(59,130,246,0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              ?
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Training Assistant</div>
              <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>Ask anything about Kanban</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer text-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col gap-2 mt-4">
                <div className="text-xs text-center mb-2" style={{ color: "var(--text-muted)" }}>
                  Ask me anything about the training material
                </div>
                {[
                  "What is Little's Law?",
                  "Why do WIP limits matter?",
                  "How does Monte Carlo forecasting work?",
                  "What does right-sizing mean?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const userMsg: Message = { role: "user", content: q };
                      setMessages([userMsg]);
                      setLoading(true);
                      setError(null);
                      fetch("/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messages: [userMsg], lessonContext }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.error) throw new Error(data.error);
                          setMessages([userMsg, { role: "assistant", content: data.message }]);
                        })
                        .catch((err) => setError(err.message))
                        .finally(() => setLoading(false));
                    }}
                    className="text-left text-[11px] px-3 py-2 rounded-lg border-none cursor-pointer transition-all"
                    style={{
                      background: "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(59,130,246,0.12)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.06)"; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="rounded-xl px-3 py-2 text-[12px] leading-relaxed max-w-[85%]"
                  style={{
                    background: m.role === "user"
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: m.role === "user"
                      ? "1px solid rgba(59,130,246,0.25)"
                      : "1px solid var(--border-faint)",
                    color: "var(--text-secondary)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-xl px-3 py-2 text-[12px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-faint)", color: "var(--text-muted)" }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-lg px-3 py-2 text-[11px]"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="px-3 py-2.5 flex gap-2 flex-shrink-0"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 rounded-lg px-3 py-2 text-xs border-none outline-none disabled:opacity-50"
              style={{
                background: "var(--bg-input, rgba(255,255,255,0.06))",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-lg px-3 py-2 text-xs font-bold border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
              }}
            >
              Send
            </button>
          </div>

          {/* WhatsApp link */}
          <div
            className="px-3 py-2 text-center flex-shrink-0"
            style={{ borderTop: "1px solid var(--border-faint)", background: "rgba(34,197,94,0.03)" }}
          >
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>
              Need human help?{" "}
              <span style={{ color: "#22c55e", fontWeight: 600, cursor: "pointer" }}>
                Join the WhatsApp learning community
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full border-none cursor-pointer flex items-center justify-center transition-all"
        style={{
          background: open
            ? "rgba(99,102,241,0.2)"
            : "linear-gradient(135deg, #3b82f6, #6366f1)",
          boxShadow: open ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
          color: "#fff",
          fontSize: 20,
        }}
        title={open ? "Close chat" : "Ask a question"}
      >
        {open ? "\u00D7" : "?"}
      </button>
    </>
  );
}
