import Image from "next/image";
import Link from "next/link";

type LogoSize = "xs" | "sm" | "md" | "lg";

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
  { icon: string; wordmark: string; tagline: string; gap: string }
> = {
  xs: {
    icon: "h-9 w-9",
    wordmark: "text-xl",
    tagline: "text-[0.4rem] tracking-[0.08em]",
    gap: "gap-2",
  },
  sm: {
    icon: "h-11 w-auto",
    wordmark: "text-[1.9rem]",
    tagline: "text-[0.4rem] tracking-[0.08em]",
    gap: "gap-2",
  },
  md: {
    icon: "h-[56px] w-auto",
    wordmark: "text-[2.4rem]",
    tagline: "text-[0.5rem] tracking-[0.09em]",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-[72px] w-auto",
    wordmark: "text-[2.9rem]",
    tagline: "text-[0.6rem] tracking-[0.1em]",
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
        width={52}
        height={52}
        className={`${s.icon} shrink-0 object-contain`}
      />
      <span className={`flex flex-col items-center leading-none ${s.gap}`}>
        <span className={`font-sans font-bold tracking-tight ${s.wordmark}`}>
          <span className="text-brand-sky">Capsule</span>
        </span>
        {showTagline && (
          <span className="w-full flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-px bg-brand-sky flex-1 min-w-2"
            />
            <span
              className={`font-sans font-medium uppercase whitespace-nowrap text-brand-sky ${s.tagline}`}
            >
              Your Health, Our Priority
            </span>
            <span
              aria-hidden="true"
              className="h-px bg-brand-sky flex-1 min-w-2"
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
      aria-label="Capsule — home"
    >
      {mark}
    </Link>
  );
}

export default Logo;
