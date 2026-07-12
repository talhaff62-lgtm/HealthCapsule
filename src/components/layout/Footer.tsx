import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-brand-navy py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gold text-brand-navy">
                <span className="h-3 w-3 rounded-full bg-brand-navy" />
              </span>
              <span className="font-serif text-lg font-semibold text-white">
                HealthCapsule
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-brand-navy-muted">
              Verified doctors, live schedules, and trusted care across Chattogram.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Directory
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-brand-navy-muted">
              <li>
                <Link href="/doctors" className="transition hover:text-brand-gold">
                  Find Doctors
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Portals
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-brand-navy-muted">
              <li>
                <Link href="/portal/doctor" className="transition hover:text-brand-gold">
                  Doctor Portal
                </Link>
              </li>
              <li>
                <Link href="/portal/admin" className="transition hover:text-brand-gold">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <p className="mt-4 text-sm text-brand-navy-muted">
              © {currentYear} HealthCapsule. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
