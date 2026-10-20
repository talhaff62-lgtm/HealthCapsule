"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function FooterPortals() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
          Portals
        </h4>
        <p className="mt-4 text-sm text-white/50">Loading...</p>
      </div>
    );
  }

  const isAuthenticated = status === "authenticated" && session?.user;
  const role = session?.user?.role;

  const heading = isAuthenticated ? "Portals" : "Join";

  return (
    <div>
      <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
        {heading}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">
        {!isAuthenticated ? (
          <>
            <li>
              <Link
                href="/login"
                className="transition hover:text-brand-sky-bright"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/register?type=doctor"
                className="transition hover:text-brand-sky-bright"
              >
                Register as Doctor
              </Link>
            </li>
            <li>
              <Link
                href="/register?type=facility"
                className="transition hover:text-brand-sky-bright"
              >
                Register Hospital / Diagnostic
              </Link>
            </li>
          </>
        ) : (
          <>
            {role === "ADMIN" && (
              <>
                <li>
                  <Link
                    href="/admin"
                    className="transition hover:text-brand-sky-bright"
                  >
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/doctor"
                    className="transition hover:text-brand-sky-bright"
                  >
                    Doctor Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/facility"
                    className="transition hover:text-brand-sky-bright"
                  >
                    Facility Portal
                  </Link>
                </li>
              </>
            )}
            {role === "DOCTOR" && (
              <li>
                <Link
                  href="/portal/doctor"
                  className="transition hover:text-brand-sky-bright"
                >
                  Doctor Portal
                </Link>
              </li>
            )}
            {role === "FACILITY_ADMIN" && (
              <li>
                <Link
                  href="/portal/facility"
                  className="transition hover:text-brand-sky-bright"
                >
                  Facility Portal
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="transition hover:text-brand-sky-bright"
              >
                Sign Out
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
