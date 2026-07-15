import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, MapPin, ArrowRight } from "lucide-react";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import StatsBar from "@/components/home/StatsBar";
import HowItWorks from "@/components/home/HowItWorks";
import WhySection from "@/components/home/WhySection";
import Audiences from "@/components/home/Audiences";
import Modules from "@/components/home/Modules";
import HealthCapsuleAI from "@/components/home/HealthCapsuleAI";
import FeaturedHospitals from "@/components/home/FeaturedHospitals";
import FeaturedDoctors from "@/components/home/FeaturedDoctors";
import TrustSection from "@/components/home/TrustSection";
import CtaBanner from "@/components/home/CtaBanner";
import { ScrollReveal } from "@/components/ui/motion";

export const metadata = {
  title: "HealthCapsule — Find Verified Doctors in Chattogram",
  description:
    "Search verified doctors by specialty, area, and name. View profiles, chambers, and next available schedules.",
};

async function getFilterOptions() {
  const [specialties, areas] = await Promise.all([
    prisma.specialty.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.area.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { specialties, areas };
}

export default async function Home() {
  const { specialties, areas } = await getFilterOptions();

  // Curated list of recently verified doctors for the hero chip strip
  const recentlyVerified = [
    { name: "Dr. Sarah Rahman", spec: "Cardiology", initials: "SR" },
    { name: "Dr. Kamal Hossain", spec: "Medicine", initials: "KH" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-sky/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-brand-navy-light/50 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Left column */}
            <div className="max-w-2xl">
              <ScrollReveal delay={0}>
                <span className="inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand-sky-bright">
                  <span className="h-px w-5 bg-brand-sky-bright/60" aria-hidden="true" />
                  Bangladesh · Verified doctors, hospitals &amp; records
                </span>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
                  Find a verified doctor.<br />Book today. <span className="italic font-medium text-brand-sky-bright">Keep every record after.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <p className="mt-3 font-serif text-lg italic text-brand-sky-bright/90">
                  One trusted record for every step of care.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
                  Search verified doctors, book in two taps, store every prescription, and reach an ambulance before panic sets in — one platform, instead of a dozen phone numbers and Facebook pages.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/doctors"
                    className="group inline-flex items-center gap-2 rounded-full bg-brand-sky px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-sky/25 transition hover:bg-brand-sky-dark"
                  >
                    Find a Doctor
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="#how"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition hover:border-brand-sky-bright hover:text-brand-sky-bright"
                  >
                    See How It Works
                  </Link>
                </div>
              </ScrollReveal>

              {/* Trust Indicators */}
              <ScrollReveal delay={0.3}>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-wider text-white/65">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-sky-bright" />
                    Verified-only network
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-sky-bright" />
                    Real-time availability
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-sky-bright" />
                    Free for patients
                  </span>
                </div>
              </ScrollReveal>

              {/* Record meta — structured credibility strip */}
              <ScrollReveal delay={0.35}>
                <div className="mt-9 flex flex-wrap gap-x-9 gap-y-4 border-t border-white/10 pt-6">
                  {[
                    { k: "Launch city", v: "Chattogram" },
                    { k: "Network", v: "Verified-only" },
                    { k: "Modules", v: "9 live" },
                    { k: "Coverage", v: "5 divisions" },
                  ].map((m) => (
                    <div key={m.k} className="flex flex-col gap-1">
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white/45">
                        {m.k}
                      </span>
                      <span className="font-mono text-sm text-brand-sky-bright">{m.v}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* Recently Verified Doctor strip */}
              <ScrollReveal delay={0.45}>
                <div className="mt-8">
                  <span className="mb-3 block font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white/55">
                    Recently verified
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {recentlyVerified.map((doc) => (
                      <div
                        key={doc.name}
                        className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] p-1.5 pr-4 text-xs transition hover:border-brand-sky-bright/60 hover:bg-white/[0.1]"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy-light font-serif text-[0.72rem] font-semibold text-brand-sky-bright ring-1 ring-brand-sky-bright/30">
                          {doc.initials}
                        </div>
                        <div className="leading-tight">
                          <strong className="block font-medium text-white">{doc.name}</strong>
                          <span className="font-mono text-[0.62rem] uppercase tracking-wide text-white/55">{doc.spec}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right column — search card (top-aligned with the left text) */}
            <div className="relative">
              <HeroSearchCard specialties={specialties} areas={areas} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* How It Works */}
      <HowItWorks />

      {/* Before vs After */}
      <WhySection />

      {/* Featured Hospitals & Diagnostics */}
      <FeaturedHospitals />

      {/* Featured Specialists */}
      <FeaturedDoctors />

      {/* Audiences */}
      <Audiences />

      {/* Modules Ecosystem */}
      <Modules />

      {/* HealthCapsule AI capabilities */}
      <HealthCapsuleAI />

      {/* Trust Section */}
      <TrustSection />

      {/* CTA Split Banner */}
      <CtaBanner />
    </>
  );
}
