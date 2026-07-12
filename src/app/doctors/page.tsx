import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { searchDoctors } from "@/lib/doctors";
import DoctorFilters from "@/components/doctors/DoctorFilters";
import DoctorCard from "@/components/doctors/DoctorCard";

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
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Find Verified Doctors
          </h1>
          <p className="mt-2 text-brand-muted">
            Search by specialty, area, or doctor name.
          </p>
        </div>

        <Suspense fallback={null}>
          <DoctorFilters specialties={specialties} areas={areas} />
        </Suspense>

        <div className="mt-8">
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-10 text-center text-brand-muted">
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
    </section>
  );
}
