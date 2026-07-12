"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-gray bg-brand-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal sm:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
            HealthCapsule
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium text-brand-slate">
          <Link href="/doctors" className="hover:text-brand-teal">
            Find Doctors
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand-teal px-4 py-2 text-white hover:bg-brand-navy"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
