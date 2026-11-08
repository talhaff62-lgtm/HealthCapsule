"use client";

import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/client-fetch";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { Eyebrow } from "./ui";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/components/language-provider";

type NavLink = { href: string; labelKey: string };

type PanelShellProps = {
  panelLabel: string;
  homeHref: string;
  navLinks: NavLink[];
  title?: string;
  userName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function PanelShell({
  panelLabel,
  homeHref,
  navLinks,
  title,
  userName,
  contentClassName,
  children,
}: PanelShellProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
      await signOut({ redirect: false });
      router.replace("/login");
    } catch {
      setSigningOut(false);
    }
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  const renderIdentity = () =>
    userName ? (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-bold text-white shrink-0">
          {initials}
        </div>
        <span className="text-sm font-medium text-white/70 truncate">
          {userName}
        </span>
      </div>
    ) : null;

  const renderFooterLinks = () => (
    <>
      <Link
        href="/"
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
      >
        <ExternalLink className="h-4 w-4" />
        <span>{t("shell.panel.viewSite")}</span>
      </Link>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        <span>{signingOut ? t("shell.panel.signingOut") : t("shell.panel.signOut")}</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-brand-cloud">
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-brand-navy px-4 py-3 text-white lg:hidden">
        <Link
          href={homeHref}
          className="font-serif text-lg font-semibold text-white"
        >
          {t("shell.panel.capsule")}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 w-10 grid place-items-center rounded-lg hover:bg-brand-navy-light text-white transition-colors"
          aria-label={t("shell.panel.openMenu")}
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-brand-navy/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-brand-navy flex flex-col p-5 lg:hidden transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full invisible pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link
            href={homeHref}
            className="font-serif text-lg font-semibold text-white"
          >
            {t("shell.panel.capsule")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-10 w-10 grid place-items-center rounded-lg hover:bg-brand-navy-light text-white transition-colors"
            aria-label={t("shell.panel.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-brand-navy-light text-white border-l-2 border-brand-sky"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          {renderIdentity()}
          {renderFooterLinks()}
        </div>
      </div>

      {/* Desktop Fixed Left Rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-brand-navy lg:flex">
        <div className="p-6 border-b border-white/10">
          <Eyebrow className="text-white/50 block">{panelLabel}</Eyebrow>
          <div className="mt-1 font-serif text-xl font-semibold text-white">
            {t("shell.panel.capsule")}
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 mx-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-brand-navy-light text-white border-l-2 border-brand-sky"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          {renderIdentity()}
          {renderFooterLinks()}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-60">
        <div className={`mx-auto p-4 sm:p-6 lg:p-8 ${contentClassName ?? "max-w-6xl"}`}>
          {title ? (
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
                {title}
              </h1>
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
