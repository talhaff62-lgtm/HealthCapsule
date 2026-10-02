"use client";

"use client";

import { PanelShell } from "./panel-shell";

export function AdminShell({
  title,
  userName,
  children,
}: {
  title?: string;
  userName?: string;
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      panelLabel="ADMIN PANEL"
      homeHref="/admin"
      navLinks={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/review", label: "Review queue" },
        { href: "/admin/entries", label: "All entries" },
        { href: "/admin/staff", label: "Staff" },
      ]}
      title={title}
      userName={userName}
    >
      {children}
    </PanelShell>
  );
}
