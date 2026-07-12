import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-brand-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Find verified doctors in Chattogram
          </h1>
          <p className="mt-6 text-lg text-brand-muted">
            Search trusted doctors by specialty, area, or name. View verified
            profiles, chambers, and next available schedules — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/doctors"
              className="rounded-full bg-brand-teal px-8 py-3 text-base font-medium text-white shadow hover:bg-brand-navy"
            >
              Find a Doctor
            </Link>
            <Link
              href="/portal/doctor"
              className="rounded-full border border-brand-teal px-8 py-3 text-base font-medium text-brand-teal hover:bg-brand-gray"
            >
              For Doctors
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-brand-navy">Verified Profiles</h3>
            <p className="mt-2 text-sm text-brand-muted">
              Every listed doctor is reviewed and verified.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-brand-navy">Live Schedules</h3>
            <p className="mt-2 text-sm text-brand-muted">
              See chamber timings and next available slots.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-brand-navy">Nearby Chambers</h3>
            <p className="mt-2 text-sm text-brand-muted">
              Find doctors by area across Chattogram city.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
