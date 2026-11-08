"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { VideoForm, VideoFormPayload } from "@/components/admin/VideoForm";
import { Eyebrow } from "@/components/panel/ui";
import { useLanguage } from "@/components/language-provider";

export default function AdminNewVideoPage() {
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

  const handleSubmit = async (payload: VideoFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api("/api/v1/admin/videos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/videos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title={t("admin.videos.newTitle")} userName={me.name}>
      <Eyebrow className="mb-4 block">{t("admin.videos.newEyebrow")}</Eyebrow>
      <VideoForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={t("common.form.submitForReview")}
      />
    </AdminShell>
  );
}
