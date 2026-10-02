"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { StaffShell } from "@/components/panel/staff-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Card, Button, Eyebrow } from "@/components/panel/ui";
import {
  FacilityForm,
  FacilityFormPayload,
} from "@/components/panel/facility-form";

type CreatedFacility = {
  id: string;
  name: string;
};

export default function NewHospitalPage() {
  const { me, loading } = useMe();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [formKey, setFormKey] = useState(0);

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

  const handleSubmit = async (payload: FacilityFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      const created = await api<CreatedFacility>("/api/v1/facilities", {
        method: "POST",
        body: JSON.stringify(payload),
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
    setError("");
    setSuccess(false);
    setSubmittedName("");
    setFormKey((prev) => prev + 1);
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
      <FacilityForm
        key={formKey}
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Submit for review"
      />
    </StaffShell>
  );
}
