"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Eyebrow } from "@/components/panel/ui";
import {
  FacilityForm,
  FacilityFormPayload,
  FacilityFormInitialValues,
} from "@/components/panel/facility-form";

export default function AdminEditFacilityPage() {
  const { me, loading: meLoading } = useMe();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [initialValues, setInitialValues] = useState<FacilityFormInitialValues | null>(null);

  const [tier, setTier] = useState("FREE");
  const [featuredUntil, setFeaturedUntil] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!me || me.role !== "ADMIN") return;
    let alive = true;

    (async () => {
      try {
        const f = await api<any>(`/api/v1/facilities/${id}`);
        if (!alive) return;

        const mapped: FacilityFormInitialValues = {
          name: f.name,
          address: f.address ?? "",
          type: f.type,
          areaId: f.areaId,
          areaName: f.area?.name,
          thanaName: f.area?.thana?.name,
          amenityIds: f.amenities?.map((a: any) => a.amenityId ?? a.amenity?.id) ?? [],
          discountInfo: f.discountInfo ?? "",
          logoUrl: f.logoUrl ?? "",
          coverImageUrl: f.coverImageUrl ?? "",
          phone: f.phone ?? "",
          emergencyPhone: f.emergencyPhone ?? "",
          mobile: f.mobile ?? "",
          email: f.email ?? "",
          website: f.website ?? "",
          beds: f.beds != null ? String(f.beds) : "",
          icuBeds: f.icuBeds != null ? String(f.icuBeds) : "",
          nicuBeds: f.nicuBeds != null ? String(f.nicuBeds) : "",
          operationTheaters: f.operationTheaters != null ? String(f.operationTheaters) : "",
          establishedYear: f.establishedYear != null ? String(f.establishedYear) : "",
          hasEmergency: f.hasEmergency ?? false,
          hasAmbulance: f.hasAmbulance ?? false,
          hasIcu: f.hasIcu ?? false,
          hasNicu: f.hasNicu ?? false,
          hasBloodBank: f.hasBloodBank ?? false,
          hasPharmacy: f.hasPharmacy ?? false,
          hasPathologyLab: f.hasPathologyLab ?? false,
          hasHomeSampleCollection: f.hasHomeSampleCollection ?? false,
          hasOnlineReport: f.hasOnlineReport ?? false,
          hasParkingAvailable: f.hasParkingAvailable ?? false,
          diagnosticTests: (f.diagnosticTests ?? []).join(", "),
          imagingServices: (f.imagingServices ?? []).join(", "),
          openingHours: f.openingHours ?? "",
          ownership: f.ownership ?? "",
          accreditation: f.accreditation ?? "",
          dghsLicenceNo: f.dghsLicenceNo ?? "",
          insurancePanels: (f.insurancePanels ?? []).join(", "),
          description: f.description ?? "",
          longDescription: f.longDescription ?? "",
        };

        setInitialValues(mapped);
        setTier(f.listingTier ?? "FREE");
        setFeaturedUntil(f.featuredUntil ? String(f.featuredUntil).slice(0, 10) : "");
        setFetching(false);
      } catch (err) {
        if (alive) {
          setFetchError(err instanceof Error ? err.message : "Facility not found");
          setFetching(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, me]);

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

  const handleSubmit = async (payload: FacilityFormPayload) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await api(`/api/v1/facilities/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...payload,
          listingTier: tier,
          featuredUntil: featuredUntil || null,
        }),
      });
      router.push("/admin/entries");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Edit facility" userName={me.name}>
      <Eyebrow className="mb-4 block">EDIT FACILITY</Eyebrow>
      {fetching ? (
        <div className="py-12 text-center text-brand-muted">Loading facility...</div>
      ) : fetchError ? (
        <div className="py-12 text-center text-status-emergency">{fetchError}</div>
      ) : initialValues ? (
        <FacilityForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={submitError}
          submitLabel="Save changes"
          showListingSection
          initialListingTier={tier}
          initialFeaturedUntil={featuredUntil}
          onListingChange={(t, fu) => {
            setTier(t);
            setFeaturedUntil(fu);
          }}
        />
      ) : null}
    </AdminShell>
  );
}
