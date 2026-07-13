import { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register — HealthCapsule",
  description: "Register as a verified doctor or healthcare provider in Chattogram.",
};

const VALID_TYPES = ["doctor", "facility"];

type RegisterPageProps = {
  searchParams?: { type?: string };
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/portal");
  }

  const defaultType =
    searchParams?.type && VALID_TYPES.includes(searchParams.type) ? searchParams.type : "doctor";

  const [specialties, areas] = await Promise.all([
    prisma.specialty.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.area.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="flex min-h-[calc(100vh-64px-80px)] items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-lg">
        <RegisterForm
          defaultType={defaultType as "doctor" | "facility"}
          specialties={specialties}
          areas={areas}
        />
      </div>
    </main>
  );
}
