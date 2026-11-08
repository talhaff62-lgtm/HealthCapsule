import { ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  className?: string;
};

export default async function VerifiedBadge({
  size = "sm",
  className = "",
}: VerifiedBadgeProps) {
  const locale = await getServerLocale();
  const t = getT(locale);

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
      {t("common.verified.verified")}
    </span>
  );
}
