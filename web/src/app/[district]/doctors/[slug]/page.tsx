import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  GraduationCap,
  Languages,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  User,
  Video,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { getNextAvailableSlot, formatScheduleSummary } from "@/lib/doctors";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BackButton from "@/components/ui/BackButton";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

type DoctorProfilePageProps = {
  params: Promise<{ district: string; slug: string }>;
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
      title: "Not Found — Capsule",
    };
  }

  return {
    title: `${doctor.name} — Capsule`,
    description: `Book an appointment with ${doctor.name}. View chambers, consultation fees, and available schedules.`,
  };
}

export default async function DistrictDoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const { district, slug } = await params;
  const doctor = await getVerifiedDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const baseFee = doctor.consultationFee?.toString() ?? null;
  const lastName = doctor.name.split(" ").slice(-1)[0] || doctor.name;

  const hasCredentials =
    Boolean(doctor.medicalCollege) ||
    Boolean(doctor.pgInstitution) ||
    Boolean(doctor.bmdcRegNo) ||
    Boolean(doctor.currentPosition) ||
    doctor.degrees.length > 0;

  const locale = await getServerLocale();
  const t = getT(locale);

  const DAY_LABEL_KEYS = [
    "common.dayLabels.sun",
    "common.dayLabels.mon",
    "common.dayLabels.tue",
    "common.dayLabels.wed",
    "common.dayLabels.thu",
    "common.dayLabels.fri",
    "common.dayLabels.sat",
  ];

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        <BackButton fallbackHref={`/${district}/doctors`} />

        {/* 1. Hero Card */}
        <div className="overflow-hidden rounded-3xl bg-white border border-brand-gray shadow-sm">
          <div className="flex flex-col sm:flex-row">
            {/* Photo Block */}
            <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:h-auto sm:w-72 lg:w-80 sm:self-stretch sm:shrink-0">
              <div className="h-full w-full overflow-hidden bg-brand-sky-bg sm:rounded-l-3xl">
                {doctor.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src="/images/placeholders/doctor-photo.svg"
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 z-10 bg-emerald-500 text-white p-1 rounded-full shadow-md inline-flex items-center justify-center ring-4 ring-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            {/* Right Column */}
            <div className="min-w-0 flex-1 p-6 sm:p-8">
              <span className="font-mono text-xs uppercase tracking-wider text-brand-muted font-semibold block">
                {t("doctors.detail.meetTheDoctor")}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-4xl sm:text-5xl text-brand-navy font-bold">
                  {doctor.name}
                </h1>
                <VerifiedBadge size="sm" />
              </div>

              {doctor.specialties.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {doctor.specialties.map((s) => (
                    <span
                      key={s.specialty.slug}
                      className="inline-block rounded-full bg-brand-sky-bg text-brand-sky-deep text-xs font-medium px-3 py-1"
                    >
                      {s.specialty.name}
                    </span>
                  ))}
                </div>
              )}

              {doctor.expertise && (
                <p className="mt-2 text-xs sm:text-sm italic text-brand-slate">
                  {t("doctors.detail.expertiseIn", { expertise: doctor.expertise })}
                </p>
              )}

              {/* Stats Row */}
              {(doctor.yearsExperience ||
                doctor.rating != null ||
                doctor.patientsTreated) && (
                <div className="my-4 flex flex-wrap items-center gap-4 sm:gap-6 border-y border-brand-gray/60 py-3">
                  {doctor.yearsExperience ? (
                    <div>
                      <span className="text-xl font-bold text-brand-navy">
                        {doctor.yearsExperience}+
                      </span>
                      <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                        {t("common.yearsExperience")}
                      </span>
                    </div>
                  ) : null}

                  {doctor.rating != null && (
                    <div className={doctor.yearsExperience ? "border-l border-brand-gray/60 pl-4 sm:pl-6" : ""}>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xl font-bold text-brand-navy">
                          {doctor.rating.toFixed(1)}
                        </span>
                        {doctor.totalReviews ? (
                          <span className="text-xs text-brand-muted">
                            ({doctor.totalReviews})
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                        {t("common.ratingAndReviews")}
                      </span>
                    </div>
                  )}

                  {doctor.patientsTreated ? (
                    <div className={(doctor.yearsExperience || doctor.rating != null) ? "border-l border-brand-gray/60 pl-4 sm:pl-6" : ""}>
                      <span className="text-xl font-bold text-brand-navy">
                        {doctor.patientsTreated.toLocaleString()}+
                      </span>
                      <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                        {t("common.patientsTreated")}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Badge Row */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-brand-slate">
                {doctor.bmdcRegNo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream border border-brand-gray px-3 py-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-sky-deep" />
                    {t("doctors.detail.bmdcReg", { regNo: doctor.bmdcRegNo })}
                  </span>
                )}

                {doctor.hasOnlineConsultation && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 font-medium">
                    <Video className="h-3.5 w-3.5 text-emerald-600" />
                    {t("doctors.detail.onlineConsultationAvailable")}
                  </span>
                )}

                {doctor.languages.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream border border-brand-gray px-3 py-1 font-medium">
                    <Languages className="h-3.5 w-3.5 text-brand-sky-deep" />
                    {doctor.languages.join(", ")}
                  </span>
                )}

                {doctor.gender && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream border border-brand-gray px-3 py-1 font-medium capitalize">
                    <User className="h-3.5 w-3.5 text-brand-sky-deep" />
                    {doctor.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hero Bottom Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-gray px-6 sm:px-8 py-4">
            <div>
              <p className="text-[0.65rem] font-mono font-medium uppercase tracking-wider text-brand-muted">
                {t("common.consultationFee")}
              </p>
              <p className="text-2xl font-bold text-brand-navy">
                {formatFee(baseFee) ?? t("common.contactForFee")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {doctor.email && (
                <a
                  href={`mailto:${doctor.email}`}
                  title={doctor.email}
                  className="p-2.5 rounded-xl border border-brand-gray text-brand-navy hover:text-brand-sky hover:border-brand-sky transition"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
              {doctor.phone && (
                <a
                  href={`tel:${doctor.phone}`}
                  className="bg-brand-sky text-white rounded-xl px-5 py-2.5 font-semibold text-sm inline-flex items-center gap-2 hover:bg-brand-sky-deep transition"
                >
                  <Phone className="h-4 w-4" />
                  {t("doctors.detail.callDoctor")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2. Education & Credentials Section */}
        {hasCredentials && (
          <div className="rounded-2xl border border-brand-gray bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-brand-navy mb-5">
              {t("doctors.detail.educationAndCredentials")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {doctor.medicalCollege && (
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-brand-sky-bg text-brand-sky-deep flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                      {t("doctors.detail.mbbs")}
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">
                      {doctor.medicalCollege}
                    </span>
                  </div>
                </div>
              )}

              {doctor.pgInstitution && (
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-brand-sky-bg text-brand-sky-deep flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                      {t("doctors.detail.postgraduate")}
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">
                      {doctor.pgInstitution}
                    </span>
                  </div>
                </div>
              )}

              {doctor.bmdcRegNo && (
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-brand-sky-bg text-brand-sky-deep flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                      {t("doctors.detail.registration")}
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">
                      BMDC {doctor.bmdcRegNo}
                    </span>
                  </div>
                </div>
              )}

              {doctor.currentPosition && (
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-brand-sky-bg text-brand-sky-deep flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                      {t("doctors.detail.designation")}
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">
                      {doctor.currentPosition}
                    </span>
                  </div>
                </div>
              )}

              {doctor.degrees.length > 0 && (
                <div className="flex items-center gap-3.5 sm:col-span-2">
                  <div className="h-10 w-10 rounded-full bg-brand-sky-bg text-brand-sky-deep flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-brand-muted block">
                      {t("doctors.detail.degrees")}
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">
                      {doctor.degrees.join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. About Section */}
        {doctor.bio && (
          <div className="rounded-2xl border border-brand-gray bg-white p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-muted font-semibold block">
              {t("common.aboutLabel")}
            </span>
            <h2 className="font-serif text-xl font-semibold text-brand-navy mt-1">
              {t("doctors.detail.about", { name: lastName })}
            </h2>
            <div className="border-l-2 border-brand-sky pl-4 mt-3">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-brand-slate">
                {doctor.bio}
              </p>
            </div>
          </div>
        )}

        {/* 4. Chambers & Schedules */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-brand-muted font-semibold block">
              {t("doctors.detail.appointmentsLabel")}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-navy mt-0.5">
              {t("doctors.detail.chambersAndSchedules")}
            </h2>
          </div>

          {doctor.chambers.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
              {t("doctors.detail.noChambers")}
            </div>
          ) : (
            <div className="grid gap-4">
              {doctor.chambers.map((chamber) => {
                const chamberFee = chamber.consultationFee?.toString() ?? baseFee;
                const nextSlot = getNextAvailableSlot(chamber.schedules);
                const summary = formatScheduleSummary(chamber.schedules);
                const scheduledDaySet = new Set(chamber.schedules.map((s) => s.dayOfWeek));

                return (
                  <div
                    key={chamber.id}
                    className="rounded-2xl border-y border-r border-brand-gray border-l-4 border-l-brand-sky bg-white p-6 shadow-sm transition hover:border-brand-sky/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {chamber.facility && (
                            <Link
                              href={`/${district}/healthcares/${chamber.facility.slug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-sky uppercase tracking-wider font-mono"
                            >
                              <Building2 className="h-4 w-4" />
                              {chamber.facility.name}
                            </Link>
                          )}
                          {chamber.area && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-sky-deep bg-brand-sky-bg px-2.5 py-0.5 rounded-full">
                              <MapPin className="h-3 w-3" />
                              {chamber.area.name}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-brand-muted">
                          {chamber.address ?? t("common.addressNotAvailable")}
                        </p>

                        {/* Schedule Block */}
                        <div className="mt-4">
                          {chamber.schedules.length > 0 ? (
                            <>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {DAY_LABEL_KEYS.map((dayKey, index) => {
                                  const isScheduled = scheduledDaySet.has(index);
                                  return (
                                    <span
                                      key={dayKey}
                                      className={`h-7 w-9 text-[0.6rem] font-semibold rounded-full inline-flex items-center justify-center ${
                                        isScheduled
                                          ? "bg-brand-navy text-white"
                                          : "bg-brand-cloud text-brand-muted"
                                      }`}
                                    >
                                      {t(dayKey)}
                                    </span>
                                  );
                                })}
                              </div>

                              {summary && (
                                <p className="mt-3 text-sm font-semibold text-brand-navy inline-flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-brand-sky" />
                                  {summary}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-brand-muted italic">
                              {t("doctors.detail.noScheduleAvailable")}
                            </p>
                          )}
                        </div>

                        {/* Next Available Slot */}
                        {nextSlot && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <Clock className="h-3.5 w-3.5 text-emerald-600" />
                              {t("doctors.detail.nextSlot", { label: nextSlot.label })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <span className="text-[0.65rem] font-mono font-medium uppercase tracking-wider text-brand-muted block">
                          {t("common.chamberFee")}
                        </span>
                        <span className="text-lg font-bold text-brand-navy mt-0.5 block">
                          {formatFee(chamberFee) ?? t("common.contactForFee")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Contact Strip */}
        {(doctor.phone || doctor.email) && (
          <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-muted font-semibold block">
                {t("common.contact")}
              </span>
              <h3 className="font-serif text-lg font-semibold text-brand-navy mt-0.5">
                {t("common.getInTouch")}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
              {doctor.phone && (
                <a
                  href={`tel:${doctor.phone}`}
                  className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-sky transition"
                >
                  <Phone className="h-4 w-4 text-brand-sky" />
                  {doctor.phone}
                </a>
              )}
              {doctor.email && (
                <a
                  href={`mailto:${doctor.email}`}
                  className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-sky transition break-all"
                >
                  <Mail className="h-4 w-4 text-brand-sky" />
                  {doctor.email}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
