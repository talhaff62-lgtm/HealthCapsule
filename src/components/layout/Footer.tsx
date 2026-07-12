import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-brand-gray bg-brand-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="text-lg font-bold text-brand-teal" style={{ fontFamily: "var(--font-serif)" }}>
            HealthCapsule
          </Link>
          <p className="text-sm text-brand-muted">
            © {currentYear} HealthCapsule. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-brand-muted">
            <Link href="/doctors" className="hover:text-brand-teal">
              Doctors
            </Link>
            <Link href="/portal/doctor" className="hover:text-brand-teal">
              Doctor Portal
            </Link>
            <Link href="/portal/admin" className="hover:text-brand-teal">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
