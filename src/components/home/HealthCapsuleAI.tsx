import React from "react";
import { MessageSquare, Cpu, FileSpreadsheet, AreaChart, HeartHandshake, ShieldAlert } from "lucide-react";

export default function HealthCapsuleAI() {
  const capabilities = [
    {
      status: "LIVE NOW",
      title: "Symptom-to-specialty chat",
      desc: "Type symptoms in plain English or Bengali and the assistant suggests a likely specialty and urgency level, routing you to the directory.",
      icon: MessageSquare,
      isLive: true,
    },
    {
      status: "LIVE NOW",
      title: "Specialty-matched suggestions",
      desc: "Instantly matches a suggested specialty against live doctor calendars to queue up doctor recommendations.",
      icon: Cpu,
      isLive: true,
    },
    {
      status: "ROADMAP",
      title: "Prescription OCR & digitization",
      desc: "Reads handwritten prescriptions via image uploads and digitizes them automatically into your vault records.",
      icon: FileSpreadsheet,
      isLive: false,
    },
    {
      status: "ROADMAP",
      title: "Outbreak & surge warning",
      desc: "Anonymized, aggregated search trends flagged to hospital partners ahead of seasonal surges (dengue, flu).",
      icon: AreaChart,
      isLive: false,
    },
    {
      status: "LIVE NOW",
      title: "Care concierge chat",
      desc: "The assistant also finds diagnostic labs, ICU ambulances, and blood donor groups in real-time.",
      icon: HeartHandshake,
      isLive: true,
    },
    {
      status: "ROADMAP",
      title: "Duplicate registry detection",
      desc: "Automated verification scanner cross-checking incoming provider profiles against direct BMDC registries.",
      icon: ShieldAlert,
      isLive: false,
    },
  ];

  return (
    <section id="ai-info" className="bg-brand-cloud py-20 border-t border-brand-gray">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-navy">
            HealthCapsule AI
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
            Decision support, not self-diagnosis.
          </h2>
          <p className="mt-4 text-brand-muted">
            A static list of names is useful. A system that routes symptoms to actual directories, detects dengue alerts, and digitizes files is a complete system.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="premium-card relative flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-brand-gray"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-block font-mono text-[0.65rem] font-bold tracking-widest px-2 py-0.5 rounded ${
                    c.isLive
                      ? "bg-status-verified-light text-status-verified"
                      : "bg-brand-cream text-brand-slate border border-brand-gray"
                  }`}
                >
                  {c.status}
                </span>
                <c.icon className="h-5 w-5 text-brand-sky" />
              </div>
              <h3 className="text-base font-semibold text-brand-navy">
                {c.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted flex-1">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
