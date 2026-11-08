import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import {
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { SectionCanvas } from "@/components/home/SectionCanvas";

async function getCounts() {
  const [doctors, facilities, specialties, areas] = await Promise.all([
    prisma.doctor.count({
      where: { verificationStatus: "VERIFIED", deletedAt: null, isActive: true },
    }),
    prisma.facility.count({
      where: { deletedAt: null, isActive: true },
    }),
    prisma.specialty.count({ where: { deletedAt: null } }),
    prisma.area.count({ where: { deletedAt: null } }),
  ]);
  return { doctors, facilities, specialties, areas };
}

export default async function StatsBar() {
  const locale = await getServerLocale();
  const t = getT(locale);
  const counts = await getCounts();

  const stats = [
    {
      value: `${counts.doctors}+`,
      label: t("home.statsBar.stat1Label"),
      sub: t("home.statsBar.stat1Sub"),
    },
    {
      value: `${counts.facilities}+`,
      label: t("home.statsBar.stat2Label"),
      sub: t("home.statsBar.stat2Sub"),
    },
    {
      value: `${counts.specialties}`,
      label: t("home.statsBar.stat3Label"),
      sub: t("home.statsBar.stat3Sub"),
    },
    {
      value: `${counts.areas}+`,
      label: t("home.statsBar.stat4Label"),
      sub: t("home.statsBar.stat4Sub"),
    },
  ];

  return (
    <SectionCanvas tone="navy" className="overflow-hidden rounded-[1.75rem]" aria-label={t("home.statsBar.ariaLabel")}>
      {/* Soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-sky/20 blur-3xl"
      />
      <StaggerContainer className="relative mx-auto grid max-w-7xl grid-cols-2 border-l border-white/10 px-6 py-8 sm:py-10 lg:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem
            key={stat.label}
            className="border-b border-r border-t border-white/10 px-6 py-6 sm:px-8 sm:py-8"
          >
            <p className="font-serif text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              <AnimatedCounter value={stat.value} />
            </p>
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-widest text-brand-sky-bright">
              {stat.label}
            </p>
            <p className="mt-1 text-sm text-white/70">{stat.sub}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionCanvas>
  );
}
