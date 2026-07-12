import Link from "next/link";
import { Star, Clock, MapPin, Briefcase } from "lucide-react";
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
      className={`premium-card group flex flex-col gap-4 rounded-2xl bg-white p-5 ${
        featured ? "border-brand-gold" : "border-brand-gray"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-cream text-lg font-bold text-brand-gold">
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
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-brand-navy">
              {doctor.name}
            </h3>
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold-light px-2 py-0.5 text-xs font-semibold text-brand-navy">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-brand-navy-light/10 px-2 py-0.5 text-xs font-medium text-brand-navy-light">
                New
              </span>
            )}
          </div>

          {primarySpecialty && (
            <p className="text-sm font-medium text-brand-gold">{primarySpecialty}</p>
          )}

          {doctor.degrees.length > 0 && (
            <p className="mt-1 truncate text-sm text-brand-muted">
              {doctor.degrees.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-brand-gray pt-4 text-sm text-brand-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {doctor.yearsExperience ? (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {doctor.yearsExperience} yrs exp.
            </span>
          ) : null}
          {areas.length > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {areas.join(", ")}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brand-gold">
            <Clock className="h-3.5 w-3.5" />
            View schedule
          </span>
          {doctor.consultationFee ? (
            <span className="font-semibold text-brand-navy">
              ৳{doctor.consultationFee}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
