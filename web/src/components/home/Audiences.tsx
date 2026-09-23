import React from "react";
import { User, ShieldAlert, Building2 } from "lucide-react";

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
    <section id="audiences" className="bg-brand-cream-dark/20 py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-navy">
            Who it&apos;s for
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Three roles, one trusted workspace.
          </h2>
          <p className="mt-4 text-brand-muted">
            Patients, doctors, and hospitals all coordinate on the same verified registry — avoiding duplicated, broken directories.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {audiences.map((aud) => (
            <div
              key={aud.role}
              className="premium-card bg-white rounded-2xl p-8 border border-brand-gray flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sky flex items-center justify-center text-white mb-6">
                  <aud.icon className="h-6 w-6 stroke-[1.5]" />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky">
                  {aud.role}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-brand-navy leading-snug">
                  {aud.title}
                </h3>

                <ul className="mt-6 space-y-3">
                  {aud.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-brand-muted leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-sky mt-2 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
