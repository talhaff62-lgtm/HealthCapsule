import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
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
    <section className="min-h-screen bg-brand-gray py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/doctors"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-teal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to doctors
        </Link>

        <div className="overflow-hidden rounded-2xl border border-brand-gray bg-brand-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-2xl font-bold text-brand-teal sm:h-32 sm:w-32 sm:text-3xl">
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
                <h1
                  className="text-2xl font-bold text-brand-slate sm:text-3xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {doctor.name}
                </h1>

                {doctor.bmdcRegNo && (
                  <p className="mt-1 inline-flex items-center rounded-full bg-brand-teal/10 px-3 py-1 text-sm font-medium text-brand-teal">
                    BMDC Reg: {doctor.bmdcRegNo}
                  </p>
                )}

                {doctor.specialties.length > 0 && (
                  <p className="mt-3 text-brand-muted">
                    {doctor.specialties
                      .map((s) => s.specialty.name)
                      .join(", ")}
                  </p>
                )}

                {doctor.degrees.length > 0 && (
                  <p className="mt-2 text-brand-slate">
                    {doctor.degrees.join(", ")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-brand-muted">
                  {doctor.yearsExperience ? (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {doctor.yearsExperience} years experience
                    </span>
                  ) : null}

                  {doctor.languages.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      Speaks {doctor.languages.join(", ")}
                    </span>
                  )}

                  {doctor.gender && (
                    <span className="inline-flex items-center gap-1 capitalize">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {doctor.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {doctor.bio && (
              <div className="mt-8 border-t border-brand-gray pt-6">
                <h2 className="text-lg font-semibold text-brand-slate">
                  About
                </h2>
                <p className="mt-2 leading-relaxed text-brand-muted">
                  {doctor.bio}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-brand-gray bg-brand-gray/30 px-6 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-brand-muted">Consultation fee</p>
                <p className="text-xl font-semibold text-brand-teal">
                  {formatFee(baseFee) ?? "Contact for fee"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-brand-slate">
            Chambers & Schedules
          </h2>

          {doctor.chambers.length === 0 ? (
            <div className="rounded-xl border border-brand-gray bg-brand-white p-6 text-center text-brand-muted">
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
                    className="rounded-xl border border-brand-gray bg-brand-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {chamber.area && (
                          <p className="text-sm font-medium text-brand-teal">
                            {chamber.area.name}
                          </p>
                        )}
                        <p className="mt-1 text-brand-slate">
                          {chamber.address ?? "Address not available"}
                        </p>

                        {nextSlot ? (
                          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-3 py-1 text-sm font-medium text-brand-teal">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Next available: {nextSlot.label}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-brand-muted">
                            No schedule available
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm text-brand-muted">
                          Chamber fee
                        </p>
                        <p className="text-lg font-semibold text-brand-teal">
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
