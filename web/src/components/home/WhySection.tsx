import Image from "next/image";
import React from "react";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal } from "@/components/ui/motion";

export default function WhySection() {
  return (
    <SectionCanvas tone="tint" id="why">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <ScrollReveal className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand-sky-deep">
            <span className="h-px w-4 bg-brand-sky/50" aria-hidden="true" />
            The problem, today
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Care exists. Finding it doesn&apos;t.
          </h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            Every piece of the patient journey already exists in Bangladesh — it&apos;s just
            scattered across phone calls, Facebook pages, and paper folders. Capsule
            doesn&apos;t invent healthcare; it organizes it.
          </p>
        </ScrollReveal>

        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="rounded-[2rem] bg-white p-4 shadow-card">
              <Image
                src="/images/problem_today.png"
                alt="Before Capsule, care information is scattered across outdated Facebook pages, notebooks, paper prescriptions, and group chats; with Capsule it is organized into one verified app view"
                width={1900}
                height={860}
                className="h-auto w-full rounded-3xl"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </SectionCanvas>
  );
}
