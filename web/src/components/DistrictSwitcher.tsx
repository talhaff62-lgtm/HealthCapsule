"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type DistrictOption = { name: string; bnName: string | null; slug: string };

export const DISTRICT_COOKIE = "capsule_district";

export default function DistrictSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<DistrictOption[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/districts")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DistrictOption[]) => {
        if (!cancelled) setDistricts(data);
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // current district = first path segment when it matches a known slug
  const current =
    districts?.find((d) => pathname === `/${d.slug}` || pathname.startsWith(`/${d.slug}/`)) ??
    null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = useCallback(
    (slug: string) => {
      setOpen(false);
      document.cookie = `${DISTRICT_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=31536000; samesite=lax`;
      router.push(`/${slug}`);
    },
    [router]
  );

  const label = current
    ? locale === "bn" && current.bnName
      ? current.bnName
      : current.name
    : t("district.choose");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-9 w-fit items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors duration-300 ${
          dark
            ? "border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            : "border-ink/10 bg-brand-mist text-ink hover:bg-white"
        }`}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="max-w-[10rem] truncate">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && districts && districts.length > 0 && (
        <ul
          role="listbox"
          className="absolute right-0 top-11 z-[90] w-56 overflow-hidden rounded-2xl border border-ink/8 bg-white py-1.5 shadow-soft"
        >
          {districts.map((d) => {
            const isCurrent = current?.slug === d.slug;
            return (
              <li key={d.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => choose(d.slug)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    isCurrent
                      ? "bg-brand-mist font-semibold text-brand-sky-dark"
                      : "text-ink hover:bg-brand-mist/60"
                  }`}
                >
                  <span className="truncate">
                    {locale === "bn" && d.bnName ? d.bnName : d.name}
                  </span>
                  {isCurrent && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
