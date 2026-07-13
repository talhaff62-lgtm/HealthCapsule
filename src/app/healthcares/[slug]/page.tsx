import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  Building2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Globe,
  Calendar,
  Ambulance,
  Siren,
  Baby,
  Stethoscope,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getFacilityTypeLabel } from "@/lib/facility-helpers";
import TierBadge from "@/components/ui/TierBadge";

export const dynamic = "force-dynamic";

type FacilityProfilePageProps = {
  params: Promise<{ slug: string }>;
};

async function getVerifiedFacilityBySlug(slug: string) {
  const facility = await prisma.facility.findUnique({
    where: {
      slug,
      verificationStatus: VerificationStatus.VERIFIED,
      deletedAt: null,
      isActive: true,
    },
    include: {
      area: {
        select: { name: true, slug: true },
      },
      services: {
        where: { deletedAt: null },
        select: { name: true, price: true },
        orderBy: { name: "asc" },
      },
      departments: {
        select: { name: true, description: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return facility;
}

export async function generateMetadata({
  params,
}: FacilityProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const facility = await getVerifiedFacilityBySlug(slug);

  if (!facility) {
    return {
      title: "Not Found — HealthCapsule",
    };
  }

  return {
    title: `${facility.name} — HealthCapsule`,
    description: `View ${facility.name} details, services, and contact information in Chattogram.`,
  };
}

export default async function FacilityProfilePage({ params }: FacilityProfilePageProps) {
  const { slug } = await params;
  const facility = await getVerifiedFacilityBySlug(slug);

  if (!facility) {
    notFound();
  }

  const initials = facility.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/healthcares"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky hover:text-brand-sky-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to healthcare providers
        </Link>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-xl border border-brand-sky/15">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-sky-light to-brand-sky text-2xl font-bold text-white sm:h-32 sm:w-32 sm:text-3xl border-4 border-brand-navy-light shadow-md">
                {facility.logoUrl ? (
                  <img
                    src={facility.logoUrl}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {facility.name}
                  </h1>
                  <TierBadge tier={facility.listingTier} />
                </div>

                <p className="mt-2 text-sm text-white/80">
                  {getFacilityTypeLabel(facility.type)}
                </p>

                {facility.area && (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    <MapPin className="h-4 w-4 text-brand-sky-bright" />
                    {facility.area.name}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/70 font-medium">
                  {facility.establishedYear ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Est. {facility.establishedYear}
                    </span>
                  ) : null}

                  {facility.beds ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Bed className="h-4 w-4" />
                      {facility.beds} beds
                    </span>
                  ) : null}
                </div>

                {facility.address && (
                  <p className="mt-4 flex items-start gap-1.5 text-sm text-white/80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky-bright" />
                    {facility.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:px-8">
            <div className="flex flex-wrap gap-2">
              {facility.hasEmergency && (
                <span className="inline-flex items-center gap-1 rounded-full bg-status-emergency/20 px-3 py-1 text-xs font-semibold text-status-emergency">
                  <Siren className="h-3.5 w-3.5" />
                  24/7 Emergency
                </span>
              )}
              {facility.hasIcu && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky/10 px-3 py-1 text-xs font-semibold text-brand-sky-bright">
                  <Stethoscope className="h-3.5 w-3.5" />
                  ICU
                </span>
              )}
              {facility.hasNicu && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky/10 px-3 py-1 text-xs font-semibold text-brand-sky-bright">
                  <Baby className="h-3.5 w-3.5" />
                  NICU
                </span>
              )}
              {facility.hasAmbulance && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky/10 px-3 py-1 text-xs font-semibold text-brand-sky-bright">
                  <Ambulance className="h-3.5 w-3.5" />
                  Ambulance
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-bold uppercase tracking-wider text-brand-sky-bright">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Provider
            </span>
          </div>
        </div>

        {/* About */}
        {facility.description && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
              About
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              {facility.description}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
            Contact
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="flex items-center gap-2 text-sm text-brand-slate hover:text-brand-sky"
              >
                <Phone className="h-4 w-4 text-brand-sky" />
                <span className="font-mono">{facility.phone}</span>
              </a>
            )}
            {facility.email && (
              <a
                href={`mailto:${facility.email}`}
                className="flex items-center gap-2 text-sm text-brand-slate hover:text-brand-sky"
              >
                <Mail className="h-4 w-4 text-brand-sky" />
                {facility.email}
              </a>
            )}
            {facility.website && (
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-slate hover:text-brand-sky"
              >
                <Globe className="h-4 w-4 text-brand-sky" />
                Website
              </a>
            )}
            {!facility.phone && !facility.email && !facility.website && (
              <p className="text-sm text-brand-muted">No contact details available.</p>
            )}
          </div>
        </div>

        {/* Departments */}
        {facility.departments.length > 0 && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
              Departments
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {facility.departments.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-start gap-2 rounded-lg border border-brand-gray bg-brand-cloud/50 p-3"
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{dept.name}</p>
                    {dept.description && (
                      <p className="text-xs text-brand-muted">{dept.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {facility.services.length > 0 && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
              Services
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {facility.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-brand-gray bg-brand-cloud/50 p-3"
                >
                  <span className="text-sm text-brand-slate">{service.name}</span>
                  {service.price && (
                    <span className="text-xs font-mono font-semibold text-brand-navy">
                      ৳{service.price.toString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
