import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { ShieldCheck, Heart, Lock, Award } from "lucide-react";

export default async function TrustSection() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const points = [
    {
      icon: ShieldCheck,
      title: t("home.trust.point1Title"),
      desc: t("home.trust.point1Desc"),
    },
    {
      icon: Award,
      title: t("home.trust.point2Title"),
      desc: t("home.trust.point2Desc"),
    },
    {
      icon: Lock,
      title: t("home.trust.point3Title"),
      desc: t("home.trust.point3Desc"),
    },
  ];

  return (
    <SectionCanvas tone="tint" id="trust">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Text & List */}
          <div>
            <ScrollReveal>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
                {t("home.trust.badge")}
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                {t("home.trust.title")}
              </h2>
              <p className="mt-3 leading-relaxed text-ink-muted">
                {t("home.trust.desc")}
              </p>
            </ScrollReveal>

            <StaggerContainer className="mt-8 space-y-6">
              {points.map((pt) => (
                <StaggerItem key={pt.title} className="flex items-start gap-4 rounded-xl p-4 transition duration-300 hover:bg-white/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-sky-bg text-brand-sky-deep">
                    <pt.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{pt.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pt.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Right Column: Verification seal */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative flex h-64 w-64 flex-col items-center justify-center rounded-[2rem] bg-white p-8 text-center shadow-soft ring-1 ring-ink/5 motion-safe:animate-[skyPulse_3s_ease-in-out_infinite] sm:h-72 sm:w-72">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sky-bg">
                <Heart className="h-7 w-7 text-brand-sky stroke-[1.5]" />
              </div>
              <span className="block font-serif text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
                {t("home.trust.sealPercent")}
              </span>
              <span className="mt-1 block font-mono text-[0.7rem] font-bold uppercase tracking-widest text-brand-sky-deep">
                {t("home.trust.sealLabel")}
              </span>
              <span className="mx-auto mt-3 block max-w-[180px] text-[0.7rem] leading-relaxed text-ink-muted">
                {t("home.trust.sealDesc")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionCanvas>
  );
}
