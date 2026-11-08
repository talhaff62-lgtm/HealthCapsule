"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { DoctorForm, DoctorFormPayload } from "@/components/panel/doctor-form";
import { Card, Button, Eyebrow } from "@/components/panel/ui";
import { useLanguage } from "@/components/language-provider";

export default function NewDoctorPage() {
  const { me, loading } = useMe();
  const router = useRouter();
  const { t } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  if (loading) {
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

  const handleSubmit = async (payload: DoctorFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await api<{ id: string; name: string }>("/api/v1/doctors", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmittedName(res.name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.form.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setError("");
    setSuccess(false);
    setSubmitting(false);
    setSubmittedName("");
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
      <Eyebrow className="mb-4 block">{t("staff.newEntryEyebrow")}</Eyebrow>
      <DoctorForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={t("common.form.submitForReview")}
      />
    </StaffShell>
  );
}
