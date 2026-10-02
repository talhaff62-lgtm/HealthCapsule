"use client";

import { useState, useEffect, FormEvent } from "react";
import { Hospital, ScanLine, Check, AlertTriangle } from "lucide-react";
import { api } from "@/lib/client-fetch";
import {
  TextField,
  TextAreaField,
  Button,
  SectionTitle,
} from "@/components/panel/ui";

export type FacilityFormPayload = {
  name: string;
  address: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  areaId: string;
  amenityIds: string[];
  discountInfo?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  emergencyPhone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  beds?: number;
  icuBeds?: number;
  nicuBeds?: number;
  operationTheaters?: number;
  establishedYear?: number;
  hasEmergency: boolean;
  hasAmbulance: boolean;
  hasIcu: boolean;
  hasNicu: boolean;
  hasBloodBank: boolean;
  hasPharmacy: boolean;
  hasPathologyLab: boolean;
  hasHomeSampleCollection: boolean;
  hasOnlineReport: boolean;
  hasParkingAvailable: boolean;
  diagnosticTests?: string[];
  imagingServices?: string[];
  openingHours?: string;
  ownership?: string;
  accreditation?: string;
  dghsLicenceNo?: string;
  insurancePanels?: string[];
  description?: string;
  longDescription?: string;
};

export type FacilityFormInitialValues = Partial<{
  name: string;
  address: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  areaId: string;
  areaName: string; // for prefilling the area picker display
  thanaName: string; // for prefilling the area picker display
  amenityIds: string[];
  discountInfo: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  emergencyPhone: string;
  mobile: string;
  email: string;
  website: string;
  beds: string;
  icuBeds: string;
  nicuBeds: string;
  operationTheaters: string;
  establishedYear: string;
  hasEmergency: boolean;
  hasAmbulance: boolean;
  hasIcu: boolean;
  hasNicu: boolean;
  hasBloodBank: boolean;
  hasPharmacy: boolean;
  hasPathologyLab: boolean;
  hasHomeSampleCollection: boolean;
  hasOnlineReport: boolean;
  hasParkingAvailable: boolean;
  diagnosticTests: string; // pre-joined comma string for the text field
  imagingServices: string; // pre-joined comma string
  openingHours: string;
  ownership: string;
  accreditation: string;
  dghsLicenceNo: string;
  insurancePanels: string; // pre-joined comma string
  description: string;
  longDescription: string;
}>;

type FacilityFormProps = {
  mode: "create" | "edit";
  initialValues?: FacilityFormInitialValues;
  onSubmit: (payload: FacilityFormPayload) => Promise<void>;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
  showListingSection?: boolean; // admin edit mode: show listingTier + featuredUntil
  initialListingTier?: string; // "FREE" | "VERIFIED" | "FEATURED" | "PREMIUM"
  initialFeaturedUntil?: string; // YYYY-MM-DD or ""
  onListingChange?: (tier: string, featuredUntil: string) => void;
};

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

type FacilityType = "HOSPITAL" | "DIAGNOSTIC_CENTER";

export function FacilityForm({
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
}: FacilityFormProps) {
  const [type, setType] = useState<FacilityType>(
    initialValues?.type ?? "HOSPITAL"
  );
  const [name, setName] = useState(initialValues?.name ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [discountInfo, setDiscountInfo] = useState(
    initialValues?.discountInfo ?? ""
  );
  const [dupMatches, setDupMatches] = useState<
    Array<{
      id: string;
      name: string;
      type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
      area?: { name: string } | null;
    }>
  >([]);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>(
    initialValues?.amenityIds ?? []
  );

  const [areaQuery, setAreaQuery] = useState("");
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaItem | null>(() =>
    initialValues?.areaId
      ? {
          id: initialValues.areaId,
          name: initialValues.areaName ?? "",
          thana: { name: initialValues.thanaName ?? "" },
        }
      : null
  );
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [areaError, setAreaError] = useState("");

  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl ?? "");
  const [logoPreview, setLogoPreview] = useState(initialValues?.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");

  const [coverImageUrl, setCoverImageUrl] = useState(
    initialValues?.coverImageUrl ?? ""
  );
  const [coverPreview, setCoverPreview] = useState(
    initialValues?.coverImageUrl ?? ""
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");

  // Contact Info
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(
    initialValues?.emergencyPhone ?? ""
  );
  const [mobile, setMobile] = useState(initialValues?.mobile ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [website, setWebsite] = useState(initialValues?.website ?? "");

  // Capacity & Infrastructure
  const [beds, setBeds] = useState(initialValues?.beds ?? "");
  const [icuBeds, setIcuBeds] = useState(initialValues?.icuBeds ?? "");
  const [nicuBeds, setNicuBeds] = useState(initialValues?.nicuBeds ?? "");
  const [operationTheaters, setOperationTheaters] = useState(
    initialValues?.operationTheaters ?? ""
  );
  const [establishedYear, setEstablishedYear] = useState(
    initialValues?.establishedYear ?? ""
  );

  // Capabilities
  const [hasEmergency, setHasEmergency] = useState(
    initialValues?.hasEmergency ?? false
  );
  const [hasAmbulance, setHasAmbulance] = useState(
    initialValues?.hasAmbulance ?? false
  );
  const [hasIcu, setHasIcu] = useState(initialValues?.hasIcu ?? false);
  const [hasNicu, setHasNicu] = useState(initialValues?.hasNicu ?? false);
  const [hasBloodBank, setHasBloodBank] = useState(
    initialValues?.hasBloodBank ?? false
  );
  const [hasPharmacy, setHasPharmacy] = useState(
    initialValues?.hasPharmacy ?? false
  );
  const [hasPathologyLab, setHasPathologyLab] = useState(
    initialValues?.hasPathologyLab ?? false
  );
  const [hasHomeSampleCollection, setHasHomeSampleCollection] = useState(
    initialValues?.hasHomeSampleCollection ?? false
  );
  const [hasOnlineReport, setHasOnlineReport] = useState(
    initialValues?.hasOnlineReport ?? false
  );
  const [hasParkingAvailable, setHasParkingAvailable] = useState(
    initialValues?.hasParkingAvailable ?? false
  );

  // Services & Diagnostics
  const [diagnosticTests, setDiagnosticTests] = useState(
    initialValues?.diagnosticTests ?? ""
  );
  const [imagingServices, setImagingServices] = useState(
    initialValues?.imagingServices ?? ""
  );
  const [openingHours, setOpeningHours] = useState(
    initialValues?.openingHours ?? ""
  );

  // Administrative
  const [ownership, setOwnership] = useState(initialValues?.ownership ?? "");
  const [accreditation, setAccreditation] = useState(
    initialValues?.accreditation ?? ""
  );
  const [dghsLicenceNo, setDghsLicenceNo] = useState(
    initialValues?.dghsLicenceNo ?? ""
  );
  const [insurancePanels, setInsurancePanels] = useState(
    initialValues?.insurancePanels ?? ""
  );

  // Description
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [longDescription, setLongDescription] = useState(
    initialValues?.longDescription ?? ""
  );

  // Listing Section state
  const [listingTier, setListingTier] = useState(initialListingTier);
  const [featuredUntil, setFeaturedUntil] = useState(initialFeaturedUntil);

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
  }, [name, mode]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const uploadImage = async (
    file: File,
    setPreview: (v: string) => void,
    setUrl: (v: string) => void,
    setUploading: (v: boolean) => void,
    setUploadError: (v: string) => void
  ) => {
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("File must be an image");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "facilities");
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        image?: { url?: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.success || !data.image?.url) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      setUrl(data.image.url);
    } catch (err) {
      setUrl("");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const parseNumber = (val: string) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0 ? num : undefined;
  };

  const parseArray = (val: string) => {
    const arr = val.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  };

  const handleTierChange = (t: string) => {
    setListingTier(t);
    onListingChange?.(t, featuredUntil);
  };

  const handleFeaturedUntilChange = (f: string) => {
    setFeaturedUntil(f);
    onListingChange?.(listingTier, f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAreaError("");

    if (!selectedArea) {
      setAreaError("Area is required");
      return;
    }

    const payload: FacilityFormPayload = {
      name: name.trim(),
      address: address.trim(),
      type,
      areaId: selectedArea.id,
      amenityIds: selectedAmenityIds,
      discountInfo: discountInfo.trim() || undefined,
      logoUrl: logoUrl || undefined,
      coverImageUrl: coverImageUrl || undefined,
      phone: phone.trim() || undefined,
      emergencyPhone: emergencyPhone.trim() || undefined,
      mobile: mobile.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      beds: parseNumber(beds),
      icuBeds: parseNumber(icuBeds),
      nicuBeds: parseNumber(nicuBeds),
      operationTheaters: parseNumber(operationTheaters),
      establishedYear: parseNumber(establishedYear),
      hasEmergency,
      hasAmbulance,
      hasIcu,
      hasNicu,
      hasBloodBank,
      hasPharmacy,
      hasPathologyLab,
      hasHomeSampleCollection,
      hasOnlineReport,
      hasParkingAvailable,
      diagnosticTests: parseArray(diagnosticTests),
      imagingServices: parseArray(imagingServices),
      openingHours: openingHours.trim() || undefined,
      ownership: ownership.trim() || undefined,
      accreditation: accreditation.trim() || undefined,
      dghsLicenceNo: dghsLicenceNo.trim() || undefined,
      insurancePanels: parseArray(insurancePanels),
      description: description.trim() || undefined,
      longDescription: longDescription.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showListingSection && (
        <div className="mb-6 rounded-2xl border border-brand-gray bg-white p-4 space-y-4">
          <SectionTitle className="mb-2">Listing Tier & Visibility</SectionTitle>
          <div>
            <span className="text-sm font-semibold text-brand-slate mb-2 block">
              Listing Tier
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["FREE", "VERIFIED", "FEATURED", "PREMIUM"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={listingTier === t}
                  onClick={() => handleTierChange(t)}
                  className={`h-12 rounded-xl border-2 font-semibold flex items-center justify-center text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky ${
                    listingTier === t
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-gray bg-white text-brand-muted hover:border-brand-sky"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <TextField
            id="featuredUntil"
            label="Featured Until Date"
            type="date"
            value={featuredUntil}
            onChange={(e) => handleFeaturedUntilChange(e.target.value)}
          />
        </div>
      )}

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

      {/* Contact Info */}
      <div>
        <SectionTitle className="mt-6 mb-3">Contact Info</SectionTitle>
        <div className="space-y-4">
          <TextField
            id="phone"
            label="Phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            id="emergencyPhone"
            label="Emergency Phone"
            type="text"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />
          <TextField
            id="mobile"
            label="Mobile"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="website"
            label="Website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      {/* Capacity & Infrastructure */}
      <div>
        <SectionTitle className="mt-6 mb-3">Capacity & Infrastructure</SectionTitle>
        <div className="space-y-4">
          <TextField
            id="beds"
            label="Total Beds"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
          />
          <TextField
            id="icuBeds"
            label="ICU Beds"
            type="number"
            value={icuBeds}
            onChange={(e) => setIcuBeds(e.target.value)}
          />
          <TextField
            id="nicuBeds"
            label="NICU Beds"
            type="number"
            value={nicuBeds}
            onChange={(e) => setNicuBeds(e.target.value)}
          />
          <TextField
            id="operationTheaters"
            label="Operation Theaters"
            type="number"
            value={operationTheaters}
            onChange={(e) => setOperationTheaters(e.target.value)}
          />
          <TextField
            id="establishedYear"
            label="Established Year"
            type="number"
            placeholder="e.g. 1995"
            value={establishedYear}
            onChange={(e) => setEstablishedYear(e.target.value)}
          />
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <SectionTitle className="mt-6 mb-3">Capabilities</SectionTitle>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-semibold text-brand-slate mb-2 block">
              Services & Facilities
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { key: "hasEmergency", label: "Emergency (24/7)", value: hasEmergency, setter: setHasEmergency },
                { key: "hasAmbulance", label: "Ambulance", value: hasAmbulance, setter: setHasAmbulance },
                { key: "hasIcu", label: "ICU", value: hasIcu, setter: setHasIcu },
                { key: "hasNicu", label: "NICU", value: hasNicu, setter: setHasNicu },
                { key: "hasBloodBank", label: "Blood Bank", value: hasBloodBank, setter: setHasBloodBank },
                { key: "hasPharmacy", label: "Pharmacy", value: hasPharmacy, setter: setHasPharmacy },
                { key: "hasPathologyLab", label: "Pathology Lab", value: hasPathologyLab, setter: setHasPathologyLab },
                { key: "hasHomeSampleCollection", label: "Home Sample Collection", value: hasHomeSampleCollection, setter: setHasHomeSampleCollection },
                { key: "hasOnlineReport", label: "Online Report Access", value: hasOnlineReport, setter: setHasOnlineReport },
                { key: "hasParkingAvailable", label: "Parking", value: hasParkingAvailable, setter: setHasParkingAvailable },
              ].map((cap) => (
                <button
                  key={cap.key}
                  type="button"
                  aria-pressed={cap.value}
                  onClick={() => cap.setter(!cap.value)}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky ${
                    cap.value
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-gray bg-white text-brand-muted hover:border-brand-sky"
                  }`}
                >
                  {cap.value && <Check className="h-4 w-4 text-white" />}
                  <span>{cap.label}</span>
                </button>
              ))}
            </div>
          </div>

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
                    aria-pressed={selected}
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
        </div>
      </div>

      {/* Services & Diagnostics */}
      <div>
        <SectionTitle className="mt-6 mb-3">Services & Diagnostics</SectionTitle>
        <div className="space-y-4">
          <TextField
            id="diagnosticTests"
            label="Diagnostic Tests"
            placeholder="e.g. CBC, Urine R/E, Blood Sugar — comma separated"
            value={diagnosticTests}
            onChange={(e) => setDiagnosticTests(e.target.value)}
          />
          <TextField
            id="imagingServices"
            label="Imaging / Procedures"
            placeholder="e.g. X-Ray, CT Scan, MRI — comma separated"
            value={imagingServices}
            onChange={(e) => setImagingServices(e.target.value)}
          />
          <TextField
            id="openingHours"
            label="Opening Hours"
            placeholder="e.g. 24 Hours or 08:00 AM - 09:00 PM"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
          />
        </div>
      </div>

      {/* Administrative */}
      <div>
        <SectionTitle className="mt-6 mb-3">Administrative</SectionTitle>
        <div className="space-y-4">
          <TextField
            id="ownership"
            label="Ownership"
            placeholder="e.g. Private, Government"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
          />
          <TextField
            id="accreditation"
            label="Accreditation"
            value={accreditation}
            onChange={(e) => setAccreditation(e.target.value)}
          />
          <TextField
            id="dghsLicenceNo"
            label="DGHS Licence No."
            value={dghsLicenceNo}
            onChange={(e) => setDghsLicenceNo(e.target.value)}
          />
          <TextField
            id="insurancePanels"
            label="Insurance Panels"
            placeholder="comma separated"
            value={insurancePanels}
            onChange={(e) => setInsurancePanels(e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <SectionTitle className="mt-6 mb-3">Description</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            id="description"
            label="Short Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextAreaField
            id="longDescription"
            label="Detailed Description"
            rows={5}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
          />
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

      {/* Facility Logo */}
      <div>
        <label htmlFor="logo" className="block mb-1.5 text-sm font-semibold text-brand-slate">
          Facility Logo (optional)
        </label>
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, setLogoPreview, setLogoUrl, setLogoUploading, setLogoError);
          }}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-full file:border-0 file:bg-brand-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-navy/90"
        />
        {logoPreview && (
          <img src={logoPreview} alt="Logo preview" className="mt-2 h-20 w-20 rounded-xl object-cover" />
        )}
        {logoUploading && <p className="mt-1.5 text-sm text-brand-muted">Uploading logo...</p>}
        {logoError && <p className="mt-1.5 text-sm text-status-emergency">{logoError}</p>}
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="cover" className="block mb-1.5 text-sm font-semibold text-brand-slate">
          Cover Image (optional)
        </label>
        <input
          id="cover"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, setCoverPreview, setCoverImageUrl, setCoverUploading, setCoverError);
          }}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-full file:border-0 file:bg-brand-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-navy/90"
        />
        {coverPreview && (
          <img src={coverPreview} alt="Cover preview" className="mt-2 h-32 w-full rounded-xl object-cover" />
        )}
        {coverUploading && <p className="mt-1.5 text-sm text-brand-muted">Uploading cover...</p>}
        {coverError && <p className="mt-1.5 text-sm text-status-emergency">{coverError}</p>}
      </div>

      {/* Sticky bottom bar */}
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
