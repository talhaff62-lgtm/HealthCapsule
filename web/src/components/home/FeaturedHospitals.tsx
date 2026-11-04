import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Globe, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import FacilityTypeBadge from "@/components/ui/FacilityTypeBadge";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { VerificationStatus } from "@prisma/client";

async function getFeaturedFacilities() {
  try {
    const featured = await prisma.facility.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
        listingTier: { in: ["FEATURED", "PREMIUM"] },
      },
      include: {
        area: {
          select: { name: true },
        },
      },
      orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
      take: 6,
    });
    if (featured.length >= 6) return featured;
    const pickedIds = featured.map((f) => f.id);
    const backfill = await prisma.facility.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
        id: { notIn: pickedIds },
      },
      include: {
        area: {
          select: { name: true },
        },
      },
      orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
      take: 6 - featured.length,
    });
    return [...featured, ...backfill];
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return [];
  }
}

export default async function FeaturedHospitals() {
  const displayFacilities = await getFeaturedFacilities();

  return (
    <SectionCanvas tone="white" id="hospitals">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            Verified Network
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Featured Hospitals &amp; Diagnostics
          </h2>
          <p className="mt-3 text-ink-muted">
            Explore trusted medical facilities in Chattogram mapped by departments, ICU capacity, and direct emergency contacts.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayFacilities.map((facility) => {
            const imageSrc = facility.coverImageUrl;

            return (
              <StaggerItem
                key={facility.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand-gray bg-white shadow-card transition duration-300 hover:-translate-y-0.5"
              >
                {/* Facility Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cloud">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={`${facility.name} building`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={
                        facility.type === "DIAGNOSTIC_CENTER"
                          ? "/images/placeholders/facility-cover-diagnostic.svg"
                          : "/images/placeholders/facility-cover.svg"
                      }
                      alt={facility.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  )}

                  {/* Gradient for depth + badge legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/25 via-transparent to-transparent" />

                  {/* Featured Tier Label */}
                  {(facility.listingTier === "FEATURED" ||
                    facility.listingTier === "PREMIUM") && (
                    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-brand-sky shadow-sm backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-brand-sky text-brand-sky" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-brand-navy leading-snug">
                        {facility.name}
                      </h3>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-muted">
                        <MapPin className="h-3.5 w-3.5 text-brand-muted" />
                        {facility.area?.name || "Chattogram"}
                      </span>
                    </div>
                    <FacilityTypeBadge type={facility.type} />
                  </div>

                  <p className="mt-3 text-sm text-brand-muted line-clamp-3 flex-1 leading-relaxed">
                    {facility.description}
                  </p>

                  {/* Facility Meta */}
                  <div className="mt-5 flex flex-wrap gap-y-2 gap-x-4 border-t border-brand-gray pt-4 text-xs font-mono text-brand-muted">
                    {facility.beds && (
                      <div>
                        <span className="uppercase text-[0.65rem] block tracking-wider text-brand-muted">Beds</span>
                        <span className="text-brand-navy font-semibold">{facility.beds}</span>
                      </div>
                    )}
                    {facility.establishedYear && (
                      <div>
                        <span className="uppercase text-[0.65rem] block tracking-wider text-brand-muted">Est.</span>
                        <span className="text-brand-navy font-semibold">{facility.establishedYear}</span>
                      </div>
                    )}
                    {facility.rating != null && (
                      <div>
                        <span className="uppercase text-[0.65rem] block tracking-wider text-brand-muted">Rating</span>
                        <span className="inline-flex items-center gap-1 text-brand-navy font-semibold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {facility.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 flex justify-end gap-1.5 self-end">
                      {facility.hasIcu && (
                        <span className="px-2 py-0.5 rounded bg-brand-navy-light text-white font-semibold text-[0.65rem]">
                          ICU
                        </span>
                      )}
                      {facility.hasEmergency && (
                        <span className="px-2 py-0.5 rounded bg-status-emergency-light text-status-emergency font-semibold text-[0.65rem]">
                          EMERGENCY
                        </span>
                      )}
                      {facility.hasAmbulance && (
                        <span className="px-2 py-0.5 rounded bg-brand-sky-bg text-brand-sky-deep font-semibold text-[0.65rem]">
                          AMBULANCE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-dashed border-brand-gray flex items-center justify-between text-xs">
                    {facility.phone ? (
                      <a
                        href={`tel:${facility.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-brand-navy hover:text-brand-sky transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-brand-sky" />
                        {facility.phone}
                      </a>
                    ) : (
                      <span className="text-brand-muted italic">Call info unavailable</span>
                    )}

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/healthcares/${facility.slug}`}
                        className="inline-flex items-center font-semibold text-brand-navy hover:text-brand-sky transition"
                      >
                        View details
                      </Link>

                      {facility.website ? (
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-sky hover:text-brand-sky-dark font-semibold hover:underline"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Website ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </SectionCanvas>
  );
}
