import Image from "next/image";
import React from "react";
import { ScrollReveal } from "@/components/ui/motion"

export default function WhySection() {
  return (
    <section id="why" className="border-t border-brand-gray py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-16 max-w-2xl">
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
        </ScrollReveal>

        <div className="mt-12 mx-auto max-w-6xl">
          <ScrollReveal>
            <Image
              src="/images/problem_today.png"
              alt="Before HealthCapsule, care information is scattered across outdated Facebook pages, notebooks, paper prescriptions, and group chats; with HealthCapsule it is organized into one verified app view"
              width={1900}
              height={860}
              className="h-auto w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
