import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ChamberForm from "@/components/doctor-portal/ChamberForm";
import DeleteChamberButton from "@/components/doctor-portal/DeleteChamberButton";
import { deleteChamber } from "./actions";

export const metadata: Metadata = {
  title: "Manage Chambers — HealthCapsule",
  description: "Update your chambers and weekly schedules.",
};

export default async function DoctorChambersPage() {
  const user = await requireRole(UserRole.DOCTOR).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
    include: {
      chambers: {
        where: { deletedAt: null },
        include: {
          area: { select: { id: true, name: true } },
          schedules: {
            where: { deletedAt: null },
            orderBy: { dayOfWeek: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  const areas = await prisma.area.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-dark">
              Chambers
            </span>
            <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
              Manage Chambers
            </h1>
            <p className="mt-1 text-brand-muted">
              Add, edit, or remove your practice locations and weekly schedules.
            </p>
          </div>
          <Link
            href="/portal/doctor"
            className="rounded-full border border-brand-navy px-4 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-navy hover:text-white"
          >
            Back to profile
          </Link>
        </div>

        <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-serif text-lg font-semibold text-brand-navy">Add a new chamber</h2>
          <ChamberForm doctorId={doctor.id} areas={areas} />
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="font-serif text-lg font-semibold text-brand-navy">Your chambers</h2>
          {doctor.chambers.length === 0 ? (
            <div className="rounded-2xl border border-brand-gray bg-white p-8 text-center text-brand-muted">
              No chambers yet. Use the form above to add one.
            </div>
          ) : (
            doctor.chambers.map((chamber) => (
              <div
                key={chamber.id}
                className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm"
              >
                <ChamberForm
                  doctorId={doctor.id}
                  areas={areas}
                  initial={{
                    id: chamber.id,
                    address: chamber.address,
                    areaId: chamber.area?.id ?? null,
                    consultationFee: chamber.consultationFee?.toString() ?? null,
                    schedules: chamber.schedules.map((s) => ({
                      dayOfWeek: s.dayOfWeek,
                      startTime: s.startTime,
                      endTime: s.endTime,
                    })),
                  }}
                />
                <DeleteChamberButton
                  doctorId={doctor.id}
                  chamberId={chamber.id}
                  action={async () => {
                    "use server";
                    await deleteChamber(doctor.id, chamber.id);
                  }}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {chamber.schedules.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-navy"
                    >
                      {days[s.dayOfWeek]} · {s.startTime}–{s.endTime}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
