import Link from "next/link";
import { Building2, MapPin, Phone } from "lucide-react";
import { FacilityType, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Healthcare Providers — HealthCapsule",
  description:
    "Browse verified hospitals, diagnostic centers, and clinics in Chattogram.",
};

const FACILITY_TYPES: FacilityType[] = [
  "HOSPITAL",
  "DIAGNOSTIC_CENTER",
  "CLINIC",
];

const TYPE_BADGE_CLASS: Record<FacilityType, string> = {
  HOSPITAL: "bg-brand-navy-light text-white",
  DIAGNOSTIC_CENTER: "bg-brand-sky text-white",
  CLINIC: "bg-brand-cloud text-brand-navy border border-brand-gray",
};

const TYPE_LABEL: Record<FacilityType, string> = {
  HOSPITAL: "Hospital",
  DIAGNOSTIC_CENTER: "Diagnostic Center",
  CLINIC: "Clinic",
};

const TABS: { value: FacilityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "HOSPITAL", label: "Hospitals" },
  { value: "DIAGNOSTIC_CENTER", label: "Diagnostic Centers" },
  { value: "CLINIC", label: "Clinics" },
];

type SearchParams = Promise<{ type?: string }>;

function parseType(raw: string | undefined): FacilityType | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  return FACILITY_TYPES.includes(upper as FacilityType)
    ? (upper as FacilityType)
    : undefined;
}

export default async function HealthcaresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedType = parseType(params.type);

  const facilities = await prisma.facility.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      verificationStatus: VerificationStatus.VERIFIED,
      ...(selectedType ? { type: selectedType } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      phone: true,
      address: true,
      area: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const activeType = selectedType ?? "ALL";

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-brand-sky-bright">
          <Building2 className="h-3.5 w-3.5" />
          Registry Listings
        </span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
          Healthcare Providers
        </h1>
        <p className="mt-2 text-sm text-brand-muted max-w-xl">
          Verified hospitals and diagnostic centers in Chattogram.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = tab.value === activeType;
            const href = tab.value === "ALL" ? "/healthcares" : `/healthcares?type=${tab.value}`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-navy text-white"
                    : "border border-brand-gray bg-white text-brand-navy hover:border-brand-navy"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {facilities.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
            No verified facilities found.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <article
                key={facility.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-gray bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-serif text-base font-semibold text-brand-navy leading-snug">
                    {facility.name}
                  </h2>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider ${TYPE_BADGE_CLASS[facility.type]}`}
                  >
                    {TYPE_LABEL[facility.type]}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-brand-muted">
                  {facility.area?.name ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {facility.area.name}
                    </span>
                  ) : null}
                  {facility.address ? (
                    <span className="line-clamp-2">{facility.address}</span>
                  ) : null}
                </div>

                {facility.phone ? (
                  <div className="mt-auto flex items-center gap-1 border-t border-brand-gray pt-3 text-xs text-brand-navy font-semibold">
                    <Phone className="h-3.5 w-3.5 text-brand-sky" />
                    <span className="font-mono">{facility.phone}</span>
                  </div>
                ) : null}

                <div className="mt-auto border-t border-brand-gray pt-3">
                  <Link
                    href="#"
                    className="inline-flex items-center text-xs font-semibold text-brand-navy hover:text-brand-sky"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
