import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ChamberForm from "@/components/doctor-portal/ChamberForm";
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
    <section className="min-h-screen bg-brand-gray py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-brand-slate sm:text-3xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Manage Chambers
            </h1>
            <p className="mt-1 text-brand-muted">
              Add, edit, or remove your practice locations and weekly schedules.
            </p>
          </div>
          <a
            href="/portal/doctor"
            className="rounded-full border border-brand-teal px-4 py-2 text-sm font-medium text-brand-teal hover:bg-brand-gray"
          >
            Back to profile
          </a>
        </div>

        <div className="rounded-2xl border border-brand-gray bg-brand-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-brand-slate">Add a new chamber</h2>
          <ChamberForm doctorId={doctor.id} areas={areas} />
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold text-brand-slate">Your chambers</h2>
          {doctor.chambers.length === 0 ? (
            <p className="text-brand-muted">No chambers yet. Use the form above to add one.</p>
          ) : (
            doctor.chambers.map((chamber) => (
              <div
                key={chamber.id}
                className="rounded-2xl border border-brand-gray bg-brand-white p-6 shadow-sm"
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
                <form
                  action={async () => {
                    "use server";
                    await deleteChamber(doctor.id, chamber.id);
                  }}
                  className="mt-4 flex justify-end border-t border-brand-gray pt-4"
                >
                  <button
                    type="submit"
                    className="text-sm font-medium text-status-emergency hover:underline"
                  >
                    Delete chamber
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chamber.schedules.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-brand-gray px-3 py-1 text-xs text-brand-slate"
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
