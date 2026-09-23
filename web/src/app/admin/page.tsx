"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/client-fetch";
import { Card, Eyebrow, StatCard, Button } from "@/components/panel/ui";

type FacilityItem = {
  id: string;
  name: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  verificationStatus: string;
  isActive?: boolean;
  collectedBy?: { id: string; name: string };
  collectedAt: string;
  reviewedAt?: string;
};

type DoctorItem = {
  id: string;
  name: string;
  verificationStatus: string;
  isActive?: boolean;
  collectedBy?: { id: string; name: string };
  collectedAt: string;
  reviewedAt?: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

type Item =
  | (FacilityItem & { kind: "FACILITY" })
  | (DoctorItem & { kind: "DOCTOR" });

export default function AdminDashboardPage() {
  const { me, loading: meLoading } = useMe();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hospitalsOnSiteCount, setHospitalsOnSiteCount] = useState(0);
  const [doctorsOnSiteCount, setDoctorsOnSiteCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [verifiedThisWeekCount, setVerifiedThisWeekCount] = useState(0);
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [latestPending, setLatestPending] = useState<Item[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!me) return;
    if (me.role !== "ADMIN") {
      router.replace("/staff");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const [facilities, doctors, users] = await Promise.all([
          api<FacilityItem[]>("/api/v1/facilities"),
          api<DoctorItem[]>("/api/v1/doctors"),
          api<UserItem[]>("/api/v1/users"),
        ]);

        if (!alive) return;

        const staffCount = users.filter((u) => u.role === "STAFF").length;
        setActiveStaffCount(staffCount);

        const activeVerifiedFacilities = facilities.filter(
          (f) => f.verificationStatus === "VERIFIED" && f.isActive !== false
        );
        setHospitalsOnSiteCount(activeVerifiedFacilities.length);

        const activeVerifiedDoctors = doctors.filter(
          (d) => d.verificationStatus === "VERIFIED" && d.isActive !== false
        );
        setDoctorsOnSiteCount(activeVerifiedDoctors.length);

        const allItems: Item[] = [
          ...facilities.map((f) => ({ ...f, kind: "FACILITY" as const })),
          ...doctors.map((d) => ({ ...d, kind: "DOCTOR" as const })),
        ];

        const pending = allItems.filter((i) => i.verificationStatus === "PENDING");
        setPendingCount(pending.length);

        pending.sort(
          (a, b) =>
            new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
        );
        setLatestPending(pending.slice(0, 5));

        const now = new Date().getTime();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const verifiedThisWeek = allItems.filter((i) => {
          if (i.verificationStatus !== "VERIFIED") return false;
          if (!i.reviewedAt) return false;
          const reviewedTime = new Date(i.reviewedAt).getTime();
          return now - reviewedTime <= sevenDaysMs;
        });
        setVerifiedThisWeekCount(verifiedThisWeek.length);
        setLoading(false);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data"
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [me, router, reloadKey]);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    );
  }

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">Not authorized</div>
      </div>
    );
  }

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Eyebrow className="mb-1 block">DASHBOARD</Eyebrow>
          <h1 className="font-serif text-3xl font-semibold text-brand-navy">
            Review at a glance
          </h1>
        </div>
        <Link href="/admin/entries">
          <Button variant="outline" size="sm">
            Manage visibility →
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 mb-8">
          <p className="text-sm text-status-emergency mb-3">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Retry
          </Button>
        </Card>
      ) : (
        <div className="mb-8">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="HOSPITALS ON SITE"
              value={hospitalsOnSiteCount}
              href="/admin/entries?status=VERIFIED"
            />
            <StatCard
              label="DOCTORS ON SITE"
              value={doctorsOnSiteCount}
              href="/admin/entries?status=VERIFIED"
            />
            <StatCard
              label="PENDING REVIEW"
              value={pendingCount}
              href="/admin/review"
            />
            <StatCard
              label="ACTIVE STAFF"
              value={activeStaffCount}
              href="/admin/staff"
            />
          </div>
          <div className="mt-4 text-sm text-brand-muted font-mono">
            Verified this week: <span className="font-semibold text-brand-navy">{verifiedThisWeekCount}</span>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="font-serif text-xl font-semibold text-brand-navy">
            Latest pending
          </h2>
          <Link href="/admin/review">
            <Button variant="outline" size="sm">
              Open review queue
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-brand-mist rounded-xl animate-pulse" />
            ))}
          </div>
        ) : latestPending.length === 0 ? (
          <p className="text-sm text-brand-muted py-4">No pending entries to review.</p>
        ) : (
          <div className="rounded-2xl border border-brand-gray bg-white divide-y divide-brand-gray/70 overflow-hidden">
            {latestPending.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-brand-navy">{item.name}</span>
                  <span className="text-xs text-brand-muted">
                    {item.kind === "DOCTOR"
                      ? "Doctor"
                      : item.type === "DIAGNOSTIC_CENTER"
                      ? "Diagnostic Center"
                      : "Hospital"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-brand-muted hidden sm:inline">
                    By {item.collectedBy?.name ?? "Unknown"}
                  </span>
                  <StatusBadge status={item.verificationStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
