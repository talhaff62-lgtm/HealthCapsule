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
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column */}
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-sky/30 bg-brand-sky/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-sky-bright">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Doctor &amp; Hospital Registry
              </span>

              <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find a verified doctor.<br />Book today. <span className="italic text-brand-sky-bright">Keep records after.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80">
                Search verified doctors, book in two taps, store every prescription, and reach an ambulance before panic sets in — one trusted platform for Chattogram.
              </p>

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
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition hover:border-brand-sky-bright hover:text-brand-sky-bright"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap gap-6 text-xs font-medium uppercase tracking-wider text-white/80">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-sky-bright" />
                  BMDC verified
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-sky-bright" />
                  Live schedules
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-sky-bright" />
                  Chattogram focused
                </span>
              </div>

              {/* Recently Verified Doctor strip */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-white/70 mb-3">
                  Recently Verified Providers
                </span>
                <div className="flex flex-wrap gap-3">
                  {recentlyVerified.map((doc) => (
                    <div
                      key={doc.name}
                      className="inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 p-1.5 pr-4 text-xs hover:border-brand-sky/50 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-sky/20 text-[0.7rem] font-bold text-brand-sky-bright flex items-center justify-center">
                        {doc.initials}
                      </div>
                      <div>
                        <strong className="text-white block font-medium">{doc.name}</strong>
                        <span className="text-[0.65rem] text-white/70 font-mono uppercase">{doc.spec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — search card */}
            <div className="relative lg:mt-8">
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

