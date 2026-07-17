"use client";

import { useState } from "react";

function getLang(): string {
  const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
  return match ? match[1] : "en";
}

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<string>(() =>
    typeof document === "undefined" ? "en" : getLang()
  );

  const switchLang = (newLang: string) => {
    document.cookie = `googtrans=/en/${newLang}; path=/`;
    document.cookie = `googtrans=/en/${newLang}; path=/; domain=.${window.location.hostname}`;
    setLang(newLang);
    window.location.reload();
  };

  return (
    <div className="ml-2 pl-3 border-l border-white/20 flex items-center gap-1">
      <button
        type="button"
        onClick={() => switchLang("en")}
        aria-pressed={lang === "en"}
        className={`text-sm font-medium px-2 py-1 rounded transition ${
          lang === "en" ? "text-brand-sky-bright" : "text-white/70 hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => switchLang("bn")}
        aria-pressed={lang === "bn"}
        className={`text-sm font-medium px-2 py-1 rounded transition ${
          lang === "bn" ? "text-brand-sky-bright" : "text-white/70 hover:text-white"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
