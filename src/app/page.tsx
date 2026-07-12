import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, MapPin, ArrowRight, Search } from "lucide-react";

export const metadata = {
  title: "HealthCapsule — Find Verified Doctors in Chattogram",
  description:
    "Search verified doctors by specialty, area, and name. View profiles, chambers, and next available schedules.",
};

async function getFilterOptions() {
  const [specialties, areas] = await Promise.all([
    prisma.specialty.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.area.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { specialties, areas };
}

export default async function Home() {
  const { specialties, areas } = await getFilterOptions();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-gold/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-brand-navy-light/40 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column */}
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-gold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified doctor directory
              </span>

              <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find verified doctors in <span className="text-brand-gold">Chattogram</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-navy-muted">
                Search trusted doctors by specialty, area, or name. View verified
                profiles, chambers, and next available schedules — all in one place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/doctors"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:bg-brand-gold-light"
                >
                  Find a Doctor
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/portal/doctor"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white transition hover:border-brand-gold hover:text-brand-gold"
                >
                  For Doctors
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-xs font-medium uppercase tracking-wider text-brand-navy-muted">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                  BMDC verified
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-gold" />
                  Live schedules
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-gold" />
                  Chattogram focused
                </span>
              </div>
            </div>

            {/* Right column — search card */}
            <div className="relative lg:mt-8">
              <div className="relative overflow-hidden rounded-2xl bg-brand-cream p-6 shadow-2xl shadow-black/30 sm:p-8">
                <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-brand-gold to-transparent" />
                <span className="absolute right-1 top-3 rotate-45 text-[0.5rem] font-bold uppercase tracking-widest text-brand-navy">
                  Verified
                </span>

                <div className="relative">
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                    Start your search
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-brand-navy">
                    Find a doctor
                  </h2>

                  <form action="/doctors" method="get" className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="q"
                        className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                      >
                        Name or keyword
                      </label>
                      <input
                        id="q"
                        name="q"
                        type="search"
                        placeholder="e.g. Dr. Rahman, Cardiology"
                        className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="specialty"
                          className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                        >
                          Specialty
                        </label>
                        <select
                          id="specialty"
                          name="specialty"
                          className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                        >
                          <option value="">All specialties</option>
                          {specialties.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="area"
                          className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                        >
                          Area
                        </label>
                        <select
                          id="area"
                          name="area"
                          className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                        >
                          <option value="">All areas</option>
                          {areas.map((a) => (
                            <option key={a.slug} value={a.slug}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
                    >
                      <Search className="h-4 w-4" />
                      Search Doctors
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-brand-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-brand-navy">
              Why HealthCapsule?
            </h2>
            <p className="mt-4 text-brand-muted">
              A focused directory that helps patients find the right verified doctor faster.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">Verified Profiles</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                Every listed doctor is reviewed and verified before going live.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">Live Schedules</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                See chamber timings and the next available slot at a glance.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">Nearby Chambers</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                Find doctors by area across Chattogram city.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
