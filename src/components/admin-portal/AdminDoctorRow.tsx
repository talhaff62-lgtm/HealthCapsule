"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingTier, VerificationStatus } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { setListingTier, setVerificationStatus } from "@/app/portal/admin/actions";
import TierBadge from "@/components/ui/TierBadge";

type DoctorRow = {
  id: string;
  name: string;
  slug: string;
  bmdcRegNo: string | null;
  degrees: string[];
  verificationStatus: VerificationStatus;
  listingTier: ListingTier;
  createdAt: Date;
  user: { phone: string } | null;
};

const statuses: VerificationStatus[] = ["PENDING", "VERIFIED", "REJECTED"];
const tiers: ListingTier[] = ["FREE", "VERIFIED", "FEATURED", "PREMIUM"];

const statusBadgeClass: Record<VerificationStatus, string> = {
  PENDING: "bg-status-warning-light text-status-warning",
  VERIFIED: "bg-status-verified-light text-status-verified",
  REJECTED: "bg-status-emergency-light text-status-emergency",
};

export default function AdminDoctorRow({ doctor }: { doctor: DoctorRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(doctor.verificationStatus);
  const [tier, setTier] = useState(doctor.listingTier);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleStatusChange(next: VerificationStatus) {
    setPending(true);
    setMessage(null);
    const result = await setVerificationStatus(doctor.id, next);
    setPending(false);
    if (result.ok) {
      setStatus(next);
      setMessage({ type: "success", text: `Status set to ${next.toLowerCase()}` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleTierChange(next: ListingTier) {
    setPending(true);
    setMessage(null);
    const result = await setListingTier(doctor.id, next);
    setPending(false);
    if (result.ok) {
      setTier(next);
      setMessage({ type: "success", text: `Tier set to ${next.toLowerCase()}` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm transition hover:border-brand-sky/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-brand-navy">{doctor.name}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wider ${statusBadgeClass[status]}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
            <TierBadge tier={tier} />
          </div>
          <p className="text-sm text-brand-muted">
            {doctor.degrees.join(", ") || "No degrees listed"}
          </p>
          <p className="mt-1 text-sm text-brand-slate">
            BMDC: {doctor.bmdcRegNo || "—"} · Phone: {doctor.user?.phone || "—"}
          </p>
          <p className="text-xs text-brand-muted">
            Submitted {doctor.createdAt.toLocaleDateString()}
          </p>
          <Link
            href={`/doctors/${doctor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-sky hover:underline"
          >
            View public profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="min-w-[16rem] space-y-3">
          {message && (
            <div
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                message.type === "success"
                  ? "bg-status-verified-light text-status-verified"
                  : "bg-status-emergency-light text-status-emergency"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              Verification status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending || status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    status === s
                      ? "bg-brand-navy text-white"
                      : "border border-brand-gray bg-white text-brand-slate hover:bg-brand-cream"
                  } disabled:cursor-not-allowed`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              Listing tier
            </label>
            <select
              value={tier}
              onChange={(e) => handleTierChange(e.target.value as ListingTier)}
              disabled={pending}
              className="w-full rounded-lg border border-brand-gray bg-white px-3 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
