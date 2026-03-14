"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav aria-label="Language selection" className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          aria-label={localeNames[l]}
          aria-current={l === locale ? "true" : undefined}
          className="text-[11px] font-bold min-w-[36px] min-h-[36px] px-2 py-1.5 rounded-lg cursor-pointer border-none transition-all"
          style={{
            background: l === locale ? "rgba(59,130,246,0.15)" : "transparent",
            color: l === locale ? "#3b82f6" : "var(--text-muted)",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
