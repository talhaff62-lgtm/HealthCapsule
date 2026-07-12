import { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserRole, VerificationStatus } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminDoctorRow from "@/components/admin-portal/AdminDoctorRow";

export const metadata: Metadata = {
  title: "Admin Portal — HealthCapsule",
  description: "Review and manage doctor verification status.",
};

const validStatuses: VerificationStatus[] = ["PENDING", "VERIFIED", "REJECTED"];

export default async function AdminPortalPage({
  searchParams,
}: {
  searchParams?: { status?: string; page?: string };
}) {
  const user = await requireRole(UserRole.ADMIN).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const statusFilter =
    searchParams?.status && validStatuses.includes(searchParams.status as VerificationStatus)
      ? (searchParams.status as VerificationStatus)
      : undefined;

  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSize = 20;

  const where = statusFilter ? { verificationStatus: statusFilter } : {};

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: {
        user: { select: { phone: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.doctor.count({ where }),
  ]);

  const pageCount = Math.ceil(total / pageSize);

  const tabs: { label: string; value?: VerificationStatus }[] = [
    { label: "All" },
    { label: "Pending", value: "PENDING" },
    { label: "Verified", value: "VERIFIED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <section className="min-h-screen bg-brand-gray py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-brand-slate sm:text-3xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Admin Portal
          </h1>
          <p className="mt-1 text-brand-muted">
            Review doctor registrations, update verification status, and manage listing tiers.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active =
              (!statusFilter && !tab.value) || statusFilter === tab.value;
            const href = tab.value ? `/portal/admin?status=${tab.value}` : "/portal/admin";
            return (
              <a
                key={tab.label}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-teal text-white"
                    : "border border-brand-gray bg-brand-white text-brand-slate hover:bg-brand-gray"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </div>

        <div className="mb-4 text-sm text-brand-muted">
          Showing {doctors.length} of {total} doctors
        </div>

        <div className="space-y-4">
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-brand-white p-8 text-center text-brand-muted">
              No doctors found for this filter.
            </div>
          ) : (
            doctors.map((doctor) => (
              <AdminDoctorRow key={doctor.id} doctor={doctor} />
            ))
          )}
        </div>

        {pageCount > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
              const href = statusFilter
                ? `/portal/admin?status=${statusFilter}&page=${p}`
                : `/portal/admin?page=${p}`;
              return (
                <a
                  key={p}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    p === page
                      ? "bg-brand-teal text-white"
                      : "border border-brand-gray bg-brand-white text-brand-slate hover:bg-brand-gray"
                  }`}
                >
                  {p}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
