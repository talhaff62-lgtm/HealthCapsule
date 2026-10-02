"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import { api } from "@/lib/client-fetch";
import { slugify } from "@/lib/slug";
import {
  Card,
  TextField,
  TextAreaField,
  Button,
  Eyebrow,
  SectionTitle,
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

export type DoctorFormPayload = {
  name: string;
  specialization: string;
  degrees: string;
  currentPosition?: string;
  achievements?: string;
  photoUrl?: string;
  facilityId?: string;
  expertise?: string;
  medicalCollege?: string;
  pgInstitution?: string;
  phone?: string;
  email?: string;
  bmdcRegNo?: string;
  yearsExperience?: number;
  gender?: string;
  languages?: string;
  consultationFee?: number;
  bio?: string;
  hasOnlineConsultation: boolean;
};

export type DoctorFormInitialValues = Partial<{
  name: string;
  specialization: string;
  degrees: string;
  currentPosition: string;
  achievements: string;
  photoUrl: string;
  facilityId: string;
  facilityName: string;
  expertise: string;
  medicalCollege: string;
  pgInstitution: string;
  phone: string;
  email: string;
  bmdcRegNo: string;
  yearsExperience: string;
  gender: string;
  languages: string;
  consultationFee: string;
  bio: string;
  hasOnlineConsultation: boolean;
}>;

export type DoctorFormProps = {
  mode: "create" | "edit";
  initialValues?: DoctorFormInitialValues;
  onSubmit: (payload: DoctorFormPayload) => Promise<void>;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
  showListingSection?: boolean;
  initialListingTier?: string;
  initialFeaturedUntil?: string;
  onListingChange?: (tier: string, featuredUntil: string) => void;
};

export function DoctorForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  error,
  submitLabel = "Submit for review",
  showListingSection = false,
  initialListingTier = "FREE",
  initialFeaturedUntil = "",
  onListingChange,
}: DoctorFormProps) {
  const [name, setName] = useState(() => initialValues?.name ?? "");
  const [dupMatches, setDupMatches] = useState<
    Array<{
      id: string;
      name: string;
      degrees: string[];
      specialties: Array<{ specialty: { name: string } }>;
    }>
  >([]);

  // Listing state
  const [listingTier, setListingTier] = useState(() => initialListingTier);
  const [featuredUntil, setFeaturedUntil] = useState(() => initialFeaturedUntil);

  useEffect(() => {
    if (initialListingTier !== undefined) setListingTier(initialListingTier);
  }, [initialListingTier]);

  useEffect(() => {
    if (initialFeaturedUntil !== undefined) setFeaturedUntil(initialFeaturedUntil);
  }, [initialFeaturedUntil]);

  const handleTierChange = (newTier: string) => {
    setListingTier(newTier);
    onListingChange?.(newTier, featuredUntil);
  };

  const handleFeaturedUntilChange = (newDate: string) => {
    setFeaturedUntil(newDate);
    onListingChange?.(listingTier, newDate);
  };

  // Specialization state
  const [dbSpecialties, setDbSpecialties] = useState<SpecialtyItem[]>([]);
  const [specQuery, setSpecQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState(() => initialValues?.specialization ?? "");
  const [customSpec, setCustomSpec] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);

  const [degrees, setDegrees] = useState(() => initialValues?.degrees ?? "");
  const [expertise, setExpertise] = useState(() => initialValues?.expertise ?? "");
  const [currentPosition, setCurrentPosition] = useState(() => initialValues?.currentPosition ?? "");
  const [medicalCollege, setMedicalCollege] = useState(() => initialValues?.medicalCollege ?? "");
  const [pgInstitution, setPgInstitution] = useState(() => initialValues?.pgInstitution ?? "");
  const [bmdcRegNo, setBmdcRegNo] = useState(() => initialValues?.bmdcRegNo ?? "");
  const [yearsExperience, setYearsExperience] = useState(() => initialValues?.yearsExperience ?? "");
  const [gender, setGender] = useState(() => initialValues?.gender ?? "");
  const [languages, setLanguages] = useState(() => initialValues?.languages ?? "");

  const [consultationFee, setConsultationFee] = useState(() => initialValues?.consultationFee ?? "");
  const [hasOnlineConsultation, setHasOnlineConsultation] = useState(
    () => initialValues?.hasOnlineConsultation ?? false
  );

  // Facility state
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<{ id: string; name: string } | null>(() => {
    if (mode === "edit") {
      if (initialValues?.facilityId) {
        return { id: initialValues.facilityId, name: initialValues.facilityName ?? "" };
      }
      return null;
    }

    if (initialValues?.facilityId) {
      return { id: initialValues.facilityId, name: initialValues.facilityName ?? "" };
    }

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

  const [phone, setPhone] = useState(() => initialValues?.phone ?? "");
  const [email, setEmail] = useState(() => initialValues?.email ?? "");
  const [bio, setBio] = useState(() => initialValues?.bio ?? "");
  const [achievements, setAchievements] = useState(() => initialValues?.achievements ?? "");

  const [photoUrl, setPhotoUrl] = useState(() => initialValues?.photoUrl ?? "");
  const [photoPreview, setPhotoPreview] = useState(() => initialValues?.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [localError, setLocalError] = useState("");

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
    if (mode === "edit") return;
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
  }, [name, mode]);

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

  const filteredSpecs = mergedSpecializations.filter((s) =>
    s.toLowerCase().includes(specQuery.toLowerCase())
  );

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(facilityQuery.toLowerCase())
  );

  const finalSpecialization = isOther ? customSpec.trim() : selectedSpec;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      setUploadError("Please select an image file");
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "doctors");
      const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        image?: { url?: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.success || !data?.image?.url) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      setPhotoUrl(data.image.url);
    } catch (err) {
      e.target.value = "";
      setPhotoUrl("");
      setPhotoPreview("");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!finalSpecialization) {
      setLocalError("Please select or enter a specialization");
      return;
    }

    const parsedExp = yearsExperience.trim() ? parseInt(yearsExperience.trim(), 10) : undefined;
    const parsedFee = consultationFee.trim() ? parseFloat(consultationFee.trim()) : undefined;

    const payload: DoctorFormPayload = {
      name: name.trim(),
      specialization: finalSpecialization,
      degrees: degrees.trim(),
      expertise: expertise.trim() || undefined,
      currentPosition: currentPosition.trim() || undefined,
      medicalCollege: medicalCollege.trim() || undefined,
      pgInstitution: pgInstitution.trim() || undefined,
      bmdcRegNo: bmdcRegNo.trim() || undefined,
      yearsExperience: parsedExp !== undefined && !isNaN(parsedExp) ? parsedExp : undefined,
      gender: gender || undefined,
      languages: languages.trim() || undefined,
      consultationFee: parsedFee !== undefined && !isNaN(parsedFee) ? parsedFee : undefined,
      hasOnlineConsultation,
      facilityId: selectedFacility?.id || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      bio: bio.trim() || undefined,
      achievements: achievements.trim() || undefined,
      photoUrl: photoUrl || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Submit failed");
    }
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section: Listing (Optional) */}
      {showListingSection && (
        <div className="space-y-4">
          <SectionTitle className="mb-3">Listing</SectionTitle>
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
              Listing Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["FREE", "VERIFIED", "FEATURED", "PREMIUM"].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={listingTier === tier}
                  onClick={() => handleTierChange(tier)}
                  className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                    listingTier === tier
                      ? "border-brand-sky bg-brand-sky-bg text-brand-sky-deep font-semibold"
                      : "border-brand-gray bg-white text-brand-slate hover:bg-brand-mist"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
          <TextField
            id="featuredUntil"
            label="Featured Until (optional)"
            type="date"
            value={featuredUntil}
            onChange={(e) => handleFeaturedUntilChange(e.target.value)}
          />
        </div>
      )}

      {/* Section: Basic Info */}
      <div className="space-y-4">
        <SectionTitle className="mb-3">Basic Info</SectionTitle>

        <TextField
          id="name"
          label="Doctor Name"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {mode === "create" && dupMatches.length > 0 && (
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
      </div>

      {/* Section: Professional Details */}
      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Professional Details</SectionTitle>

        <TextField
          id="expertise"
          label="Expertise / Sub-specialty (optional)"
          type="text"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          placeholder="e.g. Interventional Cardiology"
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
          id="medicalCollege"
          label="Medical College (optional)"
          type="text"
          value={medicalCollege}
          onChange={(e) => setMedicalCollege(e.target.value)}
          placeholder="e.g. Dhaka Medical College"
        />

        <TextField
          id="pgInstitution"
          label="PG Institution (optional)"
          type="text"
          value={pgInstitution}
          onChange={(e) => setPgInstitution(e.target.value)}
          placeholder="e.g. BSMMU"
        />

        <TextField
          id="bmdcRegNo"
          label="BMDC Reg. No. (optional)"
          type="text"
          value={bmdcRegNo}
          onChange={(e) => setBmdcRegNo(e.target.value)}
          placeholder="e.g. A-12345"
        />

        <TextField
          id="yearsExperience"
          label="Years of Experience (optional)"
          type="number"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
        />

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Gender (optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={gender === g}
                onClick={() => setGender(gender === g ? "" : g)}
                className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                  gender === g
                    ? "border-brand-sky bg-brand-sky-bg text-brand-sky-deep font-semibold"
                    : "border-brand-gray bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <TextField
          id="languages"
          label="Languages (optional)"
          type="text"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="e.g. Bangla, English, Hindi — comma separated"
        />
      </div>

      {/* Section: Practice Info */}
      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Practice Info</SectionTitle>

        <TextField
          id="consultationFee"
          label="Consultation Fee (optional)"
          type="number"
          value={consultationFee}
          onChange={(e) => setConsultationFee(e.target.value)}
          placeholder="BDT amount"
        />

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Online Consultation (optional)
          </label>
          <button
            type="button"
            aria-pressed={hasOnlineConsultation}
            onClick={() => setHasOnlineConsultation(!hasOnlineConsultation)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              hasOnlineConsultation
                ? "border-brand-sky bg-brand-sky-bg text-brand-sky-deep font-semibold"
                : "border-brand-gray bg-white text-brand-slate hover:bg-brand-mist"
            }`}
          >
            {hasOnlineConsultation && <Check className="h-4 w-4 shrink-0" />}
            Provides Online Consultation
          </button>
        </div>

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
      </div>

      {/* Section: Contact */}
      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Contact</SectionTitle>

        <TextField
          id="phone"
          label="Phone (optional)"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          id="email"
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Section: Bio & Achievements */}
      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Bio & Achievements</SectionTitle>

        <TextAreaField
          id="bio"
          label="Bio (optional)"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief biography..."
        />

        <TextField
          id="achievements"
          label="Achievements (optional)"
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Gold Medalist"
        />
      </div>

      {/* Section: Photo */}
      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Photo</SectionTitle>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Doctor Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-full file:border-0 file:bg-brand-sky-bg file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-sky-deep hover:file:bg-brand-sky/20"
          />
          {uploading && (
            <p className="mt-2 text-sm text-brand-muted">Uploading...</p>
          )}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Doctor photo preview"
              className="mt-2 h-24 w-24 rounded-xl object-cover"
            />
          )}
          {uploadError && (
            <p className="mt-2 text-sm font-medium text-status-emergency">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {displayError && (
        <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
          {displayError}
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
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
