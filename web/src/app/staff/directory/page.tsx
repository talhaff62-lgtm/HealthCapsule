"use client";

import { useState, useEffect } from "react";
import { StaffShell } from "@/components/panel/staff-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Card, Eyebrow, TextField, Button } from "@/components/panel/ui";
import { useLanguage } from "@/components/language-provider";

type DirectoryFacility = {
  id: string;
  name: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  address: string | null;
  area?: { name: string } | null;
};

type DirectoryDoctor = {
  id: string;
  name: string;
  degrees: string[];
  currentPosition?: string | null;
  specialties: Array<{ specialty: { name: string } }>;
  chambers: Array<{ facility?: { name: string } | null }>;
};

export default function StaffDirectoryPage() {
  const { me, loading: meLoading } = useMe();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"facilities" | "doctors">("facilities");
  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState<DirectoryFacility[]>([]);
  const [doctors, setDoctors] = useState<DirectoryDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!me) return;

    let alive = true;
    const timer = setTimeout(() => {
      (async () => {
        try {
          if (alive) {
            setLoading(true);
            setError("");
          }
          const trimmed = query.trim();
          const qParam = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";

          if (tab === "facilities") {
            const data = await api<DirectoryFacility[]>(`/api/v1/facilities/directory${qParam}`);
            if (alive) {
              setFacilities(data);
              setLoading(false);
            }
          } else {
            const data = await api<DirectoryDoctor[]>(`/api/v1/doctors/directory${qParam}`);
            if (alive) {
              setDoctors(data);
              setLoading(false);
            }
          }
        } catch (err) {
          if (alive) {
            setError(err instanceof Error ? err.message : "Failed to load directory");
            setLoading(false);
          }
        }
      })();
    }, 350);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [tab, query, me, reloadKey]);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">{t("common.ui.loading")}</div>
      </div>
    );
  }

  if (!me || me.role !== "STAFF") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">{t("common.ui.notAuthorized")}</div>
      </div>
    );
  }

  return (
    <StaffShell title="Check existing entries" userName={me.name}>
      <div className="space-y-4">
        <div>
          <Eyebrow className="block mb-1">DIRECTORY</Eyebrow>
          <h2 className="font-serif text-2xl font-semibold text-brand-navy">
            Search verified records
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Everything already verified and live on the website. Use this to avoid duplicates before submitting.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("facilities")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === "facilities"
                ? "bg-brand-navy text-white"
                : "bg-white border border-brand-gray text-brand-muted hover:border-brand-sky"
            }`}
          >
            Facilities
          </button>
          <button
            type="button"
            onClick={() => setTab("doctors")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === "doctors"
                ? "bg-brand-navy text-white"
                : "bg-white border border-brand-gray text-brand-muted hover:border-brand-sky"
            }`}
          >
            Doctors
          </button>
        </div>

        {/* Search Field */}
        <TextField
          id="search-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
        />

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-status-emergency mb-3">{error}</p>
            <Button
              onClick={() => setReloadKey((k) => k + 1)}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </Card>
        ) : tab === "facilities" ? (
          facilities.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-brand-muted">
                No matches in the system — you can submit it as a new entry.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {facilities.map((fac) => (
                <Card key={fac.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-brand-navy text-base">
                      {fac.name}
                    </span>
                    <span className="rounded-full bg-brand-sky-bg border border-brand-sky/30 px-2.5 py-0.5 text-xs font-medium text-brand-sky-deep shrink-0">
                      {fac.type === "DIAGNOSTIC_CENTER" ? "Diagnostic Center" : "Hospital"}
                    </span>
                  </div>
                  {(fac.address || fac.area) && (
                    <div className="text-xs text-brand-muted">
                      {fac.address && <span>{fac.address}</span>}
                      {fac.address && fac.area && <span> • </span>}
                      {fac.area && <span>{fac.area.name}</span>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )
        ) : doctors.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-brand-muted">
              No matches in the system — you can submit it as a new entry.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((doc) => {
              const specNames = doc.specialties
                .map((s) => s.specialty.name)
                .join(", ");
              const facilityName = doc.chambers?.[0]?.facility?.name;

              return (
                <Card key={doc.id} className="p-4 space-y-1">
                  <div className="font-semibold text-brand-navy text-base">
                    {doc.name}
                  </div>
                  {doc.degrees && doc.degrees.length > 0 && (
                    <div className="text-xs font-medium text-brand-slate">
                      {doc.degrees.join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-brand-muted space-x-1">
                    {specNames && <span>{specNames}</span>}
                    {doc.currentPosition && (
                      <span>
                        {specNames ? " • " : ""}
                        {doc.currentPosition}
                      </span>
                    )}
                    {facilityName && <span> at {facilityName}</span>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StaffShell>
  );
}
