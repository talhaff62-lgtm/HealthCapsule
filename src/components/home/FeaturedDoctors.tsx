import React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DoctorCard from "@/components/doctors/DoctorCard";
import { VerificationStatus, ListingTier } from "@prisma/client";

async function getFeaturedDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
      },
      include: {
        specialties: {
          include: { specialty: { select: { name: true, slug: true } } },
        },
        chambers: {
          where: { deletedAt: null, isActive: true },
          include: { area: { select: { name: true, slug: true } } },
        },
      },
      orderBy: [
        { listingTier: "desc" },
        { createdAt: "desc" },
      ],
      take: 6,
    });

    return doctors.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      photoUrl: d.photoUrl,
      degrees: d.degrees,
      yearsExperience: d.yearsExperience,
      consultationFee: d.consultationFee?.toString() ?? null,
      registrationYear: d.registrationYear,
      listingTier: d.listingTier,
      specialties: d.specialties,
      chambers: d.chambers,
    }));
  } catch (error) {
    console.error("Error fetching featured doctors:", error);
    return [];
  }
}

export default async function FeaturedDoctors() {
  const doctors = await getFeaturedDoctors();

  if (doctors.length === 0) return null;

  return (
    <section id="featured-doctors" className="bg-brand-cream py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-current" />
              Top Rated Providers
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
              Featured Specialists
            </h2>
            <p className="mt-3 text-brand-muted">
              Book consultations with BMDC verified, highly experienced doctors across popular specialties in Chattogram.
            </p>
          </div>
          <Link
            href="/doctors"
            className="group mt-6 md:mt-0 inline-flex items-center gap-2 font-semibold text-brand-navy hover:text-brand-sky transition-colors"
          >
            View All Doctors
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
