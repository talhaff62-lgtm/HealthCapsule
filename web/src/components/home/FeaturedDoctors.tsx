import React from "react";
import Link from "next/link";
import { Award, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DoctorCard from "@/components/doctors/DoctorCard";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Prisma, VerificationStatus } from "@prisma/client";
import { EXPERIENCED_YEARS_THRESHOLD, DoctorListItem } from "@/lib/doctors";

function mapDoctor(
  d: Prisma.DoctorGetPayload<{ include: typeof sharedInclude }>
): DoctorListItem {
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
    hasOnlineConsultation: d.hasOnlineConsultation,
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
    include: {
      area: { select: { name: true, slug: true } },
      schedules: {
        where: { deletedAt: null, isActive: true },
        select: { dayOfWeek: true, startTime: true, endTime: true },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  },
} as const;

async function getExperiencedDoctors(): Promise<DoctorListItem[]> {
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

async function getEmergingDoctors(): Promise<DoctorListItem[]> {
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
    <SectionCanvas tone="white" id="featured-doctors">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        {/* Experienced Specialists */}
        {experienced.length > 0 && (
          <div className="mb-10">
            <ScrollReveal className="mx-auto mb-8 mt-8 max-w-2xl text-center sm:mt-10">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
                <Award className="h-3.5 w-3.5" />
                Highly Experienced
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                Experienced Specialists
              </h2>
              <p className="mt-3 text-ink-muted">
                Book consultations with BMDC verified, seasoned specialists bringing a decade or more of practice across Chattogram.
              </p>
            </ScrollReveal>

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
            <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
                <Sparkles className="h-3.5 w-3.5" />
                Rising Talent
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                Emerging Specialists
              </h2>
              <p className="mt-3 text-ink-muted">
                Discover promising BMDC verified doctors early in their careers — fresh perspectives, modern training, and growing practices in Chattogram.
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {emerging.map((doctor) => (
                <StaggerItem key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-brand-sky hover:text-brand-sky-dark"
          >
            View All Doctors
          </Link>
        </div>
      </div>
    </SectionCanvas>
  );
}
