import Link from "next/link";

export const metadata = {
  title: "Not Found — Capsule",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-brand-cream px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-7xl font-bold text-brand-sky">
          404
        </h1>
        <h2 className="mt-6 font-serif text-2xl font-semibold text-brand-navy">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-brand-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/doctors"
            className="rounded-full bg-brand-navy hover:bg-brand-navy-light px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Find Doctors
          </Link>
          <Link
            href="/"
            className="rounded-full bg-brand-sky px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-sky-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

