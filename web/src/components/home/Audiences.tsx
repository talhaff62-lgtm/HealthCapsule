import React from "react";
import { User, ShieldAlert, Building2 } from "lucide-react";
import { SectionCanvas } from "@/components/home/SectionCanvas";

export default function Audiences() {
  const audiences = [
    {
      role: "Patients",
      title: "Ages 18–65, anywhere in Chattogram",
      icon: User,
      bullets: [
        "Search verified doctors by specialty and area",
        "Book appointments online with SMS alerts",
        "Keep every prescription safe in the Vault",
        "Reach nearest ambulance in one tap",
        "Find verified blood donors immediately",
      ],
    },
    {
      role: "Doctors",
      title: "Independent & affiliated chambers",
      icon: ShieldAlert,
      bullets: [
        "A verified profile patients can trust",
        "Self-managed booking slots and chambers",
        "Reputation built on authentic patient reviews",
        "Featured placements in specialties",
        "Analytics on booking trends and counts",
      ],
    },
    {
      role: "Hospitals & Clinics",
      title: "Private & public medical facilities",
      icon: Building2,
      bullets: [
        "Digital storefront for departmental grids",
        "Reduced call-center load via web channels",
        "Lower no-shows through automated reminders",
        "Partnership portals for laboratory routing",
        "Integrated ambulance dispatch coordinates",
      ],
    },
  ];

  return (
    <SectionCanvas tone="white" id="audiences">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            Who it&apos;s for
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Three roles, one trusted workspace.
          </h2>
          <p className="mt-3 text-ink-muted">
            Patients, doctors, and hospitals all coordinate on the same verified registry — avoiding duplicated, broken directories.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {audiences.map((aud) => (
            <div
              key={aud.role}
              className="flex flex-col justify-between rounded-3xl border border-ink/5 bg-white p-8 shadow-card"
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
