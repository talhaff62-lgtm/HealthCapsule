import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { FacilityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { searchFacilities } from "@/lib/facilities";
import { parseFacilityType } from "@/lib/facility-helpers";
import FacilityCard from "@/components/healthcares/FacilityCard";
import Pagination from "@/components/ui/Pagination";
import { ScrollReveal, StaggerContainer } from "@/components/ui/motion";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

const TABS: { value: FacilityType | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "facilities.listing.tabAll" },
  { value: "HOSPITAL", labelKey: "facilities.listing.tabHospitals" },
  { value: "DIAGNOSTIC_CENTER", labelKey: "facilities.listing.tabDiagnosticCenters" },
  { value: "CLINIC", labelKey: "facilities.listing.tabClinics" },
];

type SearchParams = Promise<{ type?: string; page?: string }>;

type Params = Promise<{
  district: string;
}>;

async function loadDistrict(slug: string) {
  return prisma.district.findFirst({
    where: { slug },
    select: { id: true, name: true, bnName: true, slug: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}) {
  const { district: slug } = await params;
  const district = await loadDistrict(slug);
  if (!district) return { title: "Healthcare Providers — Capsule" };

  return {
    title: `Healthcare Providers in ${district.name} — Capsule`,
    description: `Browse verified hospitals, diagnostic centers, and clinics in ${district.name}.`,
  };
}

export default async function DistrictHealthcaresPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { district: slug } = await params;
  const district = await loadDistrict(slug);
  if (!district) notFound();

  const locale = await getServerLocale();
  const t = getT(locale);

  const queryParams = await searchParams;
  const pageParam = parseInt(queryParams.page ?? "1", 10) || 1;
  const selectedType = parseFacilityType(queryParams.type);

  const { items: facilities, total, page, pageSize } = await searchFacilities({
    type: queryParams.type,
    page: pageParam,
    district: district.slug ?? undefined,
  });

  const activeType = selectedType ?? "ALL";
  const displayName = locale === "bn" && district.bnName ? district.bnName : district.name;
  const basePath = `/${district.slug ?? "chattogram"}/healthcares`;

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <ScrollReveal>
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-brand-sky-bright">
            <Building2 className="h-3.5 w-3.5" />
            {t("facilities.listing.registryListings")} • {displayName}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            {t("facilities.listing.healthcareProviders")} ({displayName})
          </h1>
          <p className="mt-2 text-sm text-brand-muted max-w-xl">
            {t("facilities.listing.verifiedHospitalsDescription")}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = tab.value === activeType;
              const href =
                tab.value === "ALL" ? basePath : `${basePath}?type=${tab.value}`;
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
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {total > 0 && (
          <p className="mb-4 text-sm text-brand-muted">
            {t("facilities.listing.showingRange", { count: facilities.length, total })}
          </p>
        )}

        {facilities.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
            {t("facilities.listing.noFacilitiesFound")}
          </div>
        ) : (
          <>
            <StaggerContainer
              key={`${queryParams.type ?? "all"}-${pageParam}`}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </StaggerContainer>

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / pageSize)}
                basePath={basePath}
                queryParams={{ type: queryParams.type }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
