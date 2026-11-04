import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, MapPin, ChevronDown } from "lucide-react";
import Image from "next/image";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import StatsBar from "@/components/home/StatsBar";
// import HowItWorks from "@/components/home/HowItWorks";
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
    <div className="flex flex-col">
      {/* Hero — edge-to-edge full width, 100vh */}
      <section aria-label="Intro" className="relative isolate -mt-[76px] w-full overflow-hidden bg-brand-navy sm:-mt-20">
        {/* Media layer — crossfade slides */}
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src="/facilities/evercare-hospital-chattogram/gallery-1.webp"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-100 motion-safe:animate-[heroSlide_28s_ease-in-out_infinite]"
            style={{ animationDelay: "0s" }}
          />
          <Image
            src="/facilities/labaid-specialized-hospital-chattogram/gallery-1.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-0 motion-safe:animate-[heroSlide_28s_ease-in-out_infinite]"
            style={{ animationDelay: "-7s" }}
          />
          <Image
            src="/facilities/marine-city-medical-college-hospital/cover.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-0 motion-safe:animate-[heroSlide_28s_ease-in-out_infinite]"
            style={{ animationDelay: "-14s" }}
          />
          <Image
            src="/facilities/delta-health-care-chittagong/gallery-2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-0 motion-safe:animate-[heroSlide_28s_ease-in-out_infinite]"
            style={{ animationDelay: "-21s" }}
          />
          {/* Dark navy overlay: tuned slightly lighter for photo vibrancy while protecting navbar contrast */}
          <div className="absolute inset-0 bg-brand-navy/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/85 via-brand-navy/20 to-brand-navy/75" />
        </div>

        {/* Content */}
        <div className="hero-content relative mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-16">
            {/* Left column: Text stack & trust chips */}
            <div className="max-w-2xl">
              <ScrollReveal delay={0}>
                <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-sky-200/90">
                  <span className="h-px w-5 bg-sky-200/60" aria-hidden="true" />
                  Bangladesh · Verified doctors, hospitals & records
                </span>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <h1 className="hero-h1 mt-4 font-serif text-4xl font-semibold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Find a <span className="text-gradient">verified doctor</span>.<br />Book today. <span className="italic font-medium">Keep every record after.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <p className="hero-sub mt-4 max-w-lg text-base leading-relaxed text-white/85">
                  Search verified doctors, book in two taps, store every prescription, and reach an ambulance before panic sets in — one platform, instead of a dozen phone numbers and Facebook pages.
                </p>
              </ScrollReveal>

              {/* Trust chips */}
              <ScrollReveal delay={0.15}>
                <div className="hero-chips mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-card backdrop-blur">
                    <ShieldCheck className="h-4 w-4 text-sky-300" />
                    Verified-only network
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-card backdrop-blur">
                    <Clock className="h-4 w-4 text-sky-300" />
                    Real-time availability
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-card backdrop-blur">
                    <MapPin className="h-4 w-4 text-sky-300" />
                    Free for patients
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right column: Search card (the white box) */}
            <div className="w-full">
              <ScrollReveal delay={0.2} className="w-full">
                <HeroSearchCard specialties={specialties} areas={areas} />
              </ScrollReveal>
            </div>
          </div>

          {/* Scroll cue */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-5 flex justify-center">
            <ChevronDown className="h-5 w-5 text-white/70 motion-safe:animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stacked canvas sections */}
      <div className="flex flex-col gap-4 px-3 pb-4 pt-4 sm:gap-5 sm:px-4 sm:pb-5 sm:pt-5">
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

      {/* Before vs After */}
      <WhySection />

      {/* Audiences */}
      <Audiences />

      {/* Trust Section */}
      <TrustSection />

        {/* CTA Split Banner */}
        <CtaBanner />
      </div>
    </div>
  );
}
