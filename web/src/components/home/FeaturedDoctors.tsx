import React from "react";
import Link from "next/link";
import { ArrowRight, Award, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DoctorCard from "@/components/doctors/DoctorCard";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Prisma, VerificationStatus } from "@prisma/client";
import { EXPERIENCED_YEARS_THRESHOLD } from "@/lib/doctors";

type FeaturedDoctorListItem = {
  id: string;
  name: string;
  slug: string;
  photoUrl: string | null;
  degrees: string[];
  yearsExperience: number | null;
  consultationFee: string | null;
  registrationYear: number | null;
  listingTier: import("@prisma/client").ListingTier;
  rating: number | null;
  totalReviews: number | null;
  specialties: { specialty: { name: string; slug: string } }[];
  chambers: { area: { name: string; slug: string } | null }[];
};

function mapDoctor(
  d: Prisma.DoctorGetPayload<{ include: typeof sharedInclude }>
): FeaturedDoctorListItem {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    photoUrl: d.photoUrl,
    degrees: d.degrees,
    yearsExperience: d.yearsExperience,
    consultationFee: d.consultationFee?.toString() ?? null,
    registrationYear: d.registrationYear,
    listingTier: d.listingTier,
    rating: d.rating,
    totalReviews: d.totalReviews,
    specialties: d.specialties,
    chambers: d.chambers,
  };
}

const sharedInclude = {
  specialties: {
    include: { specialty: { select: { name: true, slug: true } } },
  },
  chambers: {
    where: { deletedAt: null, isActive: true },
    include: { area: { select: { name: true, slug: true } } },
  },
} as const;

async function getExperiencedDoctors(): Promise<FeaturedDoctorListItem[]> {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
        yearsExperience: { gte: EXPERIENCED_YEARS_THRESHOLD },
      },
      include: sharedInclude,
      orderBy: [
        { listingTier: "desc" },
        { rating: "desc" },
        { yearsExperience: "desc" },
      ],
      take: 6,
    });
    return doctors.map(mapDoctor);
  } catch (error) {
    console.error("Error fetching experienced doctors:", error);
    return [];
  }
}

async function getEmergingDoctors(): Promise<FeaturedDoctorListItem[]> {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
        degrees: { equals: ["MBBS"] },
        OR: [
          { yearsExperience: { lt: EXPERIENCED_YEARS_THRESHOLD } },
          { yearsExperience: null },
        ],
      },
      include: sharedInclude,
      orderBy: [
        { listingTier: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
      take: 6,
    });
    return doctors.map(mapDoctor);
  } catch (error) {
    console.error("Error fetching emerging doctors:", error);
    return [];
  }
}

export default async function FeaturedDoctors() {
  const [experienced, emerging] = await Promise.all([
    getExperiencedDoctors(),
    getEmergingDoctors(),
  ]);

  if (experienced.length === 0 && emerging.length === 0) return null;

  return (
    <section
      id="featured-doctors"
      className="bg-brand-cream py-20 border-t border-brand-gray"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Experienced Specialists */}
        {experienced.length > 0 && (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <ScrollReveal className="max-w-2xl">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  Highly Experienced
                </span>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
                  Experienced Specialists
                </h2>
                <p className="mt-3 text-brand-muted">
                  Book consultations with BMDC verified, seasoned specialists bringing a decade or more of practice across Chattogram.
                </p>
              </ScrollReveal>
              <Link
                href="/doctors"
                className="group mt-6 md:mt-0 inline-flex items-center gap-2 font-semibold text-brand-navy hover:text-brand-sky transition-colors"
              >
                View All Doctors
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experienced.map((doctor) => (
                <StaggerItem key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Emerging Specialists */}
        {emerging.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <ScrollReveal className="max-w-2xl">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Rising Talent
                </span>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
                  Emerging Specialists
                </h2>
                <p className="mt-3 text-brand-muted">
                  Discover promising BMDC verified doctors early in their careers — fresh perspectives, modern training, and growing practices in Chattogram.
                </p>
              </ScrollReveal>
            </div>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {emerging.map((doctor) => (
                <StaggerItem key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </div>
    </section>
  );
}
