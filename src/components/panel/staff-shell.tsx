"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client-fetch";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Card, Eyebrow, Button } from "./ui";

type StaffShellProps = {
  title: string;
  userName: string;
  children: React.ReactNode;
};

export function StaffShell({ title, userName, children }: StaffShellProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
      router.replace("/staff/login");
    } catch {
      setSigningOut(false);
    }
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <div className="min-h-screen bg-brand-cloud">
      <div className="mx-auto w-full max-w-md px-4 pt-5 pb-10">
        <Card className="mb-5 p-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <Eyebrow>STAFF PANEL</Eyebrow>
              <h1 className="mt-0.5 font-serif text-xl font-semibold text-brand-navy">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-navy text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <span className="hidden text-sm font-semibold text-brand-slate sm:inline">
                  {userName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={handleSignOut}
                loading={signingOut}
                aria-label="Sign out"
                title="Sign out"
              >
                {!signingOut && <LogOut className="h-4 w-4" />}
              </Button>
            </div>
          </header>
        </Card>
        {children}
      </div>
    </div>
  );
}
