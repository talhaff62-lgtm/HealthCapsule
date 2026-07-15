import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRole, VerificationStatus } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminDoctorRow from "@/components/admin-portal/AdminDoctorRow";
import AdminFacilityRow from "@/components/admin-portal/AdminFacilityRow";

export const metadata: Metadata = {
  title: "Admin Portal — HealthCapsule",
  description: "Review and manage doctor and facility verification status.",
};

const validStatuses: VerificationStatus[] = ["PENDING", "VERIFIED", "REJECTED"];
const validTypes = ["doctor", "facility"] as const;
type AdminType = (typeof validTypes)[number];

export default async function AdminPortalPage({
  searchParams,
}: {
  searchParams?: { status?: string; page?: string; type?: string };
}) {
  const user = await requireRole(UserRole.ADMIN).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const type: AdminType =
    searchParams?.type && validTypes.includes(searchParams.type as AdminType)
      ? (searchParams.type as AdminType)
      : "doctor";

  const statusFilter =
    searchParams?.status && validStatuses.includes(searchParams.status as VerificationStatus)
      ? (searchParams.status as VerificationStatus)
      : undefined;

  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSize = 20;

  const where = statusFilter ? { verificationStatus: statusFilter } : {};

  const statusTabs: { label: string; value?: VerificationStatus }[] = [
    { label: "All" },
    { label: "Pending", value: "PENDING" },
    { label: "Verified", value: "VERIFIED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const typeTabs: { label: string; value: AdminType }[] = [
    { label: "Doctors", value: "doctor" },
    { label: "Facilities", value: "facility" },
  ];

  function buildHref(params: { type?: AdminType; status?: VerificationStatus; page?: number }) {
    const search = new URLSearchParams();
    if (params.type) search.set("type", params.type);
    if (params.status) search.set("status", params.status);
    if (params.page && params.page > 1) search.set("page", String(params.page));
    const query = search.toString();
    return `/portal/admin${query ? `?${query}` : ""}`;
  }

  const isDoctorView = type === "doctor";

  let content: React.ReactNode;
  let pageCount = 0;
  let total = 0;
  let countLabel = "";

  if (isDoctorView) {
    const [doctors, doctorTotal] = await Promise.all([
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

    total = doctorTotal;
    pageCount = Math.ceil(total / pageSize);
    countLabel = `Showing ${doctors.length} of ${total} doctors`;

    content =
      doctors.length === 0 ? (
        <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
          No doctors found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <AdminDoctorRow key={doctor.id} doctor={doctor} />
          ))}
        </div>
      );
  } else {
    const [facilities, facilityTotal] = await Promise.all([
      prisma.facility.findMany({
        where,
        include: {
          area: { select: { name: true, slug: true } },
          admin: { select: { phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.facility.count({ where }),
    ]);

    total = facilityTotal;
    pageCount = Math.ceil(total / pageSize);
    countLabel = `Showing ${facilities.length} of ${total} facilities`;

    content =
      facilities.length === 0 ? (
        <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
          No facilities found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {facilities.map((facility) => (
            <AdminFacilityRow key={facility.id} facility={facility} />
          ))}
        </div>
      );
  }

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-dark">
            Admin Dashboard
          </span>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
            Admin Portal
          </h1>
          <p className="mt-1 text-brand-muted">
            Review registrations, update verification status, and manage listing tiers for doctors
            and facilities.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {typeTabs.map((tab) => {
            const active = type === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildHref({ type: tab.value, status: statusFilter })}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-navy text-white"
                    : "border border-brand-gray bg-white text-brand-slate hover:bg-brand-cream"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const active =
              (!statusFilter && !tab.value) || statusFilter === tab.value;
            return (
              <Link
                key={tab.label}
                href={buildHref({ type, status: tab.value })}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-sky text-white"
                    : "border border-brand-gray bg-white text-brand-slate hover:bg-brand-cream"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="mb-4 text-sm text-brand-muted">{countLabel}</div>

        {content}

        {pageCount > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
              const active = p === page;
              return (
                <Link
                  key={p}
                  href={buildHref({ type, status: statusFilter, page: p })}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-brand-navy text-white"
                      : "border border-brand-gray bg-white text-brand-slate hover:bg-brand-cream"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
