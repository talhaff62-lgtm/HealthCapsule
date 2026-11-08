import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function HeroIllustration() {
  const locale = await getServerLocale();
  const t = getT(locale);

  return (
    <div className="relative flex items-center justify-center">
      {/* Soft backdrop */}
      <div className="absolute h-[400px] w-[400px] rounded-full bg-brand-sky/10 blur-[80px]" aria-hidden="true" />

      {/* Illustration */}
      <div className="relative z-10 w-full max-w-[360px] animate-hero-float-illustration lg:max-w-[500px]">
        <img src="/images/hero-doctor.svg" alt="" aria-hidden="true" className="h-auto w-full" />
      </div>

      {/* Floating verified badge chip */}
      <div className="absolute -top-2 right-6 z-20 hidden animate-hero-float-1 sm:block">
        <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-lg shadow-brand-navy/20">
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-status-verified">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <span className="text-xs font-semibold text-brand-slate">{t("home.heroIllustration.badgeVerified")}</span>
        </div>
      </div>

      {/* Floating mini doctor card */}
      <div className="absolute bottom-4 -left-4 z-20 hidden animate-hero-float-2 sm:block">
        <div className="w-56 rounded-2xl border border-brand-gray bg-white p-4 shadow-2xl shadow-brand-navy/40 ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy-light to-brand-navy text-sm font-semibold text-brand-sky-bright">SA</div>
            <div>
              <p className="font-serif text-sm font-semibold text-brand-navy">{t("home.heroIllustration.doctorName")}</p>
              <p className="text-[0.7rem] font-semibold text-brand-sky">{t("home.heroIllustration.doctorSpecialty")}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-brand-gray pt-2.5">
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-brand-navy">{t("home.heroIllustration.labelViewSchedule")}</span>
            <div className="text-sm font-semibold text-brand-navy">
              <span className="text-[0.62rem] font-normal text-brand-muted">{t("home.heroIllustration.labelFrom")}</span> {t("home.heroIllustration.priceFrom")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
