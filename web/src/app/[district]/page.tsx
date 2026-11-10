import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Stethoscope, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import DoctorCard from "@/components/doctors/DoctorCard";
import FacilityCard from "@/components/healthcares/FacilityCard";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import type { DoctorListItem } from "@/lib/doctors";
import type { FacilityListItem } from "@/lib/facilities";

export const revalidate = 300;

type Params = { district: string };

const doctorInclude = {
  specialties: { include: { specialty: { select: { name: true, slug: true } } } },
  chambers: {
    where: { deletedAt: null, isActive: true },
    include: { area: { select: { name: true, slug: true } } },
  },
} as const;

async function loadDistrict(slug: string) {
  return prisma.district.findFirst({
    where: { slug },
    select: { id: true, name: true, bnName: true, slug: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { district: slug } = await params;
  const district = await loadDistrict(slug);
  if (!district) return { title: "Not found — Capsule" };

  const [facilities, doctors] = await Promise.all([
    prisma.facility.count({
      where: { area: { thana: { districtId: district.id } }, isActive: true, deletedAt: null },
    }),
    prisma.doctor.count({
      where: {
        isActive: true,
        deletedAt: null,
        chambers: {
          some: {
            isActive: true,
            deletedAt: null,
            OR: [
              { area: { thana: { districtId: district.id } } },
              { facility: { area: { thana: { districtId: district.id } } } },
            ],
          },
        },
      },
    }),
  ]);

  const empty = facilities === 0 && doctors === 0;
  return {
    title: `${district.name} — Capsule`,
    description: `Find verified doctors, hospitals and diagnostic centers in ${district.name}.`,
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function DistrictPage({ params }: { params: Promise<Params> }) {
  const { district: slug } = await params;
  const district = await loadDistrict(slug);
  if (!district) notFound();

  const locale = await getServerLocale();
  const t = getT(locale);

  const [facilities, doctors, facilityTotal, doctorTotal] = await Promise.all([
    prisma.facility.findMany({
      where: {
        area: { thana: { districtId: district.id } },
        isActive: true,
        deletedAt: null,
      },
      take: 12,
      orderBy: [{ listingTier: "desc" }, { name: "asc" }],
      select: {
        id: true, name: true, slug: true, type: true, phone: true, address: true,
        listingTier: true, rating: true, totalReviews: true, description: true,
        coverImageUrl: true, beds: true, establishedYear: true, hasIcu: true,
        hasEmergency: true, hasAmbulance: true, website: true,
        area: { select: { name: true } },
      },
    }),
    prisma.doctor.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        verificationStatus: VerificationStatus.VERIFIED,
        chambers: {
          some: {
            isActive: true,
            deletedAt: null,
            OR: [
              { area: { thana: { districtId: district.id } } },
              { facility: { area: { thana: { districtId: district.id } } } },
            ],
          },
        },
      },
      take: 8,
      orderBy: [{ listingTier: "desc" }, { name: "asc" }],
      include: doctorInclude,
    }),
    prisma.facility.count({
      where: { area: { thana: { districtId: district.id } }, isActive: true, deletedAt: null },
    }),
    prisma.doctor.count({
      where: {
        isActive: true,
        deletedAt: null,
        chambers: {
          some: {
            isActive: true,
            deletedAt: null,
            OR: [
              { area: { thana: { districtId: district.id } } },
              { facility: { area: { thana: { districtId: district.id } } } },
            ],
          },
        },
      },
    }),
  ]);

  const empty = facilityTotal === 0 && doctorTotal === 0;

  const doctorItems: DoctorListItem[] = doctors.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    photoUrl: d.photoUrl,
    degrees: d.degrees,
    yearsExperience: d.yearsExperience,
    consultationFee: d.consultationFee?.toString() ?? null,
    registrationYear: d.registrationYear,
    listingTier: d.listingTier,
    rating: d.rating,
    totalReviews: d.totalReviews,
    hasOnlineConsultation: d.hasOnlineConsultation,
    specialties: d.specialties,
    chambers: d.chambers.map((c) => ({
      area: c.area,
      schedules: [],
    })),
  }));

  const facilityItems: FacilityListItem[] = facilities.map((f) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    type: f.type,
    phone: f.phone,
    address: f.address,
    area: f.area,
    listingTier: f.listingTier,
    rating: f.rating,
    totalReviews: f.totalReviews,
    description: f.description,
    coverImageUrl: f.coverImageUrl,
    beds: f.beds,
    establishedYear: f.establishedYear,
    hasIcu: f.hasIcu,
    hasEmergency: f.hasEmergency,
    hasAmbulance: f.hasAmbulance,
    website: f.website,
  }));

  const displayName = locale === "bn" && district.bnName ? district.bnName : district.name;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-10 flex flex-col gap-3">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/10 bg-brand-mist px-3 py-1 text-xs font-medium text-ink-muted">
          <MapPin className="h-3.5 w-3.5" />
          {t("district.in")}
        </p>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{displayName}</h1>
        {!empty && (
          <div className="flex flex-wrap gap-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1">
              <Stethoscope className="h-3.5 w-3.5" />
              {doctorTotal} {t("district.doctors")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1">
              <Building2 className="h-3.5 w-3.5" />
              {facilityTotal} {t("district.healthcares")}
            </span>
          </div>
        )}
      </header>

      {empty ? (
        <section className="rounded-3xl border border-ink/8 bg-brand-mist/50 p-10 text-center">
          <p className="text-lg font-semibold text-ink">
            {t("district.comingSoonTitle")}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{t("district.comingSoonBody")}</p>
          <Link
            href="/doctors"
            className="mt-6 inline-flex items-center rounded-full bg-brand-sky px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-sky-dark"
          >
            {t("district.browseAll")}
          </Link>
        </section>
      ) : (
        <div className="flex flex-col gap-12">
          {doctors.length > 0 && (
            <section>
              <h2 className="mb-5 text-xl font-semibold text-ink">{t("district.doctors")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctorItems.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </div>
            </section>
          )}
          {facilities.length > 0 && (
            <section>
              <h2 className="mb-5 text-xl font-semibold text-ink">{t("district.healthcares")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {facilityItems.map((f) => (
                  <FacilityCard key={f.id} facility={f} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
