"use client";

import Link from "next/link";
import FooterPortals from "./FooterPortals";
import { Logo } from "./Logo";
import { useLanguage } from "@/components/language-provider";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-brand-navy text-white">
      {/* Sky→teal top ornament line */}
      <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-brand-sky to-teal" />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Logo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white/70">
              🇧🇩 {t("footer.madeInChattogram")}
            </p>
          </div>

          {/* Directory column */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
              {t("footer.directory")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link
                  href="/doctors"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.findDoctors")}
                </Link>
              </li>
              <li>
                <Link
                  href="/healthcares"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.healthcareProviders")}
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=cardiology"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.cardiologists")}
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=neurology"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.neurologists")}
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=gynecology"
                  className="transition hover:text-brand-sky-bright"
                >
                  {t("footer.gynecologists")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals column */}
          <FooterPortals />

          {/* Legal column */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
              {t("footer.legal")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>{t("footer.privacyPolicy")}</li>
              <li>{t("footer.termsOfService")}</li>
              <li>{t("footer.dataProtection")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">
            {t("footer.copyright", { year: currentYear })}
          </p>
          <a
            href="https://talhadev-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/50 transition-colors hover:text-brand-sky"
          >
            {t("footer.developedBy")}
          </a>
          <div className="flex gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-white/70">
              {t("footer.hipaaReady")}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-white/70">
              {t("footer.sslEncrypted")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
