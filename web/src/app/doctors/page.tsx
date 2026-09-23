import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { searchDoctors } from "@/lib/doctors";
import DoctorFilters from "@/components/doctors/DoctorFilters";
import DoctorCard from "@/components/doctors/DoctorCard";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Find Doctors — HealthCapsule",
  description: "Search verified doctors by specialty, area, and name in Chattogram.",
};

type SearchParams = Promise<{
  specialty?: string;
  area?: string;
  q?: string;
}>;

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [doctors, specialtyOptions, areaOptions] = await Promise.all([
    searchDoctors({
      specialty: params.specialty,
      area: params.area,
      q: params.q,
    }),
    prisma.specialty.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.area.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const specialties = specialtyOptions.map((s) => ({ value: s.slug, label: s.name }));
  const areas = areaOptions.map((a) => ({ value: a.slug, label: a.name }));

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
            Registry Listings
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Find Verified Doctors
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-xl">
            Search our active registry of BMDC-verified doctors practicing in Chattogram sadar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <DoctorFilters specialties={specialties} areas={areas} />
        </Suspense>

        <div className="mt-8">
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
              No verified doctors found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

