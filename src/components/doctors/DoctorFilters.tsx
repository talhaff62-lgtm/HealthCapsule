"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { Search, X } from "lucide-react";

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
      className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Doctor name
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Search doctors, degrees..."
            defaultValue={searchParams.get("q") ?? ""}
            className="rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="specialty" className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Specialty
          </label>
          <select
            id="specialty"
            name="specialty"
            defaultValue={searchParams.get("specialty") ?? ""}
            className="rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="area" className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Area
          </label>
          <select
            id="area"
            name="area"
            defaultValue={searchParams.get("area") ?? ""}
            className="rounded-lg border border-brand-gray bg-white px-3 py-2.5 text-sm text-brand-slate focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

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
            className="rounded-lg border border-brand-gray px-4 py-2.5 text-sm font-medium text-brand-muted transition hover:bg-brand-cream hover:text-brand-slate"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
