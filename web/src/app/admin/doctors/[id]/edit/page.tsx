"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { useLanguage } from "@/components/language-provider";
import { api } from "@/lib/client-fetch";
import {
  DoctorForm,
  DoctorFormInitialValues,
  DoctorFormPayload,
} from "@/components/panel/doctor-form";
import { Eyebrow } from "@/components/panel/ui";

type DoctorApiResponse = {
  id: string;
  name: string | null;
  slug: string;
  photoUrl: string | null;
  degrees: string[];
  yearsExperience: number | null;
  consultationFee: string | null;
  registrationYear: number | null;
  listingTier: string;
  rating: number | null;
  totalReviews: number | null;
  hasOnlineConsultation: boolean;
  specialties: Array<{ specialty: { name: string; slug: string } }>;
  chambers: Array<{
    area: { name: string; slug: string } | null;
    facility: { id: string; name: string } | null;
    schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  }>;
  collectedBy: { name: string } | null;
  bio: string | null;
  currentPosition: string | null;
  achievements: string | null;
  bmdcRegNo: string | null;
  gender: string | null;
  expertise: string | null;
  medicalCollege: string | null;
  pgInstitution: string | null;
  phone: string | null;
  email: string | null;
  languages: string[];
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  verificationStatus: string;
};

export default function AdminEditDoctorPage() {
  const { me, loading: meLoading } = useMe();
  const router = useRouter();
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;

  const [initialValues, setInitialValues] = useState<DoctorFormInitialValues | null>(null);
  const [tier, setTier] = useState("FREE");
  const [featuredUntil, setFeaturedUntil] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const d = await api<DoctorApiResponse>(`/api/v1/doctors/${id}`);
        if (!alive) return;
        setTier(d.listingTier ?? "FREE");
        setFeaturedUntil(
          d.featuredUntil ? String(d.featuredUntil).slice(0, 10) : ""
        );
        setInitialValues({
          name: d.name ?? "",
          specialization: d.specialties?.[0]?.specialty?.name ?? "",
          degrees: (d.degrees ?? []).join(", "),
          currentPosition: d.currentPosition ?? "",
          achievements: d.achievements ?? "",
          photoUrl: d.photoUrl ?? "",
          facilityId: d.chambers?.[0]?.facility?.id ?? "",
          facilityName: d.chambers?.[0]?.facility?.name ?? "",
          expertise: d.expertise ?? "",
          medicalCollege: d.medicalCollege ?? "",
          pgInstitution: d.pgInstitution ?? "",
          phone: d.phone ?? "",
          email: d.email ?? "",
          bmdcRegNo: d.bmdcRegNo ?? "",
          yearsExperience:
            d.yearsExperience != null ? String(d.yearsExperience) : "",
          gender: d.gender ?? "",
          languages: (d.languages ?? []).join(", "),
          consultationFee:
            d.consultationFee != null ? String(d.consultationFee) : "",
          bio: d.bio ?? "",
          hasOnlineConsultation: d.hasOnlineConsultation ?? false,
        });
      } catch (err) {
        if (alive) {
          setFetchError(
            err instanceof Error ? err.message : "Doctor not found"
          );
        }
      } finally {
        if (alive) {
          setFetchLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (meLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">{t("common.ui.loading")}</div>
      </div>
    );
  }

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">{t("common.ui.notAuthorized")}</div>
      </div>
    );
  }

  if (fetchError || !initialValues) {
    return (
      <AdminShell title={t("admin.doctors.editTitle")} userName={me.name}>
        <div className="text-center py-12">
          <div className="text-status-emergency text-lg font-medium mb-2">
            {fetchError || "Doctor not found"}
          </div>
        </div>
      </AdminShell>
    );
  }

  const handleSubmit = async (payload: DoctorFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api(`/api/v1/doctors/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...payload,
          listingTier: tier,
          featuredUntil: featuredUntil || null,
        }),
      });
      router.push("/admin/entries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title={t("admin.doctors.editTitle")} userName={me.name}>
      <Eyebrow className="mb-4 block">{t("admin.doctors.editEyebrow")}</Eyebrow>
      <DoctorForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={t("common.form.saveChanges")}
        showListingSection
        initialListingTier={tier}
        initialFeaturedUntil={featuredUntil}
        onListingChange={(t, fu) => {
          setTier(t);
          setFeaturedUntil(fu);
        }}
      />
    </AdminShell>
  );
}
