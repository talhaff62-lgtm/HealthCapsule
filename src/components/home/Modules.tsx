import React from "react";
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

export default function Modules() {
  const modules = [
    {
      num: "Module 01",
      title: "Doctor Directory",
      desc: "Searchable by specialty, hospital, area, and availability, with live schedules on every profile.",
      icon: Search,
    },
    {
      num: "Module 02",
      title: "Hospital Directory",
      desc: "Departments, facilities, emergency services, and ambulance contacts in one listing per facility.",
      icon: Building,
    },
    {
      num: "Module 03",
      title: "Appointment Booking",
      desc: "Online slot selection, instant confirmation, SMS reminders, and a full appointment history.",
      icon: Calendar,
    },
    {
      num: "Module 04",
      title: "Ambulance Network",
      desc: "Searchable by hospital, ICU-equipped, or AC ambulance, with direct emergency contacts.",
      icon: AlertTriangle,
    },
    {
      num: "Module 05",
      title: "Prescription Vault",
      desc: "Secure digital storage for prescriptions, lab reports, scans, and ongoing medical history.",
      icon: FileText,
    },
    {
      num: "Module 06",
      title: "Doctor Reviews",
      desc: "Verified-only ratings across behaviour, expertise, waiting time, and communication.",
      icon: Star,
    },
    {
      num: "Module 07",
      title: "Medicine Reminder",
      desc: "Automated reminders today; OCR-based prescription reading planned as a future enhancement.",
      icon: Bell,
    },
    {
      num: "Module 08",
      title: "Blood Donor Network",
      desc: "Searchable by blood group, area, and real-time availability — no more group-chat forwarding.",
      icon: Heart,
    },
  ];

  return (
    <section id="modules" className="bg-brand-navy py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-bright">
            The product ecosystem
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Eight modules, live today.
          </h2>
          <p className="mt-4 text-white/80">
            Each module solves one real point of friction in the care journey — together, they form a single record patients and providers can rely on.
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
