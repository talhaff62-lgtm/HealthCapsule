import { Star, Crown, Check } from "lucide-react";
import { ListingTier } from "@prisma/client";

type TierBadgeProps = {
  tier: ListingTier;
  className?: string;
};

const tierConfig: Record<
  ListingTier,
  {
    label: string;
    colorClass: string;
    icon: typeof Star | typeof Crown | typeof Check | null;
  }
> = {
  FREE: {
    label: "Listed",
    colorClass: "bg-brand-gray text-brand-slate",
    icon: null,
  },
  VERIFIED: {
    label: "Verified",
    colorClass: "bg-tier-verified-bg text-tier-verified",
    icon: Check,
  },
  FEATURED: {
    label: "Featured",
    colorClass: "bg-tier-featured-bg text-brand-navy",
    icon: Star,
  },
  PREMIUM: {
    label: "Premium",
    colorClass: "bg-tier-premium-bg text-tier-premium",
    icon: Crown,
  },
};

export default function TierBadge({ tier, className = "" }: TierBadgeProps) {
  if (tier === "FREE") return null;

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wider ${config.colorClass} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3 fill-current" />}
      {config.label}
    </span>
  );
}
