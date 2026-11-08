"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Eyebrow } from "@/components/panel/ui";
import {
  FacilityForm,
  FacilityFormPayload,
} from "@/components/panel/facility-form";
import { useLanguage } from "@/components/language-provider";

export default function AdminNewFacilityPage() {
  const { me, loading } = useMe();
  const router = useRouter();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
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

  const handleSubmit = async (payload: FacilityFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api("/api/v1/facilities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/entries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title={t("admin.facilities.newTitle")} userName={me.name}>
      <Eyebrow className="mb-4 block">{t("admin.facilities.newEyebrow")}</Eyebrow>
      <FacilityForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={t("common.form.submitForReview")}
      />
    </AdminShell>
  );
}
