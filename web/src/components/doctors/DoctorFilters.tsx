"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { Search, X } from "lucide-react";
import Select from "@/components/ui/Select";

export type FilterOption = {
  value: string;
  label: string;
};

export type DoctorFiltersProps = {
  specialties: FilterOption[];
  areas: FilterOption[];
};

export default function DoctorFilters({ specialties, areas }: DoctorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const q = form.get("q")?.toString().trim();
    const specialty = form.get("specialty")?.toString();
    const area = form.get("area")?.toString();

    if (q) params.set("q", q);
    if (specialty) params.set("specialty", specialty);
    if (area) params.set("area", area);

    router.push(`/doctors?${params.toString()}`);
  }

  function handleClear() {
    router.push("/doctors");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl p-6 shadow-sm mb-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Doctor name
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Search doctors, degrees..."
            defaultValue={searchParams.get("q") ?? ""}
            className="rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
          />
        </div>

        <Select
          id="specialty"
          name="specialty"
          label="Specialty"
          defaultValue={searchParams.get("specialty") ?? ""}
          options={specialties}
          placeholder="All specialties"
        />

        <Select
          id="area"
          name="area"
          label="Area"
          defaultValue={searchParams.get("area") ?? ""}
          options={areas}
          placeholder="All areas"
        />

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy-light"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm font-medium text-brand-slate transition hover:bg-brand-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
