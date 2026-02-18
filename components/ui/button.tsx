"use client";

import { ReactNode } from "react";

interface BtnProps {
  onClick?: () => void;
  children: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  small?: boolean;
}

export function Btn({ onClick, children, primary, disabled, small }: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-[10px] font-bold transition-all duration-250 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        padding: small ? "7px 14px" : primary ? "11px 28px" : "11px 20px",
        border: primary ? "none" : "2px solid var(--border-subtle)",
        background: primary
          ? disabled
            ? "var(--border-disabled)"
            : "linear-gradient(135deg, #3b82f6, #6366f1)"
          : "transparent",
        color: primary ? "#fff" : "var(--text-secondary)",
        fontSize: small ? 12 : 14,
        boxShadow: primary && !disabled ? "0 4px 14px rgba(59,130,246,0.2)" : "none",
      }}
    >
      {children}
    </button>
  );
}
