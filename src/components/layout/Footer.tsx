import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-brand-gray bg-brand-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-teal text-white">
              <Heart className="h-3.5 w-3.5 fill-current" />
            </span>
            <span className="font-serif text-lg font-bold text-brand-teal">
              HealthCapsule
            </span>
          </Link>

          <p className="text-sm text-brand-muted">
            © {currentYear} HealthCapsule. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-brand-muted">
            <Link href="/doctors" className="transition hover:text-brand-teal">
              Doctors
            </Link>
            <Link href="/portal/doctor" className="transition hover:text-brand-teal">
              Doctor Portal
            </Link>
            <Link href="/portal/admin" className="transition hover:text-brand-teal">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
