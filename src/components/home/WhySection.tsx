import React from "react";
import { Check, X } from "lucide-react";

export default function WhySection() {
  const beforeProblems = [
    { title: "Dr. Karim's clinic", desc: "Facebook page last updated 2024" },
    { title: "Ambulance — Agrabad", desc: "Number scribbled in a notebook" },
    { title: "Prescription, May", desc: "Folded inside an old paper folder" },
    { title: "Best ENT in town?", desc: "Asked inside generic Facebook groups" },
    { title: "O- blood needed", desc: "Forwarded across 6 random group chats" },
  ];

  const afterBenefits = [
    { label: "Dr. Karim, Cardiologist", val: "Today, 5:30pm" },
    { label: "Ambulance, ICU", val: "2.1 km away" },
    { label: "Prescription history", val: "6 records" },
    { label: "O- donor, Agrabad", val: "Available now" },
  ];

  return (
    <section id="why" className="bg-brand-cream-dark/20 py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-navy">
            The problem, today
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Care exists. Finding it doesn&apos;t.
          </h2>
          <p className="mt-4 text-brand-muted leading-relaxed">
            Every piece of the patient journey already exists in Bangladesh — it&apos;s just scattered across phone calls, Facebook pages, and paper folders. HealthCapsule doesn&apos;t invent healthcare; it organizes it.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Before column */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-navy">
                <span className="w-2.5 h-2.5 rounded-full bg-status-emergency block" />
                Before HealthCapsule
              </h3>
              <p className="mt-2 text-sm text-brand-muted leading-relaxed">
                Information is fractured, outdated, and relies purely on hearsay.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {beforeProblems.map((prob) => (
                <div
                  key={prob.title}
                  className="bg-white/80 border border-brand-gray rounded-xl p-4 flex items-start gap-3 shadow-sm hover:translate-x-1 transition duration-200"
                >
                  <X className="h-5 w-5 text-status-emergency shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-semibold text-brand-navy block">
                      {prob.title}
                    </strong>
                    <span className="text-xs text-brand-muted mt-0.5 block">
                      {prob.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After column */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-navy">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-sky block" />
                With HealthCapsule
              </h3>
              <p className="mt-2 text-sm text-brand-muted leading-relaxed">
                All coordinates are centralized, real-time, and manually verified.
              </p>
            </div>

            <div className="mt-8">
              <div className="relative p-6 rounded-2xl bg-white border border-brand-sky shadow-md overflow-hidden">
                <div className="absolute right-0 top-0 bg-brand-sky-bg px-3 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-brand-sky-deep rounded-bl-xl flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Verified
                </div>

                <div className="space-y-4 mt-4">
                  {afterBenefits.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center justify-between border-b border-brand-gray pb-3 last:border-b-0 last:pb-0"
                    >
                      <span className="text-sm text-brand-muted">{b.label}</span>
                      <span className="font-mono text-xs font-semibold text-brand-navy">
                        {b.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
