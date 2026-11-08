import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { User, ShieldAlert, Building2 } from "lucide-react";
import { SectionCanvas } from "@/components/home/SectionCanvas";

export default async function Audiences() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const audiences = [
    {
      role: t("home.audiences.patientRole"),
      title: t("home.audiences.patientTitle"),
      icon: User,
      bullets: [
        t("home.audiences.patientBullet1"),
        t("home.audiences.patientBullet2"),
        t("home.audiences.patientBullet3"),
        t("home.audiences.patientBullet4"),
        t("home.audiences.patientBullet5"),
      ],
    },
    {
      role: t("home.audiences.doctorRole"),
      title: t("home.audiences.doctorTitle"),
      icon: ShieldAlert,
      bullets: [
        t("home.audiences.doctorBullet1"),
        t("home.audiences.doctorBullet2"),
        t("home.audiences.doctorBullet3"),
        t("home.audiences.doctorBullet4"),
        t("home.audiences.doctorBullet5"),
      ],
    },
    {
      role: t("home.audiences.hospitalRole"),
      title: t("home.audiences.hospitalTitle"),
      icon: Building2,
      bullets: [
        t("home.audiences.hospitalBullet1"),
        t("home.audiences.hospitalBullet2"),
        t("home.audiences.hospitalBullet3"),
        t("home.audiences.hospitalBullet4"),
        t("home.audiences.hospitalBullet5"),
      ],
    },
  ];

  return (
    <SectionCanvas tone="white" id="audiences">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            {t("home.audiences.badge")}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            {t("home.audiences.title")}
          </h2>
          <p className="mt-3 text-ink-muted">
            {t("home.audiences.desc")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {audiences.map((aud) => (
            <div
              key={aud.role}
              className="flex flex-col justify-between rounded-3xl border border-ink/5 bg-white p-6 shadow-card"
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sky-bg text-brand-sky-deep">
                  <aud.icon className="h-6 w-6 stroke-[1.5]" />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
                  {aud.role}
                </span>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">
                  {aud.title}
                </h3>

                <ul className="mt-6 space-y-3">
                  {aud.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-sky" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCanvas>
  );
}
