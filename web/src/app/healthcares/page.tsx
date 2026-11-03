import Link from "next/link";
import { Building2 } from "lucide-react";
import { FacilityType } from "@prisma/client";
import { searchFacilities } from "@/lib/facilities";
import { parseFacilityType } from "@/lib/facility-helpers";
import FacilityCard from "@/components/healthcares/FacilityCard";
import Pagination from "@/components/ui/Pagination";
import { ScrollReveal, StaggerContainer } from "@/components/ui/motion";

export const metadata = {
  title: "Healthcare Providers — Capsule",
  description:
    "Browse verified hospitals, diagnostic centers, and clinics in Chattogram.",
};

const TABS: { value: FacilityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "HOSPITAL", label: "Hospitals" },
  { value: "DIAGNOSTIC_CENTER", label: "Diagnostic Centers" },
  { value: "CLINIC", label: "Clinics" },
];

type SearchParams = Promise<{ type?: string; page?: string }>;

export default async function HealthcaresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const pageParam = parseInt(params.page ?? "1", 10) || 1;
  const selectedType = parseFacilityType(params.type);

  const { items: facilities, total, page, pageSize } = await searchFacilities({
    type: params.type,
    page: pageParam,
  });

  const activeType = selectedType ?? "ALL";

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <ScrollReveal>
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
              const href =
                tab.value === "ALL" ? "/healthcares" : `/healthcares?type=${tab.value}`;
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
        </ScrollReveal>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {total > 0 && (
          <p className="mb-4 text-sm text-brand-muted">
            Showing <span className="font-semibold text-brand-navy">{facilities.length}</span> of {total} verified facilities
          </p>
        )}

        {facilities.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
            No verified facilities found.
          </div>
        ) : (
          <>
            <StaggerContainer
              key={`${params.type ?? "all"}-${pageParam}`}
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
                basePath="/healthcares"
                queryParams={{ type: params.type }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
