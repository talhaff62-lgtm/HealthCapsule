"use client";

import React, { useState } from "react";
import { Search, Shield, Heart, AlertTriangle, MessageSquare, Phone } from "lucide-react";
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

export default function HeroSearchCard({ specialties, areas }: HeroSearchCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"doctor" | "hospital" | "ambulance" | "blood" | "ai">("doctor");

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    {
      sender: "bot",
      text: "Hello! Describe what symptoms you are experiencing (e.g., 'chest pain', 'baby has fever'), and I will match you to the correct specialist type.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

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

    // Simple symptom routing logic
    setTimeout(() => {
      let botResponse = "I match your symptom to a General Physician. You can search verified general physicians below.";
      let redirectSpecialty = "general-physician";

      const lower = userText.toLowerCase();
      if (lower.includes("chest") || lower.includes("heart") || lower.includes("cardiac")) {
        botResponse = "Symptom indicates potential cardiac consult. Routing you to Verified Cardiologists.";
        redirectSpecialty = "cardiology";
      } else if (lower.includes("child") || lower.includes("baby") || lower.includes("kid") || lower.includes("pediatric")) {
        botResponse = "Symptom relates to children's care. Routing you to Verified Pediatricians.";
        redirectSpecialty = "pediatrics";
      } else if (lower.includes("skin") || lower.includes("rash") || lower.includes("allergy") || lower.includes("dermat")) {
        botResponse = "Symptom relates to skin health. Routing you to Verified Dermatologists.";
        redirectSpecialty = "dermatology";
      } else if (lower.includes("brain") || lower.includes("stroke") || lower.includes("headache") || lower.includes("paraly")) {
        botResponse = "Symptom relates to nervous system. Routing you to Verified Neurologists.";
        redirectSpecialty = "neurology";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse + " (Redirecting...)" },
      ]);

      setTimeout(() => {
        router.push(`/doctors?specialty=${redirectSpecialty}`);
      }, 1500);
    }, 800);
  };

  const tabs = [
    { id: "doctor", label: "Doctor", icon: Shield },
    { id: "hospital", label: "Hospital", icon: Heart },
    { id: "ambulance", label: "Ambulance", icon: AlertTriangle },
    { id: "blood", label: "Blood", icon: Heart },
    { id: "ai", label: "AI Check", icon: MessageSquare },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8 border border-brand-gray">
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">
          Find care now
        </p>

        {/* Tab Buttons */}
        <div className="mt-4 flex gap-1 border-b border-brand-gray pb-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  active
                    ? "bg-brand-sky text-white shadow-sm"
                    : tab.id === "ambulance"
                    ? "text-status-emergency hover:text-brand-navy"
                    : "text-brand-slate hover:text-brand-sky"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Doctor Tab Content */}
        {activeTab === "doctor" && (
          <form onSubmit={handleSearchDoctor} className="mt-6 space-y-4">
            <div>
              <label htmlFor="q" className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                Name or keyword
              </label>
              <input
                id="q"
                name="q"
                type="search"
                placeholder="e.g. Dr. Rahman, Cardiology"
                className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="specialty"
                name="specialty"
                label="Specialty"
                options={specialties.map((s) => ({ value: s.slug, label: s.name }))}
                placeholder="All specialties"
              />

              <Select
                id="area"
                name="area"
                label="Area"
                options={areas.map((a) => ({ value: a.slug, label: a.name }))}
                placeholder="All areas"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
            >
              <Search className="h-4 w-4" />
              Search Doctors
            </button>
          </form>
        )}

        {/* Hospital Tab Content */}
        {activeTab === "hospital" && (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="hosp-name" className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                Hospital or Department
              </label>
              <input
                id="hosp-name"
                type="text"
                placeholder="e.g. Evercare, Imperial, General Hospital"
                className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-4 py-3 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("hospitals");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
            >
              <Search className="h-4 w-4" />
              Explore Hospital List
            </button>
            <p className="text-[0.7rem] text-brand-muted leading-relaxed">
              Explore 6+ verified hospitals and diagnostic centers in Chattogram sadar below.
            </p>
          </div>
        )}

        {/* Ambulance Tab Content */}
        {activeTab === "ambulance" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-status-emergency/20 bg-status-emergency-light/35 p-4 text-xs">
              <strong className="text-status-emergency block mb-1">Direct Emergency Contacts</strong>
              Direct ambulance contacts verified for ICU readiness, air conditioning, and prompt response times.
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-brand-gray text-xs">
                <div>
                  <strong className="text-brand-navy block">Imperial ICU Ambulance</strong>
                  <span className="text-brand-muted">2.1 km away · Pahartali</span>
                </div>
                <a href="tel:09612247247" className="p-2 bg-status-emergency-light text-status-emergency rounded-full hover:bg-status-emergency hover:text-white transition">
                  <Phone className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-brand-gray text-xs">
                <div>
                  <strong className="text-brand-navy block">Evercare Ambulance Service</strong>
                  <span className="text-brand-muted">Khulshi / Anannya area</span>
                </div>
                <a href="tel:09612310663" className="p-2 bg-status-emergency-light text-status-emergency rounded-full hover:bg-status-emergency hover:text-white transition">
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Blood Tab Content */}
        {activeTab === "blood" && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-brand-muted">Blood Group</label>
                <select className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate">
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-brand-muted">Area</label>
                <input type="text" placeholder="e.g. Agrabad" className="mt-1 block w-full rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate" />
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-light">
              Search Donors
            </button>
            <p className="text-[0.7rem] text-brand-muted text-center leading-relaxed">
              Find matched volunteer blood donors instantly in Chattogram.
            </p>
          </div>
        )}

        {/* AI Check Tab Content */}
        {activeTab === "ai" && (
          <div className="mt-6 space-y-3">
            <div className="h-44 overflow-y-auto space-y-2 border border-brand-gray bg-white rounded-lg p-3 text-xs leading-normal">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.sender === "user"
                        ? "bg-brand-sky text-white rounded-br-none"
                        : "bg-brand-sky-bg-soft text-brand-navy rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="e.g., severe migraine headache..."
                className="flex-1 rounded-lg border border-brand-gray bg-white px-3 py-2 text-xs text-brand-slate placeholder:text-brand-muted focus:outline-none focus:border-brand-sky"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold rounded-lg"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
