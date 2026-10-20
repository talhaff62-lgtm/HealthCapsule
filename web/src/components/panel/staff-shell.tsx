"use client";

"use client";

import { PanelShell } from "./panel-shell";

type StaffShellProps = {
  title: string;
  userName: string;
  children: React.ReactNode;
};

export function StaffShell({ title, userName, children }: StaffShellProps) {
  return (
    <PanelShell
      panelLabel="STAFF PANEL"
      homeHref="/staff"
      navLinks={[
        { href: "/staff", label: "Your work" },
        { href: "/staff/hospitals/new", label: "Add hospital" },
        { href: "/staff/doctors/new", label: "Add doctor" },
        { href: "/staff/directory", label: "Check entries" },
        { href: "/staff/my-submissions", label: "My submissions" },
      ]}
      title={title}
      userName={userName}
      contentClassName="max-w-3xl"
    >
      {children}
    </PanelShell>
  );
}
