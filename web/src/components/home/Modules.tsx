import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import {
  Search,
  Building,
  Calendar,
  AlertTriangle,
  FileText,
  Star,
  Bell,
  Heart,
} from "lucide-react";

export default async function Modules() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const modules = [
    {
      num: t("home.modules.module1Num"),
      title: t("home.modules.module1Title"),
      desc: t("home.modules.module1Desc"),
      icon: Search,
    },
    {
      num: t("home.modules.module2Num"),
      title: t("home.modules.module2Title"),
      desc: t("home.modules.module2Desc"),
      icon: Building,
    },
    {
      num: t("home.modules.module3Num"),
      title: t("home.modules.module3Title"),
      desc: t("home.modules.module3Desc"),
      icon: Calendar,
    },
    {
      num: t("home.modules.module4Num"),
      title: t("home.modules.module4Title"),
      desc: t("home.modules.module4Desc"),
      icon: AlertTriangle,
    },
    {
      num: t("home.modules.module5Num"),
      title: t("home.modules.module5Title"),
      desc: t("home.modules.module5Desc"),
      icon: FileText,
    },
    {
      num: t("home.modules.module6Num"),
      title: t("home.modules.module6Title"),
      desc: t("home.modules.module6Desc"),
      icon: Star,
    },
    {
      num: t("home.modules.module7Num"),
      title: t("home.modules.module7Title"),
      desc: t("home.modules.module7Desc"),
      icon: Bell,
    },
    {
      num: t("home.modules.module8Num"),
      title: t("home.modules.module8Title"),
      desc: t("home.modules.module8Desc"),
      icon: Heart,
    },
  ];

  return (
    <section id="modules" className="bg-brand-navy py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
            {t("home.modules.badge")}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            {t("home.modules.title")}
          </h2>
          <p className="mt-4 text-white/80">
            {t("home.modules.desc")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.num}
              className="group relative rounded-2xl border border-white/10 bg-brand-navy-light/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-sky hover:shadow-lg hover:shadow-brand-sky/10"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-navy/60 border border-white/10 flex items-center justify-center text-brand-sky-bright group-hover:border-brand-sky/40 group-hover:bg-brand-sky/10 transition-colors">
                <m.icon className="h-5 w-5" />
              </div>
              <span className="mt-6 block font-mono text-[0.65rem] font-medium tracking-wider text-brand-sky-bright">
                {m.num}
              </span>
              <h3 className="mt-2 text-base font-semibold text-white">
                {m.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/75">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
