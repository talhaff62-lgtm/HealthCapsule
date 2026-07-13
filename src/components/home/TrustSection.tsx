import React from "react";
import { ShieldCheck, Heart, Lock, Award } from "lucide-react";

export default function TrustSection() {
  const points = [
    {
      icon: ShieldCheck,
      title: "Verified BMDC Credentials",
      desc: "We manually verify every doctor's registration against the Bangladesh Medical & Dental Council database. No scraped records, no duplicates, no false listings.",
    },
    {
      icon: Award,
      title: "Official Hospital Affiliations",
      desc: "Our hospital department lists and schedules are coordinated directly with facility administrators to ensure high-fidelity chamber timings and fees.",
    },
    {
      icon: Lock,
      title: "HIPAA-Ready Records Vault",
      desc: "Your uploaded prescriptions, test reports, and treatment history are fully encrypted at rest and in transit. Share only with doctors you choose.",
    },
  ];

  return (
    <section id="trust" className="bg-brand-cream-dark/30 py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Text & List */}
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-navy">
              Trust & Verification
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
              Patient safety starts with data integrity.
            </h2>
            <p className="mt-4 text-brand-muted leading-relaxed">
              In a landscape filled with outdated medical phone numbers, broken links, and unverified social media profiles, HealthCapsule serves as Chattogram&apos;s single source of truth for doctor coordinates.
            </p>

            <div className="mt-8 space-y-6">
              {points.map((pt) => (
                <div key={pt.title} className="flex gap-4 items-start p-4 rounded-xl hover:bg-brand-cream/60 transition duration-300">
                  <div className="w-10 h-10 rounded-lg bg-brand-sky-bg flex items-center justify-center text-brand-sky shrink-0">
                    <pt.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-brand-navy">{pt.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-brand-muted">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Seal */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-white p-1.5 shadow-2xl animate-[skyPulse_3s_ease-in-out_infinite] flex items-center justify-center ring-1 ring-brand-gray">
              {/* Outer accent ring */}
              <div className="absolute inset-0 rounded-full ring-1 ring-brand-sky/30" />
              {/* Inner dashed ring */}
              <div className="absolute inset-5 border-2 border-dashed border-brand-sky/30 rounded-full" />

              <div className="text-center z-10 px-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-sky-bg flex items-center justify-center mb-3">
                  <Heart className="h-7 w-7 text-brand-sky stroke-[1.5]" />
                </div>
                <span className="font-serif text-3xl sm:text-4xl font-semibold block tracking-tight text-brand-navy">
                  100%
                </span>
                <span className="font-mono text-[0.65rem] font-bold uppercase tracking-widest block mt-1 text-brand-sky">
                  Verified Only
                </span>
                <span className="text-[0.55rem] text-brand-muted block mt-2 max-w-[160px] mx-auto leading-normal">
                  Bangladesh Medical &amp; Dental Council Checked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
