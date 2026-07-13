import Link from "next/link";
import { Clock, MapPin, Briefcase, Star } from "lucide-react";
import { DoctorListItem, isFeaturedDoctor, isNewDoctor } from "@/lib/doctors";

type DoctorCardProps = {
  doctor: DoctorListItem;
};

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const featured = isFeaturedDoctor(doctor.listingTier);
  const isNew = isNewDoctor(doctor.registrationYear);
  const primarySpecialty = doctor.specialties[0]?.specialty.name;
  const areas = Array.from(
    new Set(doctor.chambers.map((c) => c.area?.name).filter(Boolean))
  );

  const initials = doctor.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className={`premium-card group flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-300 ${
        featured
          ? "border-brand-sky/70 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.18)]"
          : "border-brand-gray"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with initials gradient */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy-light to-brand-navy text-base font-semibold text-brand-sky-bright shadow-sm ring-2 ring-brand-cloud-dark">
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
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-base font-serif font-semibold text-brand-navy leading-snug group-hover:text-brand-sky transition-colors">
              {doctor.name}
            </h3>
            {featured && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-sky-bg px-2 py-0.5 text-[0.6rem] font-bold text-brand-sky-deep">
                <Star className="h-2.5 w-2.5 fill-current" />
                Featured
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-brand-navy-light px-2 py-0.5 text-[0.6rem] font-medium text-white">
                New
              </span>
            )}
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
              {doctor.yearsExperience} yrs exp.
            </span>
          ) : null}
          {areas.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand-muted" />
              {areas.join(", ")}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-dashed border-brand-gray/60">
          <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-wider text-brand-navy font-semibold">
            <Clock className="h-3.5 w-3.5 text-brand-sky" />
            View schedule
          </span>
          {doctor.consultationFee ? (
            <span className="text-sm font-semibold text-brand-navy flex items-baseline gap-0.5">
              <span className="text-[0.65rem] font-normal text-brand-muted">From</span>
              ৳{doctor.consultationFee}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

