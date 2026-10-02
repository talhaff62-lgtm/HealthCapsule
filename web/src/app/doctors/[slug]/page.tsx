import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import {
  Award,
  Briefcase,
  Building2,
  Clock,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  Users,
  Video,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getNextAvailableSlot } from "@/lib/doctors";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BackButton from "@/components/ui/BackButton";

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
          facility: {
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

  const baseFee = doctor.consultationFee?.toString() ?? null;

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackButton />

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-xl border border-brand-sky/15">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Profile Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-sky-light to-brand-sky text-2xl font-bold text-white sm:h-32 sm:w-32 sm:text-3xl ring-1 ring-white/15 shadow-md">
                {doctor.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <img
                    src="/images/placeholders/doctor-photo.svg"
                    alt={doctor.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {doctor.name}
                  </h1>
                  <VerifiedBadge size="sm" className="bg-brand-sky/10 text-brand-sky-bright" />
                </div>

                {doctor.specialties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {doctor.specialties.map((s) => (
                      <span
                        key={s.specialty.slug}
                        className="inline-block rounded-full bg-brand-navy-light border border-brand-navy-muted/20 px-3 py-0.5 text-xs text-brand-sky-bright font-medium"
                      >
                        {s.specialty.name}
                      </span>
                    ))}
                  </div>
                )}

                {doctor.expertise && (
                  <p className="mt-1 text-xs text-white/70 italic">
                    Expertise: {doctor.expertise}
                  </p>
                )}

                {doctor.bmdcRegNo && (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    <ShieldCheck className="h-4 w-4 text-brand-sky-bright" />
                    BMDC Reg: {doctor.bmdcRegNo}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/70 font-medium">
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
                  <p className="mt-4 flex items-start gap-1.5 text-xs text-white/80 leading-relaxed font-semibold">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky-bright" />
                    {doctor.degrees.join(", ")}
                  </p>
                )}

                {doctor.medicalCollege && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-white/70">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky-bright" />
                    {doctor.medicalCollege}
                    {doctor.pgInstitution ? ` • PG: ${doctor.pgInstitution}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:px-8">
            <div>
              <p className="text-xs font-mono font-medium uppercase tracking-wider text-white/70">
                Consultation fee
              </p>
              <p className="text-xl font-bold text-white">
                {formatFee(baseFee) ?? "Contact for fee"}
              </p>
            </div>
            <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-brand-sky-bright bg-brand-sky/10 px-3 py-1 rounded-full border border-brand-sky/20">
              BMDC Verified Professional
            </span>
            {doctor.hasOnlineConsultation && (
              <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 inline-flex items-center gap-1">
                <Video className="h-3 w-3" />
                Online Consultation
              </span>
            )}
            {doctor.rating != null && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {doctor.rating.toFixed(1)}
                {doctor.totalReviews ? <span className="text-white/50">({doctor.totalReviews})</span> : null}
              </span>
            )}
          </div>
        </div>

        {(doctor.phone || doctor.email || doctor.patientsTreated || doctor.currentPosition) && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">
              Professional Details
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {doctor.currentPosition && (
                <div className="flex items-center gap-2.5 text-sm text-brand-slate">
                  <Stethoscope className="h-4 w-4 shrink-0 text-brand-sky" />
                  {doctor.currentPosition}
                </div>
              )}
              {doctor.phone && (
                <a href={`tel:${doctor.phone}`} className="flex items-center gap-2.5 text-sm text-brand-slate hover:text-brand-sky transition">
                  <Phone className="h-4 w-4 shrink-0 text-brand-sky" />
                  <span className="font-mono">{doctor.phone}</span>
                </a>
              )}
              {doctor.email && (
                <a href={`mailto:${doctor.email}`} className="flex items-center gap-2.5 text-sm text-brand-slate hover:text-brand-sky transition break-all">
                  <Mail className="h-4 w-4 shrink-0 text-brand-sky" />
                  {doctor.email}
                </a>
              )}
              {doctor.patientsTreated ? (
                <div className="flex items-center gap-2.5 text-sm text-brand-slate">
                  <Users className="h-4 w-4 shrink-0 text-brand-sky" />
                  {doctor.patientsTreated.toLocaleString()} patients treated
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* About */}
        {doctor.bio && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-lg font-semibold text-brand-navy border-b border-brand-gray pb-3">About Dr. {doctor.name.split(" ").slice(-1)[0]}</h2>
            <div
              className="bio-content mt-3 text-sm leading-relaxed text-brand-muted"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(doctor.bio) as string),
              }}
            />
          </div>
        )}

        {/* Chambers */}
        <div className="mt-8">
          <h2 className="mb-4 font-serif text-lg font-semibold text-brand-navy">
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
                    className="rounded-2xl border-y border-r border-brand-gray border-l-4 border-l-brand-sky bg-white p-5 shadow-sm transition hover:border-brand-sky/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                          {chamber.facility && (
                            <Link
                              href={`/healthcares/${chamber.facility.slug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-sky uppercase tracking-wider font-mono"
                            >
                              <Building2 className="h-4 w-4" />
                              {chamber.facility.name}
                            </Link>
                          )}
                          {chamber.area && (
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky uppercase tracking-wider font-mono">
                              <MapPin className="h-4 w-4" />
                              {chamber.area.name}
                            </p>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-brand-slate">
                          {chamber.address ?? "Address not available"}
                        </p>

                        {nextSlot ? (
                          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-status-verified-light px-3 py-1 text-xs font-semibold text-status-verified">
                            <Clock className="h-4 w-4" />
                            Next slot: {nextSlot.label}
                          </p>
                        ) : (
                          <p className="mt-4 text-xs text-brand-muted italic">
                            No schedule available currently
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-[0.65rem] font-mono font-medium uppercase tracking-wider text-brand-muted">
                          Chamber fee
                        </p>
                        <p className="text-base font-bold text-brand-navy mt-0.5">
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

