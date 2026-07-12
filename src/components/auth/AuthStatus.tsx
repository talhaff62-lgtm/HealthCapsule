"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-sm text-brand-muted">Loading...</span>
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-brand-navy-muted sm:inline">
          {session.user.role === "ADMIN" ? "Admin" : "Doctor"}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-status-emergency-light bg-status-emergency-light/10 px-3 py-1.5 text-sm font-medium text-status-emergency hover:bg-status-emergency-light/20"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-navy shadow-sm transition hover:bg-brand-gold-light"
    >
      Sign in
    </Link>
  );
}
