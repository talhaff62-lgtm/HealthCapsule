"use client";

import { PanelShell } from "./panel-shell";
import { useLanguage } from "@/components/language-provider";

export function AdminShell({
  title,
  userName,
  children,
}: {
  title?: string;
  userName?: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <PanelShell
      panelLabel={t("shell.admin.panelLabel")}
      homeHref="/admin"
      navLinks={[
        { href: "/admin", labelKey: "shell.admin.nav.dashboard" },
        { href: "/admin/review", labelKey: "shell.admin.nav.reviewQueue" },
        { href: "/admin/entries", labelKey: "shell.admin.nav.allEntries" },
        { href: "/admin/blog", labelKey: "shell.admin.nav.blog" },
        { href: "/admin/videos", labelKey: "shell.admin.nav.videos" },
        { href: "/admin/staff", labelKey: "shell.admin.nav.staff" },
      ]}
      title={title}
      userName={userName}
    >
      {children}
    </PanelShell>
  );
}
