import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Search & filter",
      desc: "Enter your specialty, area, and preferred date. Every result is a verified provider with real availability.",
    },
    {
      num: "02",
      title: "View verified profile",
      desc: "See credentials, hospital affiliations, patient reviews, and live schedule — no guesswork.",
    },
    {
      num: "03",
      title: "Book in two taps",
      desc: "Confirm your slot instantly. An SMS reminder goes out 24 hours before your appointment.",
    },
    {
      num: "04",
      title: "Store & share records",
      desc: "Prescriptions and lab reports are saved to your Prescription Vault, accessible any time.",
    },
  ];

  return (
    <section id="how" className="bg-brand-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky">
            How it works
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            From search to appointment in two minutes.
          </h2>
          <p className="mt-4 text-brand-muted">
            HealthCapsule cuts through the noise of group chats, outdated Facebook pages, and unreachable phone numbers.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block step-connector" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-brand-navy border-2 border-brand-sky flex items-center justify-center font-mono text-lg font-semibold text-brand-sky-bright shadow-[0_0_0_6px_var(--color-brand-cloud)] transition-transform duration-300 hover:scale-110">
                  {step.num}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
