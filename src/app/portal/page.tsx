"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      router.replace("/portal/admin");
    } else {
      router.replace("/portal/doctor");
    }
  }, [session, status, router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <p className="text-brand-muted">Redirecting to your portal...</p>
    </main>
  );
}
