import React from "react";
import Image from "next/image";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";

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
    <SectionCanvas tone="white" id="how">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20">
        <ScrollReveal className="mx-auto mb-10 max-w-2xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            How it works
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            From search to appointment in two minutes.
          </h2>
          <p className="mt-3 text-ink-muted">
            Capsule cuts through the noise of group chats, outdated Facebook pages, and unreachable phone numbers.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mx-auto mb-14 max-w-4xl">
          <div className="rounded-[2rem] bg-white p-4 shadow-card">
            <Image
              src="/images/how_it_works.png"
              alt="How Capsule works: search and filter doctors, view verified profiles, book in two taps, and store your records"
              width={1600}
              height={900}
              className="h-auto w-full rounded-3xl"
            />
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block step-connector" />

          <StaggerContainer className="relative z-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <StaggerItem key={step.num} className="flex flex-col items-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-sky/30 bg-white text-lg font-semibold text-brand-sky-dark shadow-card">
                  {step.num}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </SectionCanvas>
  );
}
