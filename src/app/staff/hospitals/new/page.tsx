"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Hospital, ScanLine, Check, AlertTriangle } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import {
  Card,
  TextField,
  TextAreaField,
  Button,
  Eyebrow,
} from "@/components/panel/ui";

type FacilityType = "HOSPITAL" | "DIAGNOSTIC_CENTER";

type Amenity = {
  id: string;
  name: string;
  icon: string | null;
};

type AreaItem = {
  id: string;
  name: string;
  thana: { name: string };
};

type CreatedFacility = {
  id: string;
  name: string;
};

export default function NewHospitalPage() {
  const { me, loading } = useMe();

  const [type, setType] = useState<FacilityType>("HOSPITAL");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [discountInfo, setDiscountInfo] = useState("");
  const [dupMatches, setDupMatches] = useState<
    Array<{
      id: string;
      name: string;
      type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
      area?: { name: string } | null;
    }>
  >([]);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  const [areaQuery, setAreaQuery] = useState("");
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaItem | null>(null);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [areaError, setAreaError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    let alive = true;
    api<Amenity[]>("/api/v1/amenities")
      .then((data) => {
        if (alive) setAmenities(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const queryStr = areaQuery.trim();
    if (!queryStr) {
      api<AreaItem[]>("/api/v1/areas")
        .then((data) => {
          if (alive) setAreas(data);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }

    const timer = setTimeout(() => {
      api<AreaItem[]>(`/api/v1/areas?query=${encodeURIComponent(queryStr)}`)
        .then((data) => {
          if (alive) setAreas(data);
        })
        .catch(() => {});
    }, 300);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [areaQuery]);

  useEffect(() => {
    let alive = true;
    const queryStr = name.trim();
    if (queryStr.length < 3) {
      const resetTimer = setTimeout(() => {
        if (alive) setDupMatches([]);
      }, 0);
      return () => {
        alive = false;
        clearTimeout(resetTimer);
      };
    }

    const timer = setTimeout(() => {
      api<
        Array<{
          id: string;
          name: string;
          type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
          area?: { name: string } | null;
        }>
      >(`/api/v1/facilities/directory?q=${encodeURIComponent(queryStr)}`)
        .then((data) => {
          if (alive) setDupMatches(data);
        })
        .catch(() => {
          if (alive) setDupMatches([]);
        });
    }, 400);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [name]);

  if (loading) {
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

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setAreaError("");

    if (!selectedArea) {
      setAreaError("Area is required");
      return;
    }

    setSubmitting(true);

    try {
      const created = await api<CreatedFacility>("/api/v1/facilities", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          type,
          areaId: selectedArea.id,
          amenityIds: selectedAmenityIds,
          discountInfo: discountInfo.trim() || undefined,
        }),
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "lastFacility",
          JSON.stringify({ id: created.id, name: created.name })
        );
      }

      setSubmittedName(created.name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setName("");
    setDupMatches([]);
    setAddress("");
    setSelectedAmenityIds([]);
    setDiscountInfo("");
    setSelectedArea(null);
    setAreaQuery("");
    setError("");
    setAreaError("");
    setSuccess(false);
    setSubmittedName("");
  };

  if (success) {
    return (
      <StaffShell title="Add Hospital / Diagnostic Center" userName={me.name}>
        <Card className="p-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-status-verified-light text-status-verified">
            <Check className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-brand-navy mb-1">
            Submitted for review
          </h2>
          <p className="text-sm text-brand-muted mb-6">
            {submittedName} is now pending review.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleAddAnother}
              variant="primary"
              size="lg"
              fullWidth
            >
              Add another
            </Button>
            <Link href="/staff/my-submissions" className="block">
              <Button variant="outline" size="lg" fullWidth>
                View my submissions
              </Button>
            </Link>
          </div>
        </Card>
      </StaffShell>
    );
  }

  return (
    <StaffShell title="Add Hospital / Diagnostic Center" userName={me.name}>
      <Eyebrow className="mb-4 block">NEW ENTRY</Eyebrow>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TYPE TOGGLE */}
        <div>
          <span className="text-sm font-semibold text-brand-slate mb-2 block">
            Facility Type
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={type === "HOSPITAL"}
              onClick={() => setType("HOSPITAL")}
              className={`h-16 rounded-2xl border-2 font-semibold flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky ${
                type === "HOSPITAL"
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-gray bg-white text-brand-muted hover:border-brand-sky"
              }`}
            >
              <Hospital
                className={`h-6 w-6 ${
                  type === "HOSPITAL" ? "text-brand-sky-bright" : "text-brand-muted"
                }`}
              />
              <span className="text-sm">Hospital</span>
            </button>
            <button
              type="button"
              aria-pressed={type === "DIAGNOSTIC_CENTER"}
              onClick={() => setType("DIAGNOSTIC_CENTER")}
              className={`h-16 rounded-2xl border-2 font-semibold flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky ${
                type === "DIAGNOSTIC_CENTER"
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-gray bg-white text-brand-muted hover:border-brand-sky"
              }`}
            >
              <ScanLine
                className={`h-6 w-6 ${
                  type === "DIAGNOSTIC_CENTER" ? "text-brand-sky-bright" : "text-brand-muted"
                }`}
              />
              <span className="text-sm">Diagnostic Center</span>
            </button>
          </div>
        </div>

        {/* Name */}
        <TextField
          id="name"
          label="Name"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {dupMatches.length > 0 && (
          <div className="rounded-xl border border-status-warning/50 bg-status-warning-light/60 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-status-warning font-semibold text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Already in the system?</span>
            </div>
            <ul className="space-y-1 text-sm text-brand-slate">
              {dupMatches.slice(0, 3).map((match) => (
                <li key={match.id} className="truncate">
                  {match.name} — {match.type === "DIAGNOSTIC_CENTER" ? "Diagnostic Center" : "Hospital"}
                  {match.area?.name ? `, ${match.area.name}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address */}
        <TextAreaField
          id="address"
          label="Address"
          required
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* Area Picker */}
        <div className="relative">
          <label htmlFor="area-input" className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Area <span className="text-status-emergency">*</span>
          </label>
          {selectedArea ? (
            <div className="flex items-center justify-between h-12 rounded-xl border border-brand-navy bg-brand-mist px-4 text-sm font-medium text-brand-navy">
              <span>
                {selectedArea.name} — {selectedArea.thana.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedArea(null);
                  setAreaQuery("");
                  setAreaDropdownOpen(true);
                }}
                className="text-xs font-semibold text-brand-sky-deep hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <input
                id="area-input"
                type="text"
                value={areaQuery}
                onFocus={() => setAreaDropdownOpen(true)}
                onChange={(e) => {
                  setAreaQuery(e.target.value);
                  setAreaDropdownOpen(true);
                }}
                placeholder="Search area (min 1 char)..."
                className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-brand-slate placeholder:text-brand-navy-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25 ${
                  areaError ? "border-status-emergency" : "border-brand-gray"
                }`}
              />
              {areaDropdownOpen && areas.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-brand-gray bg-white shadow-lg">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => {
                        setSelectedArea(area);
                        setAreaDropdownOpen(false);
                        setAreaError("");
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-brand-slate hover:bg-brand-sky-bg-soft"
                    >
                      <span className="font-medium">{area.name}</span>
                      <span className="text-xs text-brand-muted">{area.thana.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {areaError && (
            <p className="mt-1.5 text-sm text-status-emergency">{areaError}</p>
          )}
        </div>

        {/* Amenity Picker */}
        <div>
          <span className="text-sm font-semibold text-brand-slate mb-2 block">
            Amenities
          </span>
          <div className="flex flex-wrap gap-2.5">
            {amenities.map((amenity) => {
              const selected = selectedAmenityIds.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky ${
                    selected
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-gray bg-white text-brand-muted hover:border-brand-sky"
                  }`}
                >
                  {selected && <Check className="h-4 w-4 text-white" />}
                  <span>{amenity.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special discount / offer */}
        <TextField
          id="discountInfo"
          label="Special discount / offer (optional)"
          type="text"
          value={discountInfo}
          onChange={(e) => setDiscountInfo(e.target.value)}
        />

        {error && (
          <div className="mb-4 rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
            {error}
          </div>
        )}

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-brand-gray/60 bg-white/95 px-4 py-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Submit for review
          </Button>
        </div>
      </form>
    </StaffShell>
  );
}
