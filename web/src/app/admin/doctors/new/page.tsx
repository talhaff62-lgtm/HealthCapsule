"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { DoctorForm, DoctorFormPayload } from "@/components/panel/doctor-form";
import { Eyebrow } from "@/components/panel/ui";

export default function AdminNewDoctorPage() {
  const { me, loading } = useMe();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
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

  const handleSubmit = async (payload: DoctorFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api("/api/v1/doctors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/entries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Add doctor" userName={me.name}>
      <Eyebrow className="mb-4 block">NEW DOCTOR</Eyebrow>
      <DoctorForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Create doctor"
      />
    </AdminShell>
  );
}
