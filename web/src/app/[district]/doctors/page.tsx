import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { searchDoctors } from "@/lib/doctors";
import DoctorFilters from "@/components/doctors/DoctorFilters";
import DoctorCard from "@/components/doctors/DoctorCard";
import Pagination from "@/components/ui/Pagination";
import { ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

type SearchParams = Promise<{
  specialty?: string;
  area?: string;
  q?: string;
  page?: string;
  minRating?: string;
  maxFee?: string;
  day?: string;
  online?: string;
}>;

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
  if (!district) return { title: "Find Doctors — Capsule" };

  return {
    title: `Find Verified Doctors in ${district.name} — Capsule`,
    description: `Search verified doctors by specialty, area, and name in ${district.name}.`,
  };
}

export default async function DistrictDoctorsPage({
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

  const minRatingNum = queryParams.minRating ? Number(queryParams.minRating) : undefined;
  const minRating = minRatingNum !== undefined && !isNaN(minRatingNum) ? minRatingNum : undefined;

  const maxFeeNum = queryParams.maxFee ? Number(queryParams.maxFee) : undefined;
  const maxFee = maxFeeNum !== undefined && !isNaN(maxFeeNum) ? maxFeeNum : undefined;

  const dayNum = queryParams.day ? Number(queryParams.day) : undefined;
  const day = dayNum !== undefined && !isNaN(dayNum) ? dayNum : undefined;

  const online = queryParams.online === "1";

  const [{ items: doctors, total, page, pageSize }, specialtyOptions, areaOptions] =
    await Promise.all([
      searchDoctors({
        specialty: queryParams.specialty,
        area: queryParams.area,
        q: queryParams.q,
        page: pageParam,
        minRating,
        maxFee,
        day,
        online,
        district: district.slug ?? undefined,
      }),
      prisma.specialty.findMany({
        where: { deletedAt: null },
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.area.findMany({
        where: {
          deletedAt: null,
          thana: { districtId: district.id },
        },
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

  const specialties = specialtyOptions.map((s) => ({ value: s.slug, label: s.name }));
  const areas = areaOptions.map((a) => ({ value: a.slug, label: a.name }));
  const displayName = locale === "bn" && district.bnName ? district.bnName : district.name;

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      {/* Search Header Banner */}
      <div className="relative overflow-hidden bg-brand-navy py-12 mb-8 border-b border-brand-sky/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[250px] w-[250px] rounded-full bg-brand-sky/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-brand-navy-light/40 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-brand-sky-bright">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("doctors.listing.registryListings")} • {displayName}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            {t("doctors.listing.findVerifiedDoctors")} ({displayName})
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-xl">
            {t("doctors.listing.searchActiveRegistry")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <DoctorFilters specialties={specialties} areas={areas} />
        </Suspense>

        <div className="mt-8">
          {total > 0 && (
            <p className="mb-4 text-sm text-brand-muted">
              {t("doctors.listing.showingRange", { count: doctors.length, total })}
            </p>
          )}

          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
              {t("doctors.listing.noDoctorsFound")}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} district={district.slug ?? undefined} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / pageSize)}
                basePath={`/${district.slug ?? "chattogram"}/doctors`}
                queryParams={{
                  specialty: queryParams.specialty,
                  area: queryParams.area,
                  q: queryParams.q,
                  minRating: queryParams.minRating,
                  maxFee: queryParams.maxFee,
                  day: queryParams.day,
                  online: queryParams.online,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
