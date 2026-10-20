"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-fetch";

type Me = { id: string; name: string; role: string; email: string };

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api<Me>("/api/v1/auth/me");
        if (alive) {
          setMe(data);
          setLoading(false);
        }
      } catch (e) {
        if (alive) {
          const msg = e instanceof Error ? e.message : "Auth check failed";
          if (msg.includes("401") || msg.includes("Unauthorized")) {
            router.replace("/login");
          } else {
            setError(msg);
            setLoading(false);
          }
        }
      }
    })();
    return () => { alive = false; };
  }, [router]);

  return { me, loading, error };
}
