import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, MapPin } from "lucide-react";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import HeroIllustration from "@/components/home/HeroIllustration";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import StatsBar from "@/components/home/StatsBar";
import HowItWorks from "@/components/home/HowItWorks";
import WhySection from "@/components/home/WhySection";
import Audiences from "@/components/home/Audiences";
import FeaturedHospitals from "@/components/home/FeaturedHospitals";
import FeaturedDoctors from "@/components/home/FeaturedDoctors";
import VideosSection from "@/components/home/VideosSection";
import BlogSection from "@/components/home/BlogSection";
import TrustSection from "@/components/home/TrustSection";
import CtaBanner from "@/components/home/CtaBanner";
import { ScrollReveal } from "@/components/ui/motion";

export const metadata = {
  title: "Capsule — Find Verified Doctors in Chattogram",
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

  return (
    <div className="flex flex-col gap-4 px-3 pb-4 pt-2 sm:gap-5 sm:px-4 sm:pb-5">
      {/* Hero */}
      <SectionCanvas tone="white" className="pt-2">
        {/* Aurora background blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-sky/20 blur-3xl motion-safe:animate-[drift_18s_ease-in-out_infinite_alternate]" />
          <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-teal/15 blur-3xl motion-safe:animate-[drift_22s_ease-in-out_infinite_alternate-reverse]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Left column */}
            <div className="max-w-2xl">
              <ScrollReveal delay={0}>
                <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-brand-sky-deep">
                  <span className="h-px w-5 bg-brand-sky-deep/60" aria-hidden="true" />
                  Bangladesh · Verified doctors, hospitals &amp; records
                </span>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.07] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                  Find a <span className="text-gradient">verified doctor</span>.<br />Book today. <span className="italic font-medium">Keep every record after.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
                  Search verified doctors, book in two taps, store every prescription, and reach an ambulance before panic sets in — one platform, instead of a dozen phone numbers and Facebook pages.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.15} className="mt-6 max-w-xl">
                <HeroSearchCard specialties={specialties} areas={areas} />
              </ScrollReveal>

              {/* Trust chips */}
              <ScrollReveal delay={0.25}>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-ink/8 bg-white px-4 py-2 text-xs font-medium text-ink-muted shadow-card">
                    <ShieldCheck className="h-4 w-4 text-brand-sky" />
                    Verified-only network
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-ink/8 bg-white px-4 py-2 text-xs font-medium text-ink-muted shadow-card">
                    <Clock className="h-4 w-4 text-brand-sky" />
                    Real-time availability
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-ink/8 bg-white px-4 py-2 text-xs font-medium text-ink-muted shadow-card">
                    <MapPin className="h-4 w-4 text-brand-sky" />
                    Free for patients
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right column — illustration */}
            <div className="relative">
              <ScrollReveal delay={0.15}>
                <div className="relative rounded-[2rem] bg-white/70 p-4 shadow-card backdrop-blur">
                  <HeroIllustration />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </SectionCanvas>

      {/* Stats Bar */}
      <StatsBar />

      {/* Featured Specialists */}
      <FeaturedDoctors />

      {/* Health Videos */}
      <VideosSection />

      {/* Featured Hospitals & Diagnostics */}
      <FeaturedHospitals />

      {/* From the Blog */}
      <BlogSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Before vs After */}
      <WhySection />

      {/* Audiences */}
      <Audiences />

      {/* Trust Section */}
      <TrustSection />

      {/* CTA Split Banner */}
      <CtaBanner />
    </div>
  );
}
