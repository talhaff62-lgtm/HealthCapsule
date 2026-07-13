"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-sm text-white/70 animate-pulse">Loading...</span>
    );
  }

  if (status === "authenticated" && session?.user) {
    const roleLabel: Record<string, string> = {
      ADMIN: "Admin",
      DOCTOR: "Doctor",
      FACILITY_ADMIN: "Facility Admin",
      PATIENT: "Patient",
    };

    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-brand-gold-light/90 font-medium sm:inline">
          {roleLabel[session.user.role] ?? session.user.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg bg-status-emergency px-3 py-1.5 text-xs font-semibold text-white hover:bg-status-emergency/90 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-navy shadow-sm transition hover:bg-brand-gold-light hover:scale-102"
    >
      Sign in
    </Link>
  );
}
