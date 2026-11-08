"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/components/language-provider";

export default function FooterPortals() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
          {t("footer.portals")}
        </h4>
        <p className="mt-4 text-sm text-white/50">{t("footer.loading")}</p>
      </div>
    );
  }

  const isAuthenticated = status === "authenticated" && session?.user;
  const role = session?.user?.role;

  const heading = isAuthenticated ? t("footer.portals") : t("footer.join");

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
                {t("footer.signIn")}
              </Link>
            </li>
            <li>
              <Link
                href="/register?type=doctor"
                className="transition hover:text-brand-sky-bright"
              >
                {t("footer.registerAsDoctor")}
              </Link>
            </li>
            <li>
              <Link
                href="/register?type=facility"
                className="transition hover:text-brand-sky-bright"
              >
                {t("footer.registerHospital")}
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
                    {t("footer.adminPortal")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/doctor"
                    className="transition hover:text-brand-sky-bright"
                  >
                    {t("footer.doctorPortal")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/facility"
                    className="transition hover:text-brand-sky-bright"
                  >
                    {t("footer.facilityPortal")}
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
                  {t("footer.doctorPortal")}
                </Link>
              </li>
            )}
            {role === "FACILITY_ADMIN" && (
              <li>
                <Link
                  href="/portal/facility"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.facilityPortal")}
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="transition hover:text-brand-sky-bright"
              >
                {t("footer.signOut")}
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
