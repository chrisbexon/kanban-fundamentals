import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
  accent?: string;
}

export function Card({ children, style: s, glow, accent }: CardProps) {
  return (
    <div
      className={glow ? "anim-glow" : ""}
      style={{
        background: accent ? `rgba(${accent}, 0.04)` : "var(--bg-surface)",
        borderRadius: 14,
        padding: "18px 20px",
        border: accent
          ? `1px solid rgba(${accent}, 0.12)`
          : "1px solid var(--border-faint)",
        ...s,
      }}
    >
      {children}
    </div>
  );
}
