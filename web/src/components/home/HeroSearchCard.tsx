"use client";

import React, { useState } from "react";
import {
  Search,
  Stethoscope,
  Building2,
  Siren,
  Droplet,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";

type Option = {
  slug: string;
  name: string;
};

type HeroSearchCardProps = {
  specialties: Option[];
  areas: Option[];
};

type TabId = "doctor" | "hospital" | "ambulance" | "blood";

export default function HeroSearchCard({ specialties, areas }: HeroSearchCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("doctor");

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "doctor", label: "Doctor", icon: Stethoscope },
    { id: "hospital", label: "Hospital", icon: Building2 },
    { id: "ambulance", label: "Ambulance", icon: Siren },
    { id: "blood", label: "Blood", icon: Droplet },
  ];

  const handleSearchDoctor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = data.get("q")?.toString() || "";
    const specialty = data.get("specialty")?.toString() || "";
    const area = data.get("area")?.toString() || "";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialty) params.set("specialty", specialty);
    if (area) params.set("area", area);

    router.push(`/doctors?${params.toString()}`);
  };

  const fieldLabel = "mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.06em] text-brand-muted";
  const fieldInput =
    "w-full rounded-xl border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate placeholder:text-brand-muted transition focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/15";

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-soft">
        {/* Verified corner ribbon */}
        <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 overflow-hidden">
          <span
            className="absolute right-[-26px] top-[10px] inline-block rotate-45 bg-brand-sky px-7 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-white shadow"
          >
            Verified
          </span>
        </div>

        <div className="px-5 pt-6 sm:px-7">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand-sky-deep">
            <span className="h-px w-4 bg-brand-sky-deep/50" aria-hidden="true" />
            Find care now
          </span>

          {/* Segmented pill tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto rounded-full border border-brand-gray bg-brand-mist p-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const isEmergency = tab.id === "ambulance";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition sm:flex-1 sm:justify-center ${
                    active
                      ? "bg-white shadow-sm text-ink"
                      : isEmergency
                      ? "text-status-emergency hover:text-status-emergency"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-7 pt-5 sm:px-7">
          {/* Doctor tab */}
          {activeTab === "doctor" && (
            <form onSubmit={handleSearchDoctor} className="space-y-4">
              <div>
                <label htmlFor="q" className={fieldLabel}>
                  Name or keyword
                </label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  placeholder="e.g. Dr. Rahman, Cardiology"
                  className={fieldInput}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="specialty"
                  name="specialty"
                  label="Specialty"
                  options={specialties.map((s) => ({ value: s.slug, label: s.name }))}
                  placeholder="All specialties"
                  portal
                />
                <Select
                  id="area"
                  name="area"
                  label="Area"
                  options={areas.map((a) => ({ value: a.slug, label: a.name }))}
                  placeholder="All areas"
                  portal
                />
              </div>

              <p className="font-mono text-[0.7rem] leading-relaxed text-brand-muted">
                Verified doctors currently listed across Chattogram — cross-checked, not scraped.
              </p>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-teal py-3.5 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
              >
                <Search className="h-4 w-4" />
                Search Doctors
              </button>
            </form>
          )}

          {/* Hospital tab */}
          {activeTab === "hospital" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="hosp-name" className={fieldLabel}>
                  Hospital or department
                </label>
                <input
                  id="hosp-name"
                  type="text"
                  placeholder="e.g. Evercare, Imperial, General Hospital"
                  className={fieldInput}
                />
              </div>

              <p className="font-mono text-[0.7rem] leading-relaxed text-brand-muted">
                Listings include departments, facilities, and direct ambulance contacts.
              </p>

              <button
                onClick={() => {
                  document.getElementById("hospitals")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-teal py-3.5 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
              >
                <Search className="h-4 w-4" />
                Explore Hospital List
              </button>
            </div>
          )}

          {/* Ambulance tab */}
          {activeTab === "ambulance" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-status-emergency/25 bg-status-emergency-light/40 p-4">
                <strong className="mb-1 block text-sm font-semibold text-status-emergency">
                  Direct emergency contacts
                </strong>
                <p className="text-xs leading-relaxed text-brand-muted">
                  Verified for ICU readiness, AC, and prompt response — no hold music.
                </p>
              </div>

              {[
                { name: "Imperial ICU Ambulance", meta: "2.1 km away · Pahartali", tel: "09612247247" },
                { name: "Evercare Ambulance Service", meta: "Khulshi / Anannya area", tel: "09612310663" },
              ].map((row) => (
                <div
                  key={row.tel}
                  className="flex items-center justify-between rounded-lg border border-brand-gray bg-white p-3"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-brand-navy">{row.name}</strong>
                    <span className="font-mono text-[0.7rem] uppercase tracking-wide text-brand-muted">
                      {row.meta}
                    </span>
                  </div>
                  <a
                    href={`tel:${row.tel}`}
                    aria-label={`Call ${row.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-emergency-light text-status-emergency transition hover:bg-status-emergency hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Blood tab */}
          {activeTab === "blood" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blood-group" className={fieldLabel}>
                    Blood group
                  </label>
                  <select id="blood-group" className={fieldInput}>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="blood-area" className={fieldLabel}>
                    Area
                  </label>
                  <input
                    id="blood-area"
                    type="text"
                    placeholder="e.g. Agrabad"
                    className={fieldInput}
                  />
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-sky to-teal py-3.5 text-sm font-semibold text-white shadow-card transition hover:brightness-105">
                Search Donors
              </button>

              <p className="text-center font-mono text-[0.66rem] leading-relaxed text-brand-muted">
                Matched against verified donor networks across the city.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
