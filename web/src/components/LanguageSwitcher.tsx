"use client";

import { useEffect, useState } from "react";

function getLang(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return "en";
  const value = decodeURIComponent(match[1]);
  const parts = value.split("/").filter(Boolean); // e.g. ["en", "bn"]
  return parts[parts.length - 1] || "en";
}

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    setLang(getLang());
  }, []);

  const switchLang = (newLang: string) => {
    document.cookie = `googtrans=/en/${newLang}; path=/`;
    document.cookie = `googtrans=/en/${newLang}; path=/; domain=.${window.location.hostname}`;
    setLang(newLang);
    window.location.reload();
  };

  return (
    <div className="relative flex h-9 w-fit items-center rounded-full border border-ink/10 bg-brand-mist p-1">
      {/* Sliding thumb — visual only, sits behind the labels */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-sky shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
          lang === "bn" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      <button
        type="button"
        onClick={() => switchLang("en")}
        aria-pressed={lang === "en"}
        className={`relative z-10 w-14 rounded-full px-0 py-1.5 text-center text-xs font-medium transition-colors duration-300 ${
          lang === "en" ? "text-white" : "text-ink-muted hover:text-ink"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => switchLang("bn")}
        aria-pressed={lang === "bn"}
        className={`relative z-10 w-14 rounded-full px-0 py-1.5 text-center text-xs font-medium transition-colors duration-300 ${
          lang === "bn" ? "text-white" : "text-ink-muted hover:text-ink"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
