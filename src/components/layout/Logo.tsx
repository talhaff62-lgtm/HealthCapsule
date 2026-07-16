import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /** Link target. Pass `null` to render without an anchor (plain mark). */
  href?: string | null;
  /** Preset size; scales icon + text together. */
  size?: LogoSize;
  /** Show the "YOUR HEALTH, OUR PRIORITY" tagline with flanking lines. */
  showTagline?: boolean;
  /** Extra classes for the outer element. */
  className?: string;
}

const SIZE_CLASSES: Record<
  LogoSize,
  { icon: string; wordmark: string; tagline: string; line: string; gap: string }
> = {
  sm: {
    icon: "h-9 w-9",
    wordmark: "text-xl",
    tagline: "text-[0.35rem] tracking-[0.14em]",
    line: "w-3",
    gap: "gap-2",
  },
  md: {
    icon: "h-12 w-12",
    wordmark: "text-2xl",
    tagline: "text-[0.4rem] tracking-[0.16em]",
    line: "w-4",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-16 w-16",
    wordmark: "text-3xl",
    tagline: "text-[0.5rem] tracking-[0.18em]",
    line: "w-5",
    gap: "gap-3",
  },
};

export function Logo({
  href = "/",
  size = "md",
  showTagline = true,
  className,
}: LogoProps) {
  const s = SIZE_CLASSES[size];

  const mark = (
    <span className={`inline-flex items-center ${s.gap}`}>
      <Image
        src="/images/logo.png"
        alt=""
        width={48}
        height={48}
        className={`${s.icon} shrink-0 object-contain`}
      />
      <span className="flex flex-col leading-none">
        <span className={`font-sans font-bold tracking-tight ${s.wordmark}`}>
          <span className="text-white">Health</span>
          <span className="text-brand-sky">Capsule</span>
        </span>
        {showTagline && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-px bg-brand-sky ${s.line}`}
            />
            <span
              className={`font-sans font-medium uppercase whitespace-nowrap text-brand-sky ${s.tagline}`}
            >
              Your Health, Our Priority
            </span>
            <span
              aria-hidden="true"
              className={`h-px bg-brand-sky ${s.line}`}
            />
          </span>
        )}
      </span>
    </span>
  );

  if (href === null) {
    return (
      <span className={`${className ?? ""} notranslate`} translate="no">
        {mark}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className ?? ""} notranslate`}
      translate="no"
      aria-label="HealthCapsule — home"
    >
      {mark}
    </Link>
  );
}

export default Logo;
