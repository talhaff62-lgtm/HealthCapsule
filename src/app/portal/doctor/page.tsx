import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DoctorProfileForm from "@/components/doctor-portal/DoctorProfileForm";

export const metadata: Metadata = {
  title: "Doctor Portal — HealthCapsule",
  description: "Manage your HealthCapsule doctor profile.",
};

export default async function DoctorPortalPage() {
  const user = await requireRole(UserRole.DOCTOR).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
    include: {
      specialties: {
        include: {
          specialty: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
            Doctor Portal
          </h1>
          <p className="mt-1 text-brand-muted">
            Update your profile. Changes will reflect immediately on your public page.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
          <DoctorProfileForm
            doctor={{
              id: doctor.id,
              name: doctor.name,
              slug: doctor.slug,
              bio: doctor.bio,
              photoUrl: doctor.photoUrl,
              degrees: doctor.degrees,
              languages: doctor.languages,
              consultationFee: doctor.consultationFee?.toString() ?? null,
              bmdcRegNo: doctor.bmdcRegNo,
            }}
          />
        </div>

        {doctor.specialties.length > 0 && (
          <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-brand-navy">Specialties</h2>
            <p className="mt-2 text-brand-muted">
              {doctor.specialties.map((s) => s.specialty.name).join(", ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
