import React from "react";
import Link from "next/link";
import { MapPin, Phone, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import FacilityTypeBadge from "@/components/ui/FacilityTypeBadge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { VerificationStatus } from "@prisma/client";

async function getFeaturedFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        deletedAt: null,
        isActive: true,
      },
      include: {
        area: {
          select: { name: true },
        },
      },
      orderBy: {
        listingTier: "desc",
      },
      take: 6,
    });
    return facilities;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return [];
  }
}

// Curated backup list of Chattogram facilities matching the example HTML
const fallbackFacilities = [
  {
    id: "fb-1",
    name: "Evercare Hospital Chattogram",
    slug: "evercare-hospital-chattogram",
    type: "HOSPITAL" as const,
    description: "A 470-bed multi-disciplinary tertiary care hospital with 27+ specialties and a 24/7 emergency department.",
    beds: 470,
    establishedYear: 2021,
    hasIcu: true,
    hasEmergency: true,
    hasAmbulance: true,
    phone: "09612310663",
    website: "https://www.evercarebd.com/en/chattogram",
    area: { name: "Anannya Residential Area" },
    address: "Oxygen-Kuwaish Road, Chattogram",
    listingTier: "FEATURED",
  },
  {
    id: "fb-2",
    name: "Chattogram Medical College Hospital",
    slug: "cmch",
    type: "HOSPITAL" as const,
    description: "The region's largest public teaching hospital, training doctors and treating patients since 1957.",
    beds: 2200,
    establishedYear: 1957,
    hasIcu: true,
    hasEmergency: true,
    hasAmbulance: true,
    phone: "031-619400",
    website: "https://cmch.gov.bd",
    area: { name: "Panchlaish" },
    address: "KB Fazlul Kader Road, Panchlaish, Chattogram",
    listingTier: "VERIFIED",
  },
  {
    id: "fb-3",
    name: "Imperial Hospital Chattogram",
    slug: "imperial-hospital",
    type: "HOSPITAL" as const,
    description: "A 375-bed multi-specialty hospital built across seven acres, offering international-standard inpatient care.",
    beds: 375,
    establishedYear: 2019,
    hasIcu: true,
    hasEmergency: true,
    hasAmbulance: true,
    phone: "09612-247247",
    website: "https://aihlbd.org",
    area: { name: "Pahartali" },
    address: "Zakir Hossain Road, Pahartali, Chattogram",
    listingTier: "FEATURED",
  },
  {
    id: "fb-4",
    name: "CSCR (Center for Specialized Care)",
    slug: "cscr-chattogram",
    type: "DIAGNOSTIC_CENTER" as const,
    description: "One of Chattogram's most established diagnostic and imaging centres, with a specialized stroke unit.",
    beds: 100,
    establishedYear: 1998,
    hasIcu: true,
    hasEmergency: true,
    hasAmbulance: false,
    phone: "031-656565",
    website: "https://nationalhospital.com.bd",
    area: { name: "O.R. Nizam Road" },
    address: "O.R. Nizam Road, Panchlaish, Chattogram",
    listingTier: "FEATURED",
  },
  {
    id: "fb-5",
    name: "Sensiv Diagnostic & Consultation",
    slug: "sensiv-diagnostic",
    type: "CLINIC" as const,
    description: "Modern outpatient consultation center with state-of-the-art pathology, imaging, and cardiology tests.",
    beds: null,
    establishedYear: 2015,
    hasIcu: false,
    hasEmergency: false,
    hasAmbulance: false,
    phone: "01844-080000",
    website: null,
    area: { name: "Probortok More" },
    address: "KB Fazlul Kader Road, Probortok, Chattogram",
    listingTier: "VERIFIED",
  },
  {
    id: "fb-6",
    name: "Chevron Clinical Laboratory",
    slug: "chevron-clinical-laboratory",
    type: "DIAGNOSTIC_CENTER" as const,
    description: "A pioneer in diagnostic services in Chattogram, offering highly accurate reports and specialized consultations.",
    beds: null,
    establishedYear: 1984,
    hasIcu: false,
    hasEmergency: false,
    hasAmbulance: false,
    phone: "031-652533",
    website: "http://chevronlab.com",
    area: { name: "Panchlaish" },
    address: "12 KB Fazlul Kader Road, Panchlaish, Chattogram",
    listingTier: "VERIFIED",
  },
];

export default async function FeaturedHospitals() {
  const dbFacilities = await getFeaturedFacilities();
  const displayFacilities = dbFacilities.length > 0 ? dbFacilities : fallbackFacilities;

  return (
    <section id="hospitals" className="bg-brand-cloud py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-navy">
            Verified Network
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Featured Hospitals & Diagnostics
          </h2>
          <p className="mt-4 text-brand-muted">
            Explore trusted medical facilities in Chattogram mapped by departments, ICU capacity, and direct emergency contacts.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayFacilities.map((facility) => (
            <StaggerItem
              key={facility.id}
              className="premium-card relative flex flex-col rounded-2xl bg-white border border-brand-gray p-6 shadow-sm"
            >
              {/* Featured Tier Label */}
              {facility.listingTier === "FEATURED" && (
                <span className="absolute right-4 top-4 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-brand-sky bg-brand-sky-bg rounded px-2 py-0.5">
                  Featured
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-brand-navy leading-snug">
                    {facility.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-brand-muted font-medium">
                    <MapPin className="h-3.5 w-3.5 text-brand-muted" />
                    {facility.area?.name || "Chattogram"}
                  </span>
                </div>
                <FacilityTypeBadge type={facility.type} />
              </div>

              <p className="mt-4 text-sm text-brand-muted line-clamp-3 flex-1 leading-relaxed">
                {facility.description}
              </p>

              {/* Facility Meta */}
              <div className="mt-6 flex flex-wrap gap-y-2 gap-x-4 border-t border-brand-gray pt-4 text-xs font-mono text-brand-muted">
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
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
