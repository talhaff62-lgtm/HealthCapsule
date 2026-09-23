"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hospital, ScanLine, Stethoscope, ChevronRight, Search } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { StatusBadge } from "@/components/status-badge";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Card, SectionTitle, Button } from "@/components/panel/ui";

type Submission = {
  id: string;
  name: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER" | "DOCTOR";
  status: string;
  collectedAt: string;
};

export default function StaffHubPage() {
  const { me, loading, error } = useMe();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!me) return;
    if (me.role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const [facilities, doctors] = await Promise.all([
          api<Array<{ id: string; name: string; type: "HOSPITAL" | "DIAGNOSTIC_CENTER"; verificationStatus: string; collectedAt: string }>>("/api/v1/facilities/mine"),
          api<Array<{ id: string; name: string; verificationStatus: string; collectedAt: string }>>("/api/v1/doctors/mine"),
        ]);

        const merged: Submission[] = [
          ...facilities.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            status: f.verificationStatus,
            collectedAt: f.collectedAt,
          })),
          ...doctors.map((d) => ({
            id: d.id,
            name: d.name,
            type: "DOCTOR" as const,
            status: d.verificationStatus,
            collectedAt: d.collectedAt,
          })),
        ];

        merged.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());

        if (alive) {
          setSubmissions(merged);
          setLoadingData(false);
        }
      } catch {
        if (alive) setLoadingData(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [me, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">{error}</div>
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

  const firstName = me.name.split(" ")[0];
  const recent = submissions.slice(0, 5);

  return (
    <StaffShell title="Your work" userName={me.name}>
      <div className="space-y-5">
        <p className="text-sm text-brand-muted">
          Good work, <span className="font-semibold text-brand-slate">{firstName}</span>.
        </p>

        <div className="space-y-3">
          <Link href="/staff/hospitals/new" className="block">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-brand-navy active:scale-[0.99] transition-transform">
              <div className="h-12 w-12 rounded-2xl bg-brand-navy text-brand-sky-bright grid place-items-center shrink-0">
                <Hospital className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg font-semibold text-brand-navy">
                  Hospital / Diagnostic Center
                </div>
                <div className="text-xs text-brand-muted">Add a new facility</div>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-navy-muted shrink-0" />
            </Card>
          </Link>

          <Link href="/staff/doctors/new" className="block">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-brand-sky active:scale-[0.99] transition-transform">
              <div className="h-12 w-12 rounded-2xl bg-brand-navy text-brand-sky-bright grid place-items-center shrink-0">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg font-semibold text-brand-navy">
                  Add doctor
                </div>
                <div className="text-xs text-brand-muted">Record doctor details</div>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-navy-muted shrink-0" />
            </Card>
          </Link>

          <Link href="/staff/directory" className="block">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-brand-gray active:scale-[0.99] transition-transform">
              <div className="h-12 w-12 rounded-2xl bg-brand-mist text-brand-navy grid place-items-center shrink-0">
                <Search className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg font-semibold text-brand-navy">
                  Check existing entries
                </div>
                <div className="text-xs text-brand-muted">See what&apos;s already verified on the site</div>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-navy-muted shrink-0" />
            </Card>
          </Link>
        </div>

        <section className="space-y-3">
          <SectionTitle>Recent submissions</SectionTitle>
          {loadingData ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-brand-muted">
                Nothing submitted yet — start with a facility.
              </p>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                {recent.map((sub) => (
                  <Card
                    key={sub.id}
                    className="p-3.5 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-xl bg-brand-sky-bg text-brand-sky-deep grid place-items-center shrink-0">
                      {sub.type === "DOCTOR" ? (
                        <Stethoscope className="h-5 w-5" />
                      ) : sub.type === "DIAGNOSTIC_CENTER" ? (
                        <ScanLine className="h-5 w-5" />
                      ) : (
                        <Hospital className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-brand-navy truncate">
                        {sub.name}
                      </div>
                      <div className="text-xs text-brand-muted">
                        {new Date(sub.collectedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={sub.status} />
                  </Card>
                ))}
              </div>
              <Link href="/staff/my-submissions" className="block mt-3">
                <Button variant="outline" size="sm" fullWidth>
                  View all submissions →
                </Button>
              </Link>
            </>
          )}
        </section>
      </div>
    </StaffShell>
  );
}
