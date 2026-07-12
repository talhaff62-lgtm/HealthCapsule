import Link from "next/link";
import { ShieldCheck, Clock, MapPin, ArrowRight } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "Every listed doctor is reviewed and verified before going live.",
  },
  {
    icon: Clock,
    title: "Live Schedules",
    description: "See chamber timings and the next available slot at a glance.",
  },
  {
    icon: MapPin,
    title: "Nearby Chambers",
    description: "Find trusted doctors by area across Chattogram city.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-white via-brand-white to-brand-gray py-20 sm:py-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-teal/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-navy/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-4 py-1.5 text-sm font-medium text-brand-teal">
              <ShieldCheck className="h-4 w-4" />
              Verified doctor directory for Chattogram
            </span>

            <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Find verified doctors in Chattogram
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-brand-muted">
              Search trusted doctors by specialty, area, or name. View verified
              profiles, chambers, and next available schedules — all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/doctors"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-teal px-8 py-3.5 text-base font-medium text-white shadow-md transition hover:bg-brand-navy hover:shadow-lg"
              >
                Find a Doctor
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/portal/doctor"
                className="inline-flex items-center gap-2 rounded-full border border-brand-teal bg-white px-8 py-3.5 text-base font-medium text-brand-teal transition hover:bg-brand-gray"
              >
                For Doctors
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-brand-gray bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-teal/20 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal transition group-hover:bg-brand-teal group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-brand-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works / trust bar */}
      <section className="border-t border-brand-gray bg-brand-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
              Book with confidence
            </h2>
            <p className="mt-3 text-brand-muted">
              HealthCapsule lists only verified practitioners so patients can
              choose the right care without second guessing.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-brand-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gray bg-brand-gray/50 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-brand-teal" />
              BMDC verified
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gray bg-brand-gray/50 px-4 py-2">
              <Clock className="h-4 w-4 text-brand-teal" />
              Live schedules
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gray bg-brand-gray/50 px-4 py-2">
              <MapPin className="h-4 w-4 text-brand-teal" />
              Chattogram focused
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
