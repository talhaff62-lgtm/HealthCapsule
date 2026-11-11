"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Logo } from "@/components/layout/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DistrictSwitcher from "@/components/DistrictSwitcher";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/components/language-provider";

type NavLink = { href: string; labelKey: string };

const portalLinksByRole: Record<string, NavLink> = {
  ADMIN: { href: "/admin", labelKey: "nav.adminPanel" },
  DOCTOR: { href: "/portal/doctor", labelKey: "nav.doctorPanel" },
  FACILITY_ADMIN: { href: "/portal/facility", labelKey: "nav.facilityPanel" },
};

function getActiveDistrict(pathname: string): string {
  const match = pathname.match(/^\/([a-z0-9-]+)(\/|$)/);
  const first = match ? match[1] : "";
  if (first === "chattogram" || first === "noakhali") {
    return first;
  }
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)capsule_district=([^;]+)/);
    if (m && (decodeURIComponent(m[1]) === "chattogram" || decodeURIComponent(m[1]) === "noakhali")) {
      return decodeURIComponent(m[1]);
    }
  }
  return "chattogram";
}

function isActive(href: string, pathname: string, homeHref: string): boolean {
  if (href === homeHref) {
    return pathname === homeHref || pathname === `${homeHref}/` || pathname === "/";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (pathname?.startsWith("/staff") || pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") return null;

  const currentDistrict = getActiveDistrict(pathname || "/");
  const homeHref = `/${currentDistrict}`;

  const publicLinks: NavLink[] = [
    { href: homeHref, labelKey: "nav.home" },
    { href: `/${currentDistrict}/healthcares`, labelKey: "nav.healthcares" },
    { href: `/${currentDistrict}/doctors`, labelKey: "nav.doctors" },
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/videos", labelKey: "nav.videos" },
  ];

  const role = session?.user?.role;
  const portalLink = role ? portalLinksByRole[role] : undefined;
  const navLinks: NavLink[] = portalLink
    ? [...publicLinks, portalLink]
    : publicLinks;

  const isHome = pathname === "/" || pathname === homeHref || pathname === `${homeHref}/`;
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-500 sm:px-4 sm:pt-4">
        <nav
          className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border px-4 transition-all duration-500 ease-out sm:px-6 ${
            isTransparent
              ? "border-transparent bg-transparent shadow-none"
              : "border-ink/10 bg-white/90 shadow-soft backdrop-blur-xl [backdrop-saturate:1.4] shadow-[0_16px_48px_-16px_rgba(11,31,58,0.28)]"
          }`}
        >
          <Logo size="xs" showTagline={false} />

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href, pathname, homeHref);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 transition-colors duration-300 font-medium ${
                    isTransparent
                      ? active
                        ? "text-brand-sky-light font-semibold drop-shadow-sm"
                        : "text-white drop-shadow-sm hover:text-brand-sky-light"
                      : active
                      ? "text-brand-sky-dark font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <AuthStatus />
            <DistrictSwitcher dark={isTransparent} />
            <LanguageSwitcher dark={isTransparent} />
          </div>

          <div className="relative z-[80] md:hidden">
            <button
              className={`transition-colors duration-300 ${
                menuOpen ? "text-ink" : isTransparent ? "text-white drop-shadow-sm" : "text-ink"
              }`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t("nav.toggleMenu")}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>
      <div aria-hidden className="h-[76px] sm:h-[80px]" />

      {/* Mobile menu overlay */}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-x-0 top-[76px] bottom-0 z-[70] bg-black/60 sm:top-[80px] md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div className="fixed inset-x-3 top-[76px] z-[80] rounded-3xl border border-ink/8 bg-white/95 p-4 shadow-soft backdrop-blur-xl sm:inset-x-4 sm:top-[80px] md:hidden">
              <div className="flex flex-col gap-1 text-base font-medium">
                {navLinks.map((link) => {
                  const active = isActive(link.href, pathname, homeHref);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`py-3 transition ${
                        active
                          ? "text-brand-sky-dark"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
                <div className="mt-6 flex flex-col gap-3">
                  <div className="pt-2">
                    <AuthStatus />
                  </div>
                  <div className="pt-2">
                    <DistrictSwitcher />
                  </div>
                  <div className="pt-2">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
