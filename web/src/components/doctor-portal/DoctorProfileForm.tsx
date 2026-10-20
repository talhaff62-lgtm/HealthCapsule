"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDoctorProfile, UpdateProfileResult } from "@/app/portal/doctor/actions";

type DoctorProfileFormProps = {
  doctor: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    photoUrl: string | null;
    degrees: string[];
    languages: string[];
    consultationFee: string | null;
    bmdcRegNo: string | null;
  };
};

export default function DoctorProfileForm({ doctor }: DoctorProfileFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setStatus(null);

    const result: UpdateProfileResult = await updateDoctorProfile(doctor.id, formData);

    setPending(false);
    if (result.ok) {
      setStatus({ type: "success", message: "Profile updated successfully." });
      router.refresh();
      router.push(`/doctors/${result.slug}`);
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {status && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-status-verified-light text-status-verified"
              : "bg-status-emergency-light text-status-emergency"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={doctor.name}
            disabled
            className="w-full rounded-lg border border-brand-gray bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="mt-1 text-xs text-brand-muted">Name can only be changed by an admin.</p>
        </div>

        <div>
          <label htmlFor="bmdcRegNo" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
            BMDC registration number
          </label>
          <input
            id="bmdcRegNo"
            name="bmdcRegNo"
            type="text"
            defaultValue={doctor.bmdcRegNo ?? ""}
            disabled
            className="w-full rounded-lg border border-brand-gray bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="mt-1 text-xs text-brand-muted">BMDC number can only be changed by an admin.</p>
        </div>
      </div>

      <div>
        <label htmlFor="photoUrl" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Photo URL
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          type="url"
          defaultValue={doctor.photoUrl ?? ""}
          placeholder="https://example.com/photo.jpg"
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={doctor.bio ?? ""}
          placeholder="Tell patients about your practice, expertise, and approach."
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div>
        <label htmlFor="consultationFee" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Consultation fee (৳)
        </label>
        <input
          id="consultationFee"
          name="consultationFee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={doctor.consultationFee ?? ""}
          placeholder="500"
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div>
        <label htmlFor="degrees" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Degrees
        </label>
        <textarea
          id="degrees"
          name="degrees"
          rows={3}
          defaultValue={doctor.degrees.join(", ")}
          placeholder="MBBS, FCPS, MD (separate with commas)"
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div>
        <label htmlFor="languages" className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Languages
        </label>
        <input
          id="languages"
          name="languages"
          type="text"
          defaultValue={doctor.languages.join(", ")}
          placeholder="English, Bangla, Hindi"
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy-light disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save profile"}
        </button>
        <a
          href="/portal/doctor/chambers"
          className="rounded-lg border border-brand-gray bg-white px-6 py-2.5 text-sm font-medium text-brand-slate transition hover:bg-brand-cream"
        >
          Manage chambers
        </a>
      </div>
    </form>
  );
}
