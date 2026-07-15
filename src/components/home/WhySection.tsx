import React from "react";
import { Check, X } from "lucide-react";

export default function WhySection() {
  const scraps = [
    { title: "Dr. Karim's clinic", desc: "Facebook page, last updated 2024", top: 0, left: 0, rotate: -6, z: 1 },
    { title: "Ambulance — Agrabad", desc: "Number scribbled in a notebook", top: 18, left: 170, rotate: 4, z: 2 },
    { title: "Prescription, May", desc: "Folded inside an old folder", top: 140, left: 10, rotate: 3, z: 1 },
    { title: "Best ENT in town?", desc: "Asked in a Facebook group", top: 165, left: 200, rotate: -3, z: 2 },
    { title: "O- blood needed", desc: "Forwarded across 6 group chats", top: 262, left: 90, rotate: -2, z: 1 },
  ];

  const deckRows = [
    { label: "Dr. Karim, Cardiologist", val: "Today, 5:30pm" },
    { label: "Ambulance, ICU", val: "2.1 km away" },
    { label: "Prescription history", val: "6 records" },
    { label: "O- donor, Agrabad", val: "Available now" },
  ];

  return (
    <section id="why" className="border-t border-brand-gray py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand-sky-dark">
            <span className="h-px w-4 bg-brand-sky/50" aria-hidden="true" />
            The problem, today
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Care exists. Finding it doesn&apos;t.
          </h2>
          <p className="mt-4 leading-relaxed text-brand-muted">
            Every piece of the patient journey already exists in Bangladesh — it&apos;s just
            scattered across phone calls, Facebook pages, and paper folders. HealthCapsule
            doesn&apos;t invent healthcare; it organizes it.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* ── Before: scattered scraps ── */}
          <div>
            <h3 className="mb-6 flex items-center gap-2.5 text-lg font-semibold text-brand-navy">
              <span className="block h-2.5 w-2.5 rounded-full bg-status-emergency" aria-hidden="true" />
              Before HealthCapsule
            </h3>

            {/* Scatter container — desktop: absolute-positioned tilted cards */}
            <div className="relative hidden h-[340px] sm:block">
              {scraps.map((s, i) => (
                <div
                  key={s.title}
                  className="group absolute w-[230px] cursor-default rounded-xl border border-brand-gray bg-white p-3.5 shadow-lg shadow-black/[0.06] transition-all duration-300 hover:z-20 hover:scale-[1.03] hover:shadow-xl"
                  style={{
                    top: `${s.top}px`,
                    left: `${s.left}px`,
                    transform: `rotate(${s.rotate}deg)`,
                    zIndex: s.z,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-status-emergency/70" />
                    <div className="min-w-0">
                      <strong className="block text-sm font-semibold text-brand-navy">
                        {s.title}
                      </strong>
                      <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: stacked list with subtle left-shift */}
            <div className="space-y-2 sm:hidden">
              {scraps.map((s) => (
                <div
                  key={s.title}
                  className="flex items-start gap-2.5 rounded-xl border border-brand-gray bg-white p-3.5 shadow-sm"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-status-emergency/70" />
                  <div>
                    <strong className="block text-sm font-semibold text-brand-navy">{s.title}</strong>
                    <span className="mt-0.5 block text-xs text-brand-muted">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── After: stacked deck ── */}
          <div>
            <h3 className="mb-6 flex items-center gap-2.5 text-lg font-semibold text-brand-navy">
              <span className="block h-2.5 w-2.5 rounded-full bg-brand-sky" aria-hidden="true" />
              With HealthCapsule
            </h3>

            {/* Desktop: layered stack */}
            <div className="relative hidden h-[340px] sm:block">
              {/* Shadow decks behind */}
              <div
                className="absolute left-1/2 top-7 w-[280px] -translate-x-1/2 rounded-xl border border-brand-gray bg-white shadow-lg shadow-black/[0.06]"
                aria-hidden="true"
                style={{ opacity: 0.45, zIndex: 1 }}
              />
              <div
                className="absolute left-1/2 top-3.5 w-[280px] -translate-x-1/2 rounded-xl border border-brand-gray bg-white shadow-lg shadow-black/[0.06]"
                aria-hidden="true"
                style={{ opacity: 0.7, zIndex: 2 }}
              />

              {/* Top deck */}
              <div
                className="absolute left-1/2 top-0 w-[280px] -translate-x-1/2 rounded-xl border border-brand-sky/50 bg-white p-5 shadow-xl shadow-brand-sky/10"
                style={{ zIndex: 3 }}
              >
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-sky bg-brand-sky-bg px-3 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-brand-sky-deep">
                  <Check className="h-3 w-3" />
                  Verified
                </span>

                <div className="space-y-0">
                {deckRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-brand-gray py-2.5 text-sm last:border-b-0"
                  >
                    <span className="text-brand-muted">{row.label}</span>
                    <span className="font-mono text-xs font-semibold text-brand-navy">
                      {row.val}
                    </span>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Mobile: single clean card */}
            <div className="rounded-2xl border border-brand-sky/50 bg-white p-5 shadow-md sm:hidden">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-sky bg-brand-sky-bg px-2.5 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.05em] text-brand-sky-deep">
                <Check className="h-3 w-3" />
                Verified
              </span>
              <div>
                {deckRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-brand-gray py-2.5 text-sm last:border-b-0"
                  >
                    <span className="text-brand-muted">{row.label}</span>
                    <span className="font-mono text-xs font-semibold text-brand-navy">
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
