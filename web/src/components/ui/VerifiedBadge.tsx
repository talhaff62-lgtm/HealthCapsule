import { ShieldCheck } from "lucide-react";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  className?: string;
};

export default function VerifiedBadge({
  size = "sm",
  className = "",
}: VerifiedBadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-[0.65rem] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full bg-status-verified-light font-semibold text-status-verified ${sizes[size]} ${className}`}
    >
      <ShieldCheck className={iconSizes[size]} />
      Verified
    </span>
  );
}
