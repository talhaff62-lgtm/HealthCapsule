import Link from "next/link";
import { DoctorListItem } from "@/lib/doctors";
import { isFeaturedDoctor, isNewDoctor } from "@/lib/doctors";

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
      className={`premium-card group flex flex-col gap-4 rounded-xl bg-brand-white p-5 ${
        featured ? "border-brand-gold" : "border-brand-gray"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
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
            <h3 className="truncate text-lg font-semibold text-brand-slate">
              {doctor.name}
            </h3>
            {featured && (
              <span className="rounded-full bg-brand-gold-light px-2 py-0.5 text-xs font-medium text-brand-gold">
                Featured
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs font-medium text-brand-teal">
                New
              </span>
            )}
          </div>

          {primarySpecialty && (
            <p className="text-sm text-brand-muted">{primarySpecialty}</p>
          )}

          {doctor.degrees.length > 0 && (
            <p className="mt-1 truncate text-sm text-brand-slate">
              {doctor.degrees.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-brand-gray pt-4 text-sm">
        <div className="space-x-3 text-brand-muted">
          {doctor.yearsExperience ? (
            <span>{doctor.yearsExperience} yrs exp.</span>
          ) : null}
          {areas.length > 0 ? <span>• {areas.join(", ")}</span> : null}
        </div>
        {doctor.consultationFee ? (
          <span className="font-semibold text-brand-teal">
            ৳{doctor.consultationFee}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
