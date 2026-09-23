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
        <span className="hidden text-sm font-medium text-brand-sky-bright/90 sm:inline">
          {roleLabel[session.user.role] ?? session.user.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-brand-sky px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-sky-dark"
    >
      Sign in
    </Link>
  );
}
