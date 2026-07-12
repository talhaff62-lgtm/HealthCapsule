"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

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
      className="rounded-xl border border-brand-gray bg-brand-white p-4 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium text-brand-slate">
            Doctor name
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Search doctors, degrees..."
            defaultValue={searchParams.get("q") ?? ""}
            className="rounded-lg border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-teal focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="specialty" className="text-sm font-medium text-brand-slate">
            Specialty
          </label>
          <select
            id="specialty"
            name="specialty"
            defaultValue={searchParams.get("specialty") ?? ""}
            className="rounded-lg border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
          >
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="area" className="text-sm font-medium text-brand-slate">
            Area
          </label>
          <select
            id="area"
            name="area"
            defaultValue={searchParams.get("area") ?? ""}
            className="rounded-lg border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
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
            className="flex-1 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal/90"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-brand-gray px-4 py-2 text-sm font-medium text-brand-slate hover:bg-brand-gray"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
