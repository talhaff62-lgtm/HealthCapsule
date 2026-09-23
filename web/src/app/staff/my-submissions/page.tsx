"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hospital, ScanLine, Stethoscope } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { StatusBadge } from "@/components/status-badge";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Card, Eyebrow, Button } from "@/components/panel/ui";

type FacilityItem = {
  id: string;
  name: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  address: string;
  area?: { name: string };
  amenities: Array<{ amenity: { id: string; name: string } }>;
  discountInfo?: string;
  verificationStatus: string;
  collectedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
};

type DoctorItem = {
  id: string;
  name: string;
  specialties: Array<{ specialty: { id: string; name: string } }>;
  degrees: string[];
  currentPosition?: string;
  achievements?: string;
  chambers?: Array<{ facility?: { id: string; name: string } }>;
  verificationStatus: string;
  collectedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
};

type SubmissionItem =
  | (FacilityItem & { kind: "FACILITY" })
  | (DoctorItem & { kind: "DOCTOR" });

export default function MySubmissionsPage() {
  const { me, loading: meLoading } = useMe();
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!me) return;

    let alive = true;
    (async () => {
      try {
        const [facilities, doctors] = await Promise.all([
          api<FacilityItem[]>("/api/v1/facilities/mine"),
          api<DoctorItem[]>("/api/v1/doctors/mine"),
        ]);

        const merged: SubmissionItem[] = [
          ...facilities.map((f) => ({ ...f, kind: "FACILITY" as const })),
          ...doctors.map((d) => ({ ...d, kind: "DOCTOR" as const })),
        ];

        merged.sort(
          (a, b) =>
            new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
        );
        if (alive) {
          setItems(merged);
          setLoading(false);
        }
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : "Failed to load submissions"
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [me, reloadKey]);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    );
  }

  if (!me || me.role !== "STAFF") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">Not authorized</div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  return (
    <StaffShell title="My submissions" userName={me.name}>
      <Eyebrow className="mb-4 block">MY SUBMISSIONS</Eyebrow>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-status-emergency mb-3">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Retry
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-sky-bg text-brand-sky-deep">
            <Stethoscope className="h-6 w-6" />
          </div>
          <p className="text-sm text-brand-muted mb-4">No submissions found.</p>
          <Link href="/staff">
            <Button variant="primary" size="sm">
              Go to hub →
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const status = item.verificationStatus;
            const specNames =
              item.kind === "DOCTOR"
                ? item.specialties.map((s) => s.specialty.name).join(", ")
                : "";

            return (
              <Card key={item.id} className="p-4">
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left flex items-center gap-3 focus:outline-none"
                >
                  <div className="h-11 w-11 rounded-xl bg-brand-sky-bg text-brand-sky-deep grid place-items-center shrink-0">
                    {item.kind === "DOCTOR" ? (
                      <Stethoscope className="h-5 w-5" />
                    ) : item.type === "DIAGNOSTIC_CENTER" ? (
                      <ScanLine className="h-5 w-5" />
                    ) : (
                      <Hospital className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-brand-navy truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-brand-muted">
                      {item.kind === "DOCTOR"
                        ? specNames || "Doctor"
                        : item.type === "DIAGNOSTIC_CENTER"
                        ? "Diagnostic Center"
                        : "Hospital"}{" "}
                      • {new Date(item.collectedAt).toLocaleDateString()}
                    </div>
                    {status === "REJECTED" && item.rejectReason && (
                      <div className="mt-1 text-xs text-status-emergency">
                        Reason: {item.rejectReason}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={status} />
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 rounded-xl bg-brand-mist p-4 text-sm">
                    {item.kind === "FACILITY" ? (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-brand-muted font-medium">Type</span>
                          <span className="font-medium text-brand-slate">
                            {item.type === "DIAGNOSTIC_CENTER"
                              ? "Diagnostic Center"
                              : "Hospital"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-brand-muted font-medium">Address</span>
                          <span className="font-medium text-brand-slate text-right">{item.address}</span>
                        </div>
                        {item.area && (
                          <div className="flex justify-between gap-2">
                            <span className="text-brand-muted font-medium">Area</span>
                            <span className="font-medium text-brand-slate">{item.area.name}</span>
                          </div>
                        )}
                        {item.amenities && item.amenities.length > 0 && (
                          <div>
                            <span className="text-brand-muted font-medium block mb-1">
                              Amenities
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.amenities.map(({ amenity }) => (
                                <span
                                  key={amenity.id}
                                  className="rounded-full bg-white border border-brand-gray px-2 py-0.5 text-xs font-medium text-brand-slate"
                                >
                                  {amenity.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.discountInfo && (
                          <div className="flex justify-between gap-2">
                            <span className="text-brand-muted font-medium">Discount / Offer</span>
                            <span className="font-medium text-brand-slate text-right">{item.discountInfo}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-brand-muted font-medium">Specialties</span>
                          <span className="font-medium text-brand-slate text-right">{specNames || "N/A"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-brand-muted font-medium">Degrees</span>
                          <span className="font-medium text-brand-slate text-right">{item.degrees.join(", ")}</span>
                        </div>
                        {item.currentPosition && (
                          <div className="flex justify-between gap-2">
                            <span className="text-brand-muted font-medium">Current Position</span>
                            <span className="font-medium text-brand-slate text-right">{item.currentPosition}</span>
                          </div>
                        )}
                        {item.achievements && (
                          <div className="flex justify-between gap-2">
                            <span className="text-brand-muted font-medium">Achievements</span>
                            <span className="font-medium text-brand-slate text-right">{item.achievements}</span>
                          </div>
                        )}
                        {item.chambers && item.chambers[0]?.facility && (
                          <div className="flex justify-between gap-2">
                            <span className="text-brand-muted font-medium">Linked Facility</span>
                            <span className="font-medium text-brand-slate text-right">
                              {item.chambers[0].facility.name}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between gap-2 pt-1 border-t border-brand-gray/50 text-xs">
                      <span className="text-brand-muted">Collected</span>
                      <span className="font-medium text-brand-slate">
                        {new Date(item.collectedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.reviewedAt && (
                      <div className="flex justify-between gap-2 text-xs">
                        <span className="text-brand-muted">Reviewed</span>
                        <span className="font-medium text-brand-slate">
                          {new Date(item.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </StaffShell>
  );
}
