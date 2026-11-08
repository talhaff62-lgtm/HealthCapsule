import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  Droplets,
  Pill,
  Microscope,
  ParkingCircle,
  Star,
  Clock,
  Shield,
  Users,
  PhoneCall,
  Smartphone,
  Home,
  FileCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getFacilityTypeLabel } from "@/lib/facility-helpers";
import TierBadge from "@/components/ui/TierBadge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

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
      gallery: {
        select: { id: true, url: true, alt: true },
        orderBy: { sortOrder: "asc" },
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
      title: "Not Found — Capsule",
    };
  }

  return {
    title: `${facility.name} — Capsule`,
    description: `View ${facility.name} details, services, and contact information in Chattogram.`,
  };
}

export default async function FacilityProfilePage({ params }: FacilityProfilePageProps) {
  const { slug } = await params;
  const facility = await getVerifiedFacilityBySlug(slug);

  if (!facility) {
    notFound();
  }

  const locale = await getServerLocale();
  const t = getT(locale);

  // Stats array computation
  const statsList = [
    facility.beds != null && facility.beds > 0 && { label: t("facilities.detail.stats.beds"), value: facility.beds },
    facility.icuBeds != null && facility.icuBeds > 0 && { label: t("facilities.detail.stats.icuBeds"), value: facility.icuBeds },
    facility.operationTheaters != null && facility.operationTheaters > 0 && { label: t("facilities.detail.stats.operationTheaters"), value: facility.operationTheaters },
    facility.doctorsOnPanel != null && facility.doctorsOnPanel > 0 && { label: t("facilities.detail.stats.doctors"), value: facility.doctorsOnPanel },
    facility.establishedYear != null && { label: t("facilities.detail.stats.established"), value: facility.establishedYear },
  ].filter(Boolean) as { label: string; value: number | string }[];

  const statsGridColsClass =
    statsList.length === 5
      ? "grid-cols-3 sm:grid-cols-5"
      : statsList.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : statsList.length === 3
      ? "grid-cols-3"
      : statsList.length === 2
      ? "grid-cols-2"
      : "grid-cols-1";

  // Capability chips definition
  const capabilities = [
    facility.hasEmergency && {
      key: "emergency",
      label: t("facilities.detail.capabilities.emergency"),
      icon: Siren,
      isEmergency: true,
    },
    facility.hasAmbulance && {
      key: "ambulance",
      label: t("facilities.detail.capabilities.ambulance"),
      icon: Ambulance,
    },
    facility.hasIcu && {
      key: "icu",
      label: t("facilities.detail.capabilities.icu"),
      icon: Stethoscope,
    },
    facility.hasNicu && {
      key: "nicu",
      label: t("facilities.detail.capabilities.nicu"),
      icon: Baby,
    },
    facility.hasBloodBank && {
      key: "bloodbank",
      label: t("facilities.detail.capabilities.bloodBank"),
      icon: Droplets,
    },
    facility.hasPharmacy && {
      key: "pharmacy",
      label: t("facilities.detail.capabilities.pharmacy"),
      icon: Pill,
    },
    facility.hasPathologyLab && {
      key: "pathlab",
      label: t("facilities.detail.capabilities.pathologyLab"),
      icon: Microscope,
    },
    facility.hasParkingAvailable && {
      key: "parking",
      label: t("facilities.detail.capabilities.parking"),
      icon: ParkingCircle,
    },
    facility.hasHomeSampleCollection && {
      key: "homesample",
      label: t("facilities.detail.capabilities.homeSample"),
      icon: Home,
    },
    facility.hasOnlineReport && {
      key: "onlinereport",
      label: t("facilities.detail.capabilities.onlineReports"),
      icon: FileCheck,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    icon: typeof Siren;
    isEmergency?: boolean;
  }[];

  return (
    <section className="min-h-screen bg-brand-cream pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/healthcares"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky hover:text-brand-sky-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("facilities.detail.backToList")}
        </Link>

        {/* Hero */}
        <ScrollReveal>
          <div className="relative">
            {/* Cover Band */}
            <div className="relative h-80 sm:h-[28rem] w-full overflow-hidden rounded-t-3xl bg-brand-navy shadow-md">
              {facility.coverImageUrl ? (
                <Image
                  src={facility.coverImageUrl}
                  alt={`${facility.name} building`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1152px"
                  className="object-cover"
                  priority
                />
              ) : (
                <img
                  src={
                    facility.type === "DIAGNOSTIC_CENTER"
                      ? "/images/placeholders/facility-cover-diagnostic.svg"
                      : "/images/placeholders/facility-cover.svg"
                  }
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/50 to-transparent" />

              {/* On-cover identity */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 pr-24 sm:pr-36">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
                  {getFacilityTypeLabel(facility.type).toUpperCase()}
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
                    {facility.name}
                  </h1>
                  <TierBadge tier={facility.listingTier} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  {facility.rating != null && (
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {facility.rating.toFixed(1)}
                      {facility.totalReviews ? (
                        <span className="font-normal text-white/70">({facility.totalReviews})</span>
                      ) : null}
                    </span>
                  )}
                  {facility.rating != null && facility.area ? <span>•</span> : null}
                  {facility.area && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-sky-bright" />
                      {facility.area.name}
                    </span>
                  )}
                  {facility.area && facility.establishedYear ? <span>•</span> : null}
                  {facility.establishedYear ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-white/70" />
                      {t("facilities.detail.established", { year: facility.establishedYear })}
                    </span>
                  ) : null}
                  {(facility.area || facility.establishedYear || facility.rating != null) && facility.openingHours ? <span>•</span> : null}
                  {facility.openingHours ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-white/70" />
                      {facility.openingHours}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Overlapping logo badge */}
              <div className="absolute -bottom-8 sm:-bottom-10 right-6 sm:right-8 h-20 w-20 sm:h-28 sm:w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg z-10">
                <img
                  src={facility.logoUrl || "/images/placeholders/facility-logo.svg"}
                  alt={facility.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* White Content Block */}
            <div className="-mt-4 relative z-0 rounded-b-3xl rounded-t-3xl border border-brand-gray bg-white p-6 sm:p-8 pt-10 sm:pt-12 shadow-sm">
              <div className="flex flex-col gap-4">
                {/* Address Line */}
                {facility.address && (
                  <p className="flex items-start gap-1.5 text-sm text-brand-slate">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                    {facility.address}
                  </p>
                )}

                {/* Stats Strip */}
                {statsList.length > 0 && (
                  <div className={`mt-4 grid ${statsGridColsClass} sm:divide-x divide-brand-gray gap-y-4 rounded-2xl border border-brand-gray bg-brand-cloud/60 py-4 shadow-inner`}>
                    {statsList.map((stat) => (
                      <div key={stat.label} className="flex flex-col items-center justify-center px-2 text-center">
                        <span className="font-serif text-2xl font-bold text-brand-navy">
                          {stat.value}
                        </span>
                        <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted mt-0.5">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Capability Chips Row */}
                {capabilities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                    {capabilities.map((cap) => {
                      const Icon = cap.icon;
                      return (
                        <span
                          key={cap.key}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1 text-xs font-semibold ${
                            cap.isEmergency
                              ? "border-red-200 bg-status-emergency-light/40 text-status-emergency"
                              : "border-brand-gray bg-white text-brand-slate"
                          }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 ${
                              cap.isEmergency ? "text-status-emergency" : "text-brand-sky"
                            }`}
                          />
                          {cap.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Body */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* About */}
            {(facility.longDescription || facility.description) && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.overviewLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.about")}
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-brand-slate whitespace-pre-line">
                    {facility.longDescription || facility.description}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Departments */}
            {facility.departments.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.specialtiesLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.departments")}
                  </h2>
                  <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2">
                    {facility.departments.map((dept) => (
                      <StaggerItem
                        key={dept.name}
                        className="rounded-xl border border-brand-gray bg-brand-cloud/40 p-4 transition-colors hover:bg-brand-cloud/80"
                      >
                        <h3 className="text-sm font-semibold text-brand-navy">
                          {dept.name}
                        </h3>
                        {dept.description && (
                          <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                            {dept.description}
                          </p>
                        )}
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </ScrollReveal>
            )}

            {/* Services */}
            {facility.services.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.pricingAndOffersLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.services")}
                  </h2>
                  <div className="mt-4 divide-y divide-brand-gray border-t border-b border-brand-gray">
                    {facility.services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between py-3 px-1 hover:bg-brand-cloud/40 transition-colors"
                      >
                        <span className="text-sm font-medium text-brand-slate">{service.name}</span>
                        {service.price ? (
                          <span className="text-sm font-mono font-semibold text-brand-navy">
                            ৳{service.price.toString()}
                          </span>
                        ) : (
                          <span className="text-xs text-brand-muted">{t("common.notAvailable")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Diagnostics & Imaging */}
            {(facility.diagnosticTests.length > 0 || facility.imagingServices.length > 0) && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.laboratoryAndRadiologyLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.diagnosticsAndImaging")}
                  </h2>
                  <div className="mt-4 space-y-6">
                    {facility.diagnosticTests.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-slate mb-3">
                          {t("facilities.detail.diagnosticTests")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {facility.diagnosticTests.map((test) => (
                            <span
                              key={test}
                              className="rounded-full bg-brand-cloud px-3 py-1 text-xs font-medium text-brand-slate border border-brand-gray/60"
                            >
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {facility.imagingServices.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-slate mb-3">
                          {t("facilities.detail.imagingAndProcedures")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {facility.imagingServices.map((service) => (
                            <span
                              key={service}
                              className="rounded-full bg-brand-cloud px-3 py-1 text-xs font-medium text-brand-slate border border-brand-gray/60"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Accreditation & Insurance */}
            {(facility.accreditation || facility.dghsLicenceNo || facility.insurancePanels.length > 0) && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.credentialsLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.accreditationAndInsurance")}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {facility.accreditation && (
                      <div className="flex items-center gap-2.5 text-sm text-brand-slate">
                        <Shield className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span>
                          <strong className="font-medium text-brand-navy">{t("facilities.detail.accreditation")}</strong>{" "}
                          {facility.accreditation}
                        </span>
                      </div>
                    )}
                    {facility.dghsLicenceNo && (
                      <div className="flex items-center gap-2.5 text-sm text-brand-slate">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span>
                          <strong className="font-medium text-brand-navy">{t("facilities.detail.dghsLicence")}</strong>{" "}
                          {facility.dghsLicenceNo}
                        </span>
                      </div>
                    )}
                    {facility.insurancePanels.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-slate mb-3">
                          {t("facilities.detail.insurancePanels")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {facility.insurancePanels.map((panel) => (
                            <span
                              key={panel}
                              className="rounded-full bg-brand-cloud px-3 py-1 text-xs font-medium text-brand-slate border border-brand-gray/60"
                            >
                              {panel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Gallery */}
            {facility.gallery.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.mediaLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.gallery")}
                  </h2>
                  <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {facility.gallery.map((image) => (
                      <StaggerItem
                        key={image.id}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-gray bg-brand-cloud"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `${facility.name} photo`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 ease-out hover:scale-105"
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              {/* Contact Card */}
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.getInTouchLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("common.contact")}
                  </h2>

                  <div className="mt-4 flex flex-col gap-2">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-sky px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-sky-dark shadow-sm"
                      >
                        <Phone className="h-4 w-4" />
                        {t("facilities.detail.callNow")}
                      </a>
                    )}
                    {facility.emergencyPhone && (
                      <a
                        href={`tel:${facility.emergencyPhone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-status-emergency px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
                      >
                        <PhoneCall className="h-4 w-4" />
                        {t("facilities.detail.emergencyButton")}
                      </a>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        className="flex items-center gap-2.5 text-brand-slate hover:text-brand-sky transition"
                      >
                        <Phone className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span className="font-mono">{facility.phone}</span>
                      </a>
                    )}
                    {facility.emergencyPhone && (
                      <a
                        href={`tel:${facility.emergencyPhone}`}
                        className="flex items-center gap-2.5 rounded-lg bg-status-emergency-light/60 p-2 text-status-emergency hover:bg-status-emergency-light transition"
                      >
                        <PhoneCall className="h-4 w-4 shrink-0 text-status-emergency" />
                        <span className="font-mono font-medium">{facility.emergencyPhone}</span>
                        <span className="ml-auto text-[0.6rem] font-bold uppercase tracking-wide">
                          {t("facilities.detail.emergencyLabel")}
                        </span>
                      </a>
                    )}
                    {facility.mobile && (
                      <a
                        href={`tel:${facility.mobile}`}
                        className="flex items-center gap-2.5 text-brand-slate hover:text-brand-sky transition"
                      >
                        <Smartphone className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span className="font-mono">{facility.mobile}</span>
                      </a>
                    )}
                    {facility.email && (
                      <a
                        href={`mailto:${facility.email}`}
                        className="flex items-center gap-2.5 break-all text-brand-slate hover:text-brand-sky transition"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span>{facility.email}</span>
                      </a>
                    )}
                    {facility.website && (
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 break-all text-brand-slate hover:text-brand-sky transition"
                      >
                        <Globe className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span>{t("facilities.detail.visitWebsite")}</span>
                      </a>
                    )}
                    {facility.address && (
                      <div className="flex items-start gap-2.5 text-brand-slate pt-1 border-t border-brand-gray/60">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                        <span className="text-xs leading-relaxed text-brand-muted">
                          {facility.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Quick Facts Card */}
              <ScrollReveal delay={0.05}>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-muted">
                    {t("facilities.detail.atAGlanceLabel")}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-brand-navy border-b border-brand-gray pb-3 mt-0.5">
                    {t("facilities.detail.quickFacts")}
                  </h2>

                  <dl className="mt-4 divide-y divide-brand-gray text-sm">
                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-xs text-brand-muted">{t("facilities.detail.type")}</dt>
                      <dd className="font-semibold text-brand-navy">
                        {getFacilityTypeLabel(facility.type)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-xs text-brand-muted">{t("facilities.detail.ownership")}</dt>
                      <dd className="font-semibold text-brand-navy">
                        {facility.ownership || t("common.notAvailable")}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-xs text-brand-muted">{t("facilities.detail.openingHours")}</dt>
                      <dd className="font-semibold text-brand-navy text-right">
                        {facility.openingHours || t("common.notAvailable")}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-xs text-brand-muted">{t("facilities.detail.emergencyQuickFact")}</dt>
                      <dd className="font-semibold text-brand-navy">
                        {facility.hasEmergency ? "24/7" : t("common.notAvailable")}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-xs text-brand-muted">{t("facilities.detail.parking")}</dt>
                      <dd className="font-semibold text-brand-navy">
                        {facility.hasParkingAvailable ? t("common.yes") : t("common.no")}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center gap-1.5 border-t border-brand-gray pt-4 text-[0.65rem] font-mono font-bold uppercase tracking-wider text-status-verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("common.verifiedProvider")}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
