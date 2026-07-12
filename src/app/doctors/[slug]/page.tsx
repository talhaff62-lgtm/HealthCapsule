import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Clock,
  Languages,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getNextAvailableSlot } from "@/lib/doctors";

export const dynamic = "force-dynamic";

type DoctorProfilePageProps = {
  params: Promise<{ slug: string }>;
};

async function getVerifiedDoctorBySlug(slug: string) {
  const doctor = await prisma.doctor.findUnique({
    where: {
      slug,
      verificationStatus: VerificationStatus.VERIFIED,
      deletedAt: null,
      isActive: true,
    },
    include: {
      specialties: {
        include: {
          specialty: {
            select: { name: true, slug: true },
          },
        },
      },
      chambers: {
        where: {
          deletedAt: null,
          isActive: true,
        },
        include: {
          area: {
            select: { name: true, slug: true },
          },
          schedules: {
            where: {
              deletedAt: null,
              isActive: true,
            },
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
            orderBy: { dayOfWeek: "asc" },
          },
        },
      },
    },
  });

  return doctor;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatFee(amount: string | null | undefined): string | null {
  if (!amount) return null;
  return `৳${amount}`;
}

export async function generateMetadata({
  params,
}: DoctorProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getVerifiedDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "Not Found — HealthCapsule",
    };
  }

  return {
    title: `${doctor.name} — HealthCapsule`,
    description: `Book an appointment with ${doctor.name}. View chambers, consultation fees, and available schedules.`,
  };
}

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const { slug } = await params;
  const doctor = await getVerifiedDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const initials = getInitials(doctor.name);
  const baseFee = doctor.consultationFee?.toString() ?? null;

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/doctors"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to doctors
        </Link>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-lg">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-cream text-2xl font-bold text-brand-gold sm:h-32 sm:w-32 sm:text-3xl">
                {doctor.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                  {doctor.name}
                </h1>

                {doctor.specialties.length > 0 && (
                  <p className="mt-1 text-brand-gold">
                    {doctor.specialties.map((s) => s.specialty.name).join(", ")}
                  </p>
                )}

                {doctor.bmdcRegNo && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-brand-navy-muted">
                    <ShieldCheck className="h-4 w-4 text-brand-gold" />
                    BMDC Reg: {doctor.bmdcRegNo}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-navy-muted">
                  {doctor.yearsExperience ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {doctor.yearsExperience} years experience
                    </span>
                  ) : null}

                  {doctor.languages.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Languages className="h-4 w-4" />
                      Speaks {doctor.languages.join(", ")}
                    </span>
                  )}

                  {doctor.gender && (
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <User className="h-4 w-4" />
                      {doctor.gender}
                    </span>
                  )}
                </div>

                {doctor.degrees.length > 0 && (
                  <p className="mt-4 flex items-start gap-1.5 text-sm text-brand-navy-muted">
                    <Award className="mt-0.5 h-4 w-4 shrink-0" />
                    {doctor.degrees.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-navy-muted">
                Consultation fee
              </p>
              <p className="text-xl font-semibold text-white">
                {formatFee(baseFee) ?? "Contact for fee"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-verified-light px-3 py-1 text-xs font-semibold text-status-verified">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
        </div>

        {/* About */}
        {doctor.bio && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-brand-navy">About</h2>
            <p className="mt-3 leading-relaxed text-brand-muted">{doctor.bio}</p>
          </div>
        )}

        {/* Chambers */}
        <div className="mt-8">
          <h2 className="mb-4 font-serif text-xl font-semibold text-brand-navy">
            Chambers & Schedules
          </h2>

          {doctor.chambers.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
              No chambers listed for this doctor.
            </div>
          ) : (
            <div className="grid gap-4">
              {doctor.chambers.map((chamber) => {
                const chamberFee =
                  chamber.consultationFee?.toString() ?? baseFee;
                const nextSlot = getNextAvailableSlot(chamber.schedules);

                return (
                  <div
                    key={chamber.id}
                    className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm transition hover:border-brand-gold/30"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {chamber.area && (
                          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold">
                            <MapPin className="h-4 w-4" />
                            {chamber.area.name}
                          </p>
                        )}
                        <p className="mt-1 text-brand-slate">
                          {chamber.address ?? "Address not available"}
                        </p>

                        {nextSlot ? (
                          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-3 py-1 text-sm font-medium text-brand-gold">
                            <Clock className="h-4 w-4" />
                            Next available: {nextSlot.label}
                          </p>
                        ) : (
                          <p className="mt-4 text-sm text-brand-muted">
                            No schedule available
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                          Chamber fee
                        </p>
                        <p className="text-lg font-semibold text-brand-navy">
                          {formatFee(chamberFee) ?? "Contact for fee"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
