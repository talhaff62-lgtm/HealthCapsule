import React from "react";

const tones = {
  white: "bg-white",
  tint: "bg-brand-sky-bg-soft/60",
  navy: "bg-brand-navy text-white",
} as const;

export function SectionCanvas({
  tone = "white",
  id,
  className = "",
  children,
  ...rest
}: React.ComponentProps<"section"> & {
  tone?: keyof typeof tones;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-[1.75rem] shadow-soft sm:rounded-[var(--radius-canvas)] ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}
