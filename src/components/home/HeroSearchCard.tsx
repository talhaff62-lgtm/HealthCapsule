"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Stethoscope,
  Building2,
  Siren,
  Droplet,
  MessageSquare,
  Phone,
  ArrowRight,
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

type TabId = "doctor" | "hospital" | "ambulance" | "blood" | "ai";

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

export default function HeroSearchCard({ specialties, areas }: HeroSearchCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("doctor");

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hello! Describe what's going on — e.g. 'chest pain', 'baby has fever' — and I'll match you to the right specialist.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatThreadRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "doctor", label: "Doctor", icon: Stethoscope },
    { id: "hospital", label: "Hospital", icon: Building2 },
    { id: "ambulance", label: "Ambulance", icon: Siren },
    { id: "blood", label: "Blood", icon: Droplet },
    { id: "ai", label: "AI Check", icon: MessageSquare },
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let botResponse =
        "That sounds like a General Physician matter. I'll route you to verified general physicians below.";
      let redirectSpecialty = "general-physician";

      const lower = userText.toLowerCase();
      if (lower.includes("chest") || lower.includes("heart") || lower.includes("cardiac")) {
        botResponse = "That could be cardiac — routing you to verified Cardiologists.";
        redirectSpecialty = "cardiology";
      } else if (lower.includes("child") || lower.includes("baby") || lower.includes("kid") || lower.includes("pediatric")) {
        botResponse = "That relates to children's care — routing you to verified Pediatricians.";
        redirectSpecialty = "pediatrics";
      } else if (lower.includes("skin") || lower.includes("rash") || lower.includes("allergy") || lower.includes("dermat")) {
        botResponse = "That's skin-related — routing you to verified Dermatologists.";
        redirectSpecialty = "dermatology";
      } else if (lower.includes("brain") || lower.includes("stroke") || lower.includes("headache") || lower.includes("migraine") || lower.includes("paraly")) {
        botResponse = "That's nervous-system related — routing you to verified Neurologists.";
        redirectSpecialty = "neurology";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: `${botResponse} (Redirecting…)` },
      ]);

      setTimeout(() => {
        router.push(`/doctors?specialty=${redirectSpecialty}`);
      }, 1400);
    }, 700);
  };

  // Keep the latest chat message in view.
  useEffect(() => {
    chatThreadRef.current?.scrollTo({
      top: chatThreadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages]);

  const fieldLabel = "mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.06em] text-brand-muted";
  const fieldInput =
    "w-full rounded-lg border border-brand-gray bg-white px-3.5 py-2.5 text-sm text-brand-slate placeholder:text-brand-muted transition focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/15";

  return (
    <div className="relative">
      {/* Decorative ring tying the card to the navy hero */}
      <span
        aria-hidden="true"
        className="absolute -left-3 -top-3 hidden h-16 w-16 rounded-tl-[1.4rem] border-l-2 border-t-2 border-brand-sky-bright/40 sm:block"
      />

      <div className="relative overflow-hidden rounded-2xl border border-brand-gray bg-white shadow-2xl shadow-black/40">
        {/* Verified corner ribbon */}
        <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 overflow-hidden">
          <span
            className="absolute right-[-26px] top-[10px] inline-block rotate-45 bg-brand-sky px-7 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-white shadow"
          >
            Verified
          </span>
        </div>

        <div className="px-5 pt-6 sm:px-7">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand-navy-light">
            <span className="h-px w-4 bg-brand-navy-light/50" aria-hidden="true" />
            Find care now
          </span>

          {/* Underline-style tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto border-b border-brand-gray scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const isEmergency = tab.id === "ambulance";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 py-2.5 text-xs font-semibold transition sm:flex-1 sm:justify-center ${
                    active
                      ? "border-brand-sky text-brand-navy"
                      : isEmergency
                      ? "border-transparent text-status-emergency hover:text-brand-navy"
                      : "border-transparent text-brand-muted hover:text-brand-navy-light"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
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

              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light">
                Search Donors
              </button>

              <p className="text-center font-mono text-[0.66rem] leading-relaxed text-brand-muted">
                Matched against verified donor networks across the city.
              </p>
            </div>
          )}

          {/* AI Check tab */}
          {activeTab === "ai" && (
            <div className="space-y-3">
              <div
                ref={chatThreadRef}
                className="h-48 space-y-2.5 overflow-y-auto pr-1"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white ${
                        msg.sender === "bot" ? "bg-brand-navy" : "bg-brand-sky"
                      }`}
                    >
                      {msg.sender === "bot" ? "HC" : "You"}
                    </span>
                    <span
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "rounded-tr-sm bg-brand-sky text-white"
                          : "rounded-tl-sm bg-brand-sky-bg text-brand-navy"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type what's going on…"
                  className="flex-1 rounded-full border border-brand-gray bg-white px-4 py-2.5 text-xs text-brand-slate placeholder:text-brand-muted transition focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/15"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition hover:bg-brand-navy-light"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="border-t border-dashed border-brand-gray pt-2 font-mono text-[0.65rem] leading-relaxed text-brand-muted">
                HealthCapsule Assistant matches what you type to a specialty and routes you to a real,
                verified provider — it never diagnoses or prescribes. In an emergency, call an ambulance
                immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
