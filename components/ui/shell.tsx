import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "./theme-toggle";
import { BackToDashboard } from "./back-to-dashboard";
import { UserNav } from "./user-nav";
import { LocaleSwitcher } from "./locale-switcher";

interface ShellProps {
  children: ReactNode;
}

export async function Shell({ children }: ShellProps) {
  const t = await getTranslations("common");
  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        background: "linear-gradient(170deg, var(--bg-page-start) 0%, var(--bg-page-mid) 40%, var(--bg-page-end) 100%)",
        color: "var(--text-primary)",
      }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        style={{ background: "var(--bg-surface-raised)", color: "var(--text-primary)", border: "2px solid #60a5fa" }}
      >
        {t("skipToContent")}
      </a>
      <nav aria-label="Site controls" className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <LocaleSwitcher />
        <UserNav />
        <ThemeToggle />
      </nav>
      <main id="main-content" className="max-w-[1800px] mx-auto px-6 py-3">
        <BackToDashboard />
        {children}
      </main>
    </div>
  );
}
