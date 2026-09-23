import { FacilityType } from "@prisma/client";

type FacilityTypeBadgeProps = {
  type: FacilityType;
  className?: string;
};

const facilityConfig: Record<
  FacilityType,
  { label: string; colorClass: string }
> = {
  HOSPITAL: {
    label: "Hospital",
    colorClass: "bg-brand-navy-light text-white",
  },
  DIAGNOSTIC_CENTER: {
    label: "Diagnostics",
    colorClass: "bg-facility-diagnostic-bg text-facility-diagnostic",
  },
  CLINIC: {
    label: "Clinic",
    colorClass: "bg-facility-clinic-bg text-facility-clinic",
  },
};

export default function FacilityTypeBadge({
  type,
  className = "",
}: FacilityTypeBadgeProps) {
  const config = facilityConfig[type];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider ${config.colorClass} ${className}`}
    >
      {config.label}
    </span>
  );
}
