"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const RATING_OPTIONS = [
  { value: "4", label: "4.0+ ★" },
  { value: "4.5", label: "4.5+ ★" },
  { value: "4.8", label: "4.8+ ★" },
];

const FEE_OPTIONS = [
  { value: "500", label: "Up to ৳500" },
  { value: "1000", label: "Up to ৳1000" },
  { value: "2000", label: "Up to ৳2000" },
  { value: "3000", label: "Up to ৳3000" },
];

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function DoctorFilters({ specialties, areas }: DoctorFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const q = form.get("q")?.toString().trim();
    const specialty = form.get("specialty")?.toString();
    const area = form.get("area")?.toString();
    const minRating = form.get("minRating")?.toString();
    const maxFee = form.get("maxFee")?.toString();
    const day = form.get("day")?.toString();
    const online = form.get("online")?.toString();

    if (q) params.set("q", q);
    if (specialty) params.set("specialty", specialty);
    if (area) params.set("area", area);
    if (minRating) params.set("minRating", minRating);
    if (maxFee) params.set("maxFee", maxFee);
    if (day) params.set("day", day);
    if (online === "1") params.set("online", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    router.push(pathname);
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

        <Select
          id="minRating"
          name="minRating"
          label="Rating"
          defaultValue={searchParams.get("minRating") ?? ""}
          options={RATING_OPTIONS}
          placeholder="Any rating"
        />

        <Select
          id="maxFee"
          name="maxFee"
          label="Max fee"
          defaultValue={searchParams.get("maxFee") ?? ""}
          options={FEE_OPTIONS}
          placeholder="Any fee"
        />

        <Select
          id="day"
          name="day"
          label="Available on"
          defaultValue={searchParams.get("day") ?? ""}
          options={DAY_OPTIONS}
          placeholder="Any day"
        />

        <div className="flex items-center sm:pt-6">
          <label htmlFor="online" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted cursor-pointer">
            <input
              id="online"
              name="online"
              type="checkbox"
              value="1"
              defaultChecked={searchParams.get("online") === "1"}
              className="h-4 w-4 rounded border-brand-gray text-brand-sky focus:ring-brand-sky/20"
            />
            Offers online consultation
          </label>
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
            className="rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm font-medium text-brand-slate transition hover:bg-brand-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
