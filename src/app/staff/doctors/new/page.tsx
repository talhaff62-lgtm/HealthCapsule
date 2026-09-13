"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X, Check, AlertTriangle } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { slugify } from "@/lib/slug";
import {
  Card,
  TextField,
  Button,
  Eyebrow,
} from "@/components/panel/ui";

const SPECIALIZATIONS = [
  "Cardiologist",
  "Dermatologist",
  "Dentist",
  "ENT Specialist",
  "Gynecologist",
  "Medicine Specialist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Urologist",
  "General Surgeon",
];

type FacilityOption = {
  id: string;
  name: string;
  type: string;
};

type SpecialtyItem = {
  id: string;
  name: string;
  slug: string;
};

export default function NewDoctorPage() {
  const { me, loading } = useMe();
  const router = useRouter();

  const [name, setName] = useState("");
  const [dupMatches, setDupMatches] = useState<
    Array<{
      id: string;
      name: string;
      degrees: string[];
      specialties: Array<{ specialty: { name: string } }>;
    }>
  >([]);

  // Specialization state
  const [dbSpecialties, setDbSpecialties] = useState<SpecialtyItem[]>([]);
  const [specQuery, setSpecQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [customSpec, setCustomSpec] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);

  const [degrees, setDegrees] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [achievements, setAchievements] = useState("");

  // Facility state
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<{ id: string; name: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("lastFacility");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.name) {
          return { id: parsed.id, name: parsed.name };
        }
      }
    } catch {
      // Ignore corrupt JSON
    }
    return null;
  });
  const [facilityQuery, setFacilityQuery] = useState("");
  const [facilityOpen, setFacilityOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    let alive = true;
    api<SpecialtyItem[]>("/api/v1/specialties")
      .then((data) => {
        if (alive) setDbSpecialties(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    api<FacilityOption[]>("/api/v1/facilities/options")
      .then((data) => {
        if (alive) setFacilities(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

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
          degrees: string[];
          specialties: Array<{ specialty: { name: string } }>;
        }>
      >(`/api/v1/doctors/directory?q=${encodeURIComponent(queryStr)}`)
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

  const mergedSpecializations = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of SPECIALIZATIONS) {
      map.set(slugify(s), s);
    }
    for (const item of dbSpecialties) {
      if (!map.has(item.slug)) {
        map.set(item.slug, item.name);
      }
    }
    return Array.from(map.values()).sort();
  }, [dbSpecialties]);

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

  const filteredSpecs = mergedSpecializations.filter((s) =>
    s.toLowerCase().includes(specQuery.toLowerCase())
  );

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(facilityQuery.toLowerCase())
  );

  const finalSpecialization = isOther ? customSpec.trim() : selectedSpec;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!finalSpecialization) {
      setError("Please select or enter a specialization");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api<{ id: string; name: string }>("/api/v1/doctors", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          specialization: finalSpecialization,
          degrees: degrees.trim(),
          currentPosition: currentPosition.trim() || undefined,
          achievements: achievements.trim() || undefined,
          facilityId: selectedFacility?.id || undefined,
        }),
      });

      setSubmittedName(res.name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
      setSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setName("");
    setDupMatches([]);
    setSelectedSpec("");
    setSpecQuery("");
    setCustomSpec("");
    setIsOther(false);
    setDegrees("");
    setCurrentPosition("");
    setAchievements("");
    setError("");
    setSuccess(false);
    setSubmitting(false);
  };

  if (success) {
    return (
      <StaffShell title="New doctor" userName={me.name}>
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
            <Button
              onClick={() => router.push("/staff/my-submissions")}
              variant="outline"
              size="lg"
              fullWidth
            >
              View my submissions
            </Button>
          </div>
        </Card>
      </StaffShell>
    );
  }

  return (
    <StaffShell title="New doctor" userName={me.name}>
      <Eyebrow className="mb-4 block">NEW ENTRY</Eyebrow>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="name"
          label="Doctor Name"
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
              {dupMatches.slice(0, 3).map((match) => {
                const degreesJoined =
                  match.degrees && match.degrees.length > 0
                    ? match.degrees.join(", ")
                    : "";
                const specNames =
                  match.specialties?.map((s) => s.specialty.name).join(", ") ||
                  "";
                const details = degreesJoined || specNames;
                return (
                  <li key={match.id} className="truncate">
                    {match.name}
                    {details ? ` — ${details}` : ""}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="relative">
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Specialization <span className="text-status-emergency">*</span>
          </label>
          {selectedSpec || isOther ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-11 items-center gap-2 rounded-full border border-brand-sky bg-brand-sky-bg px-4 text-sm font-semibold text-brand-sky-deep">
                {isOther ? `Other: ${customSpec || "..."}` : selectedSpec}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpec("");
                    setIsOther(false);
                    setCustomSpec("");
                    setSpecQuery("");
                  }}
                  className="rounded-full p-0.5 hover:bg-brand-sky/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={specQuery}
                onChange={(e) => {
                  setSpecQuery(e.target.value);
                  setSpecOpen(true);
                }}
                onFocus={() => setSpecOpen(true)}
                placeholder="Search specialization..."
                className="h-12 w-full rounded-xl border border-brand-gray bg-white px-4 text-base text-brand-slate placeholder:text-brand-navy-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
              />
              {specOpen && (
                <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-brand-gray bg-white shadow-lg">
                  {filteredSpecs.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSpec(s);
                        setSpecOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-brand-slate hover:bg-brand-sky-bg-soft transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOther(true);
                      setSpecOpen(false);
                    }}
                    className="w-full border-t border-brand-gray px-4 py-3 text-left text-sm hover:bg-brand-sky-bg-soft transition-colors"
                  >
                    <Eyebrow>OTHER…</Eyebrow>
                  </button>
                </div>
              )}
            </div>
          )}
          {isOther && (
            <div className="mt-2">
              <TextField
                type="text"
                value={customSpec}
                onChange={(e) => setCustomSpec(e.target.value)}
                placeholder="Specify specialization"
                required
              />
            </div>
          )}
        </div>

        <TextField
          id="degrees"
          label="Degrees"
          required
          type="text"
          value={degrees}
          onChange={(e) => setDegrees(e.target.value)}
          placeholder="MBBS, FCPS"
        />

        <TextField
          id="currentPosition"
          label="Current Position (optional)"
          type="text"
          value={currentPosition}
          onChange={(e) => setCurrentPosition(e.target.value)}
          placeholder="e.g. Associate Professor, DMC"
        />

        <TextField
          id="achievements"
          label="Achievements (optional)"
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Gold Medalist"
        />

        <div className="relative">
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Linked Facility (optional)
          </label>
          {selectedFacility ? (
            <Card className="p-3.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-navy">
                {selectedFacility.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFacility(null);
                  setFacilityQuery("");
                }}
                className="rounded-lg p-1 text-brand-muted hover:text-brand-navy hover:bg-brand-mist transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </Card>
          ) : (
            <div>
              <input
                type="text"
                value={facilityQuery}
                onChange={(e) => {
                  setFacilityQuery(e.target.value);
                  setFacilityOpen(true);
                }}
                onFocus={() => setFacilityOpen(true)}
                placeholder="Search hospital or diagnostic center..."
                className="h-12 w-full rounded-xl border border-brand-gray bg-white px-4 text-base text-brand-slate placeholder:text-brand-navy-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
              />
              {facilityOpen && (
                <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-brand-gray bg-white shadow-lg">
                  {filteredFacilities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-brand-muted">No facilities found</div>
                  ) : (
                    filteredFacilities.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFacility({ id: f.id, name: f.name });
                          setFacilityOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-brand-slate hover:bg-brand-sky-bg-soft transition-colors"
                      >
                        <span className="font-medium">{f.name}</span>
                        <span className="text-xs text-brand-muted">{f.type}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
            {error}
          </div>
        )}

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
