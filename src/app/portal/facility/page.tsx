import { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserRole, VerificationStatus } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Facility Portal — HealthCapsule",
  description: "Manage your healthcare facilities.",
};

const typeLabels: Record<string, string> = {
  HOSPITAL: "Hospital",
  DIAGNOSTIC_CENTER: "Diagnostic Center",
  CLINIC: "Clinic",
};

const statusStyles: Record<VerificationStatus, string> = {
  VERIFIED: "bg-status-verified-light text-status-verified",
  PENDING: "bg-status-warning-light text-status-warning",
  REJECTED: "bg-status-emergency-light text-status-emergency",
};

export default async function FacilityPortalPage() {
  const user = await requireRole(UserRole.FACILITY_ADMIN).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const facilities = await prisma.facility.findMany({
    where: { adminId: user.id, deletedAt: null },
    include: { area: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
            Facility Panel
          </h1>
          <p className="mt-1 text-brand-muted">
            Manage your healthcare facilities.
          </p>
        </div>

        {facilities.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
            You do not manage any facilities yet.
          </div>
        ) : (
          <div className="space-y-4">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-brand-navy">
                      {facility.name}
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">
                      {facility.area.name}
                      {facility.address ? ` — ${facility.address}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-cream-dark px-3 py-1 text-xs font-medium text-brand-navy">
                      {typeLabels[facility.type] ?? facility.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[facility.verificationStatus]
                      }`}
                    >
                      {facility.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-brand-gray pt-4">
                  <div className="text-center">
                    <p className="text-xs text-brand-muted">Doctors</p>
                    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-brand-muted">Chambers</p>
                    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-brand-muted">Appointments</p>
                    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
