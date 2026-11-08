import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import Image from "next/image";
import React from "react";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export default async function HowItWorks() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const steps = [
    {
      num: "01",
      title: t("home.howItWorks.step1Title"),
      desc: t("home.howItWorks.step1Desc"),
    },
    {
      num: "02",
      title: t("home.howItWorks.step2Title"),
      desc: t("home.howItWorks.step2Desc"),
    },
    {
      num: "03",
      title: t("home.howItWorks.step3Title"),
      desc: t("home.howItWorks.step3Desc"),
    },
    {
      num: "04",
      title: t("home.howItWorks.step4Title"),
      desc: t("home.howItWorks.step4Desc"),
    },
  ];

  return (
    <SectionCanvas tone="white" id="how">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            {t("home.howItWorks.badge")}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            {t("home.howItWorks.title")}
          </h2>
          <p className="mt-3 text-ink-muted">
            {t("home.howItWorks.desc")}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mx-auto mb-10 max-w-4xl">
          <div className="rounded-[2rem] bg-white p-4 shadow-card">
            <Image
              src="/images/how_it_works.png"
              alt={t("home.howItWorks.imageAlt")}
              width={1600}
              height={900}
              className="h-auto w-full rounded-3xl"
            />
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block step-connector" />

          <StaggerContainer className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
