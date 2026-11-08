"use client";

import { useLanguage } from "@/components/language-provider";

interface LanguageSwitcherProps {
  dark?: boolean;
}

export default function LanguageSwitcher({ dark = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`relative flex h-9 w-fit items-center rounded-full border p-1 transition-colors duration-300 ${
        dark
          ? "border-white/20 bg-white/10 backdrop-blur-sm"
          : "border-ink/10 bg-brand-mist"
      }`}
    >
      {/* Sliding thumb — visual only, sits behind the labels */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-sky shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
          locale === "bn" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`relative z-10 w-14 rounded-full px-0 py-1.5 text-center text-xs font-medium transition-colors duration-300 ${
          locale === "en"
            ? "text-white"
            : dark
            ? "text-white/70 hover:text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        aria-pressed={locale === "bn"}
        className={`relative z-10 w-14 rounded-full px-0 py-1.5 text-center text-xs font-medium transition-colors duration-300 ${
          locale === "bn"
            ? "text-white"
            : dark
            ? "text-white/70 hover:text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}