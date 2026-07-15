import React from "react";
import Link from "next/link";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="bg-brand-navy border-t border-white/10" aria-label="Call to Action">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2">
        {/* Patient CTA */}
        <div className="p-10 sm:p-14 md:border-r border-white/10 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
              For Patients
            </span>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
              Ready to find verified care?
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-md">
              Search BMDC verified specialists, view real available slots, book in two taps, and manage your family&apos;s health reports in one place.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-sky px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-sky/25 transition hover:bg-brand-sky-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky-bright focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Search Verified Doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Doctor CTA */}
        <div className="p-10 sm:p-14 border-t md:border-t-0 border-white/10 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
              For Doctors & Clinics
            </span>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
              Join Chattogram&apos;s trusted network.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-md">
              List your chamber schedules, reduce call center load, manage appointments, and build reputation through verified patient reviews.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register?type=doctor"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-sky-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <UserPlus className="h-4 w-4 text-brand-sky" />
              Doctor Registration
            </Link>
            <Link
              href="/register?type=facility"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <Building2 className="h-4 w-4 text-brand-sky-bright" />
              Healthcare Registration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
