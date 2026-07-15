import Image from "next/image";
import Link from "next/link";
import FooterPortals from "./FooterPortals";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-brand-navy pt-px">
      {/* Gold gradient top border */}
      <div className="gradient-gold-line" />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/no_bgLogo.png"
                alt="HealthCapsule"
                width={180}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Verified doctors, live schedules, and trusted care across
              Chattogram. One platform for every step of care.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white/70">
              🇧🇩 Made in Chattogram
            </p>
          </div>

          {/* Directory column */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
              Directory
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link
                  href="/doctors"
                  className="transition hover:text-brand-sky-bright"
                >
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link
                  href="/healthcares"
                  className="transition hover:text-brand-sky-bright"
                >
                  Healthcare Providers
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=cardiology"
                  className="transition hover:text-brand-sky-bright"
                >
                  Cardiologists
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=neurology"
                  className="transition hover:text-brand-sky-bright"
                >
                  Neurologists
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors?specialty=gynecology"
                  className="transition hover:text-brand-sky-bright"
                >
                  Gynecologists
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals column */}
          <FooterPortals />

          {/* Legal column */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
              Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Data Protection</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">
            © {currentYear} HealthCapsule. All rights reserved.
          </p>
          <div className="flex gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-white/70">
              HIPAA-Ready
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-white/70">
              SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
