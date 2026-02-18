import { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        background: "linear-gradient(170deg, var(--bg-page-start) 0%, var(--bg-page-mid) 40%, var(--bg-page-end) 100%)",
        color: "var(--text-primary)",
      }}
    >
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="max-w-[1140px] mx-auto px-4 py-5">
        {children}
      </div>
    </div>
  );
}
