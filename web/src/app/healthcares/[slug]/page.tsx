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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getFacilityTypeLabel } from "@/lib/facility-helpers";
import TierBadge from "@/components/ui/TierBadge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";

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

  const capabilities = [
    facility.hasEmergency && {
      key: "emergency",
      label: "24/7 Emergency",
      icon: Siren,
      className: "bg-status-emergency/20 text-status-emergency",
    },
    facility.hasIcu && {
      key: "icu",
      label: "ICU",
      icon: Stethoscope,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasNicu && {
      key: "nicu",
      label: "NICU",
      icon: Baby,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasAmbulance && {
      key: "ambulance",
      label: "Ambulance",
      icon: Ambulance,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasBloodBank && {
      key: "bloodbank",
      label: "Blood Bank",
      icon: Droplets,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasPharmacy && {
      key: "pharmacy",
      label: "Pharmacy",
      icon: Pill,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasPathologyLab && {
      key: "pathlab",
      label: "Pathology Lab",
      icon: Microscope,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
    facility.hasParkingAvailable && {
      key: "parking",
      label: "Parking",
      icon: ParkingCircle,
      className: "bg-brand-sky/10 text-brand-sky-bright",
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    icon: typeof Siren;
    className: string;
  }[];

  return (
    <section className="min-h-screen bg-brand-cream pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/healthcares"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky hover:text-brand-sky-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to healthcare providers
        </Link>

        {/* Hero */}
        <ScrollReveal>
          <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-xl border border-brand-sky/15">
            {/* Cover banner */}
            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-brand-navy to-brand-navy-light sm:h-56">
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
                  src="/images/placeholders/facility-cover.svg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Logo / initials avatar */}
                <div className="-mt-16 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-sky-light to-brand-sky text-2xl font-bold text-white sm:h-32 sm:w-32 sm:text-3xl border-4 border-brand-navy shadow-md">
                  {facility.logoUrl ? (
                    <img
                      src={facility.logoUrl}
                      alt={facility.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="/images/placeholders/facility-logo.svg"
                      alt={facility.name}
                      className="h-full w-full object-cover"
                    />
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

                  {facility.rating != null && (
                    <span className="mt-4 ml-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {facility.rating.toFixed(1)}
                      {facility.totalReviews ? <span className="text-white/60">({facility.totalReviews} reviews)</span> : null}
                    </span>
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
                {capabilities.map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <span
                      key={cap.key}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${cap.className}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cap.label}
                    </span>
                  );
                })}
              </div>
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-bold uppercase tracking-wider text-brand-sky-bright">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Provider
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Body */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* About */}
            {(facility.longDescription || facility.description) && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
                    About
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-brand-slate whitespace-pre-line">
                    {facility.longDescription || facility.description}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Departments */}
            {facility.departments.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
                    Departments
                  </h2>
                  <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2">
                    {facility.departments.map((dept) => (
                      <StaggerItem
                        key={dept.name}
                        className="rounded-lg border border-brand-gray bg-brand-cloud/50 p-4"
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
              </ScrollReveal>
            )}

            {/* Diagnostic Tests */}
            {facility.diagnosticTests.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">Diagnostic Tests</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {facility.diagnosticTests.map((test) => (
                      <span key={test} className="rounded-full border border-brand-gray bg-brand-cloud/50 px-3 py-1 text-xs font-medium text-brand-slate">{test}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Imaging Services */}
            {facility.imagingServices.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">Imaging & Procedures</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {facility.imagingServices.map((service) => (
                      <span key={service} className="rounded-full border border-brand-gray bg-brand-cloud/50 px-3 py-1 text-xs font-medium text-brand-slate">{service}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Accreditation & Insurance */}
            {(facility.accreditation || facility.dghsLicenceNo || facility.insurancePanels.length > 0) && (
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">Accreditation & Insurance</h2>
                  <div className="mt-4 space-y-3">
                    {facility.accreditation && (
                      <div className="flex items-center gap-2 text-sm text-brand-slate">
                        <Shield className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span className="font-medium">Accreditation:</span> {facility.accreditation}
                      </div>
                    )}
                    {facility.dghsLicenceNo && (
                      <div className="flex items-center gap-2 text-sm text-brand-slate">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-sky" />
                        <span className="font-medium">DGHS Licence:</span> {facility.dghsLicenceNo}
                      </div>
                    )}
                    {facility.insurancePanels.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-brand-slate mb-2">Insurance Panels</p>
                        <div className="flex flex-wrap gap-2">
                          {facility.insurancePanels.map((panel) => (
                            <span key={panel} className="rounded-full border border-brand-gray bg-brand-cloud/50 px-3 py-1 text-xs font-medium text-brand-slate">{panel}</span>
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
                  <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
                    Gallery
                  </h2>
                  <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {facility.gallery.map((image) => (
                      <StaggerItem
                        key={image.id}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-brand-gray bg-brand-cloud"
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
              {/* Contact card */}
              <ScrollReveal>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Contact
                  </h2>

                  {facility.phone && (
                    <a
                      href={`tel:${facility.phone}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-sky px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-sky-dark"
                    >
                      <Phone className="h-4 w-4" />
                      Call now
                    </a>
                  )}

                  <div className="mt-4 flex flex-col gap-3 text-sm">
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
                      <a href={`tel:${facility.emergencyPhone}`} className="flex items-center gap-2.5 text-brand-slate hover:text-brand-sky transition">
                        <PhoneCall className="h-4 w-4 shrink-0 text-status-emergency" />
                        <span className="font-mono">{facility.emergencyPhone}</span>
                        <span className="text-[0.6rem] font-semibold text-status-emergency uppercase">Emergency</span>
                      </a>
                    )}
                    {facility.mobile && (
                      <a href={`tel:${facility.mobile}`} className="flex items-center gap-2.5 text-brand-slate hover:text-brand-sky transition">
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
                        {facility.email}
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
                        Visit website ↗
                      </a>
                    )}
                    {facility.address && (
                      <p className="flex items-start gap-2.5 text-brand-muted">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                        {facility.address}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Quick facts */}
              <ScrollReveal delay={0.05}>
                <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Quick facts
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    {facility.beds ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">
                          Beds
                        </dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">
                          {facility.beds}
                        </dd>
                      </div>
                    ) : null}
                    {facility.establishedYear ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">
                          Established
                        </dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">
                          {facility.establishedYear}
                        </dd>
                      </div>
                    ) : null}
                    {facility.icuBeds ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">ICU Beds</dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">{facility.icuBeds}</dd>
                      </div>
                    ) : null}
                    {facility.nicuBeds ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">NICU Beds</dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">{facility.nicuBeds}</dd>
                      </div>
                    ) : null}
                    {facility.operationTheaters ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">OT</dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">{facility.operationTheaters}</dd>
                      </div>
                    ) : null}
                    {facility.doctorsOnPanel ? (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">Doctors</dt>
                        <dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">{facility.doctorsOnPanel}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">
                        Type
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-brand-navy">
                        {getFacilityTypeLabel(facility.type)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">
                        Emergency
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-brand-navy">
                        {facility.hasEmergency ? "24/7" : "—"}
                      </dd>
                    </div>
                    {facility.ownership && (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">Ownership</dt>
                        <dd className="mt-1 text-sm font-semibold text-brand-navy">{facility.ownership}</dd>
                      </div>
                    )}
                    {facility.openingHours && (
                      <div>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-brand-muted">Hours</dt>
                        <dd className="mt-1 text-sm font-semibold text-brand-navy">{facility.openingHours}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5 flex items-center gap-1.5 border-t border-brand-gray pt-4 text-[0.65rem] font-mono font-bold uppercase tracking-wider text-status-verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Provider
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
