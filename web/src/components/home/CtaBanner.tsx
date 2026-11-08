import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import Link from "next/link";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion";

export default async function CtaBanner() {
  const locale = await getServerLocale();
  const t = getT(locale);

  return (
    <SectionCanvas tone="navy" className="overflow-hidden rounded-[1.75rem]" aria-label={t("home.cta.ariaLabel")}>
      {/* Soft glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-sky/20 blur-3xl opacity-25" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-teal/20 blur-3xl opacity-25" />

      <div className="relative mx-auto grid max-w-7xl md:grid-cols-2">
        {/* Patient CTA */}
        <ScrollReveal className="flex flex-col justify-between p-8 sm:p-12 md:border-r border-white/10">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
              {t("home.cta.patientBadge")}
            </span>
            <h3 className="mt-3 font-serif text-3xl font-medium text-white sm:text-4xl">
              {t("home.cta.patientTitle")}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              {t("home.cta.patientDesc")}
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-card transition hover:bg-brand-mist"
            >
              {t("home.cta.patientButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Doctor CTA */}
        <ScrollReveal delay={0.1} className="flex flex-col justify-between border-t border-white/10 p-8 sm:p-12 md:border-t-0">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
              {t("home.cta.doctorBadge")}
            </span>
            <h3 className="mt-3 font-serif text-3xl font-medium text-white sm:text-4xl">
              {t("home.cta.doctorTitle")}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              {t("home.cta.doctorDesc")}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register?type=doctor"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-card transition hover:bg-brand-mist"
            >
              <UserPlus className="h-4 w-4 text-brand-sky" />
              {t("home.cta.doctorButton")}
            </Link>
            <Link
              href="/register?type=facility"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Building2 className="h-4 w-4 text-brand-sky-bright" />
              {t("home.cta.facilityButton")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </SectionCanvas>
  );
}
