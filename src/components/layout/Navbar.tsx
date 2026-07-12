"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/doctors", label: "Find Doctors" },
    { href: "/portal/doctor", label: "Doctor Portal" },
    { href: "/portal/admin", label: "Admin Portal" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-brand-navy">
            <span className="flex h-3.5 w-3.5 rounded-full bg-brand-navy" />
          </span>
          <span className="font-serif text-xl font-semibold text-white sm:text-2xl">
            HealthCapsule
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  active
                    ? "text-brand-gold"
                    : "text-brand-navy-muted hover:text-white"
                }`}
              >
                {link.label}
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

      {open && (
        <div className="border-t border-white/10 bg-brand-navy px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-base font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2 ${
                  pathname === link.href ? "text-brand-gold" : "text-brand-navy-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <AuthStatus />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
