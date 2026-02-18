export function Header() {
  return (
    <div className="fade-up flex items-center gap-3.5 mb-1">
      <div
        className="w-2 h-10 rounded flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #f59e0b, #3b82f6, #10b981, #8b5cf6)" }}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--text-dimmer)" }}>
          Kanban Training &middot; Lesson 1
        </div>
        <h1
          className="text-[clamp(20px,4vw,26px)] font-extrabold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: "linear-gradient(135deg, var(--text-heading-from), var(--text-heading-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          The Penny Game: Batch Size &amp; Flow
        </h1>
      </div>
    </div>
  );
}
