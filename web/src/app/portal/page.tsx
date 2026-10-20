"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PortalRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (session.user.role === "ADMIN") {
      router.replace("/admin");
    } else if (session.user.role === "FACILITY_ADMIN") {
      router.replace("/portal/facility");
    } else if (session.user.role === "STAFF") {
      router.replace("/staff");
    } else {
      router.replace("/portal/doctor");
    }
  }, [session, status, router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-brand-cream px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-gray bg-white px-8 py-6 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-brand-sky" />
        <p className="text-brand-slate">Redirecting to your portal...</p>
      </div>
    </main>
  );
}
