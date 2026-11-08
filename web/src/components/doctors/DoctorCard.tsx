import Link from "next/link";
import { Clock, MapPin, Briefcase, Star, Video, CalendarDays } from "lucide-react";
import { DoctorListItem, isFeaturedDoctor, isNewDoctor, formatScheduleSummary } from "@/lib/doctors";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

type DoctorCardProps = {
  doctor: DoctorListItem;
};

export default async function DoctorCard({ doctor }: DoctorCardProps) {
  const locale = await getServerLocale();
  const t = getT(locale);

  const featured = isFeaturedDoctor(doctor.listingTier);
  const isNew = isNewDoctor(doctor.registrationYear);
  const primarySpecialty = doctor.specialties[0]?.specialty.name;
  const areas = Array.from(
    new Set(doctor.chambers.map((c) => c.area?.name).filter(Boolean))
  );
  const scheduleSummary = formatScheduleSummary(
    doctor.chambers.flatMap((c) => c.schedules)
  );

  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className={`premium-card group flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-card transition-all duration-300 ${
        featured
          ? "border-brand-sky/70"
          : "border-brand-gray"
      }`}
    >
      <div className="flex items-start gap-4 min-w-0">
        {/* Avatar with initials gradient */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy-light to-brand-navy text-base font-semibold text-brand-sky-bright shadow-sm ring-2 ring-brand-cloud-dark">
          {doctor.photoUrl ? (
            <img
              src={doctor.photoUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <img
              src="/images/placeholders/doctor-photo.svg"
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-base font-serif font-semibold text-brand-navy leading-snug group-hover:text-brand-sky transition-colors">
              {doctor.name}
            </h3>
            {featured && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-sky-bg px-2 py-0.5 text-[0.6rem] font-bold text-brand-sky-deep">
                <Star className="h-2.5 w-2.5 fill-current" />
                {t("card.doctor.featured")}
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-brand-navy-light px-2 py-0.5 text-[0.6rem] font-medium text-white">
                {t("card.doctor.new")}
              </span>
            )}
            {doctor.hasOnlineConsultation && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[0.6rem] font-bold text-green-700">
                <Video className="h-2.5 w-2.5" /> {t("card.doctor.online")}
              </span>
            )}
            {doctor.rating != null ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {doctor.rating.toFixed(1)}
                {doctor.totalReviews ? (
                  <span className="font-normal text-amber-600/70">({doctor.totalReviews})</span>
                ) : null}
              </span>
            ) : null}
          </div>

          {primarySpecialty && (
            <p className="text-xs font-semibold text-brand-sky mt-0.5 tracking-wide">
              {primarySpecialty}
            </p>
          )}

          {doctor.degrees.length > 0 && (
            <p className="mt-1.5 truncate text-xs text-brand-muted font-medium">
              {doctor.degrees.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-brand-gray pt-4 text-xs text-brand-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {doctor.yearsExperience ? (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-brand-muted" />
              {t("card.doctor.yearsExperience", { years: doctor.yearsExperience })}
            </span>
          ) : null}
          {areas.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand-muted" />
              {areas.join(", ")}
            </span>
          ) : null}
          {scheduleSummary ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-brand-muted" />
              {scheduleSummary}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-dashed border-brand-gray/60">
          <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-wider text-brand-navy font-semibold">
            <Clock className="h-3.5 w-3.5 text-brand-sky" />
            {t("card.doctor.viewSchedule")}
          </span>
          {doctor.consultationFee ? (
            <span className="text-sm font-semibold text-brand-navy flex items-baseline gap-0.5">
              <span className="text-[0.65rem] font-normal text-brand-muted">{t("card.doctor.from")}</span>
              ৳{doctor.consultationFee}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

