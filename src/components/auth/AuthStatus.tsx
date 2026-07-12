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
        <span className="hidden text-sm text-brand-muted sm:inline">
          {session.user.role === "ADMIN" ? "Admin" : "Doctor"}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-status-error px-3 py-1.5 text-sm font-medium text-status-error hover:bg-status-error/5"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy"
    >
      Sign in
    </Link>
  );
}
