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
    <div className="ml-2 flex items-center gap-0.5 rounded-full border border-white/20 bg-white/5 p-0.5">
      <button
        type="button"
        onClick={() => switchLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          lang === "en" ? "bg-brand-sky-bright text-brand-navy shadow-sm" : "text-white/60 hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => switchLang("bn")}
        aria-pressed={lang === "bn"}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          lang === "bn" ? "bg-brand-sky-bright text-brand-navy shadow-sm" : "text-white/60 hover:text-white"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
