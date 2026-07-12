import Link from "next/link";

export const metadata = {
  title: "Not Found — HealthCapsule",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-gray px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <h1
          className="text-6xl font-bold text-brand-teal"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-brand-slate">
          Page Not Found
        </h2>
        <p className="mt-3 text-brand-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/doctors"
            className="rounded-full bg-brand-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-navy"
          >
            Find Doctors
          </Link>
          <Link
            href="/"
            className="rounded-full border border-brand-teal px-6 py-2.5 text-sm font-medium text-brand-teal hover:bg-brand-gray"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
