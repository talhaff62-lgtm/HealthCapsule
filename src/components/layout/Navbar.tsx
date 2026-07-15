"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

type NavLink = { href: string; label: string };

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/healthcares", label: "Healthcares" },
  { href: "/doctors", label: "Doctors" },
];

const portalLinksByRole: Record<string, NavLink> = {
  ADMIN: { href: "/portal/admin", label: "Admin Panel" },
  DOCTOR: { href: "/portal/doctor", label: "Doctor Panel" },
  FACILITY_ADMIN: { href: "/portal/facility", label: "Hospital Panel" },
};

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const role = session?.user?.role;
  const portalLink = role ? portalLinksByRole[role] : undefined;
  const navLinks: NavLink[] = portalLink
    ? [...publicLinks, portalLink]
    : publicLinks;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-brand-navy/95 backdrop-blur-md text-white transition-shadow duration-300 ${
        scrolled
          ? "border-brand-sky/20 shadow-[0_4px_32px_rgba(0,0,0,0.35)]"
          : "border-white/10"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Two-tone capsule logo mark */}
          <Image
            src="/images/no_bgLogo.png"
            alt="HealthCapsule"
            width={160}
            height={40}
            className="h-8 w-auto sm:h-10"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition ${
                  active
                    ? "text-brand-sky-bright"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-sky-bright" />
                )}
              </Link>
            );
          })}
          <AuthStatus />
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-50 bg-brand-navy/98 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-6 py-6 text-base font-medium">
            {navLinks.map((link, i) => {
              const active = isActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`border-b border-white/10 py-4 transition ${
                    active
                      ? "text-brand-sky-bright"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-6 flex flex-col gap-3">
              <div className="pt-2">
                <AuthStatus />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
