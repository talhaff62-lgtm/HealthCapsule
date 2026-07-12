"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Heart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/doctors", label: "Find Doctors" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gray bg-brand-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal text-white">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <span className="font-serif text-xl font-bold text-brand-teal sm:text-2xl">
            HealthCapsule
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium text-brand-slate">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden transition sm:inline-block ${
                  active
                    ? "text-brand-teal"
                    : "text-brand-slate hover:text-brand-teal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <AuthStatus />
        </div>
      </nav>
    </header>
  );
}
