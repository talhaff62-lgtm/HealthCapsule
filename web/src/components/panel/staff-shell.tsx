"use client";

import { PanelShell } from "./panel-shell";
import { useLanguage } from "@/components/language-provider";

type StaffShellProps = {
  title: string;
  userName: string;
  children: React.ReactNode;
};

export function StaffShell({ title, userName, children }: StaffShellProps) {
  const { t } = useLanguage();

  return (
    <PanelShell
      panelLabel={t("shell.staff.panelLabel")}
      homeHref="/staff"
      navLinks={[
        { href: "/staff", labelKey: "shell.staff.nav.yourWork" },
        { href: "/staff/hospitals/new", labelKey: "shell.staff.nav.addHospital" },
        { href: "/staff/doctors/new", labelKey: "shell.staff.nav.addDoctor" },
        { href: "/staff/directory", labelKey: "shell.staff.nav.checkEntries" },
        { href: "/staff/my-submissions", labelKey: "shell.staff.nav.mySubmissions" },
      ]}
      title={title}
      userName={userName}
      contentClassName="max-w-3xl"
    >
      {children}
    </PanelShell>
  );
}
