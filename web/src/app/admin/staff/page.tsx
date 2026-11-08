"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { useLanguage } from "@/components/language-provider";
import { api } from "@/lib/client-fetch";
import {
  Card,
  Eyebrow,
  TextField,
  Button,
} from "@/components/panel/ui";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
  submissionCount?: number;
  approvedCount?: number;
};

export default function AdminStaffPage() {
  const { t } = useLanguage();
  const { me, loading: meLoading } = useMe();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!me) return;
    if (me.role !== "ADMIN") {
      router.replace("/staff");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const data = await api<UserItem[]>("/api/v1/users");
        if (alive) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : t("admin.staff.errorLoadUsersFailed"));
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [me, router, reloadKey]);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">{t("common.ui.loading")}</div>
      </div>
    );
  }

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">{t("common.ui.notAuthorized")}</div>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess(false);

    if (password.length < 8) {
      setCreateError(t("admin.staff.errorPasswordMin8"));
      return;
    }

    setCreateSubmitting(true);
    try {
      await api("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      setCreateSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("admin.staff.errorCreateFailed");
      if (msg.includes("409") || msg.includes("already exists")) {
        setCreateError(t("admin.staff.errorEmailExists"));
      } else {
        setCreateError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    setDeleteError("");
    try {
      await api(`/api/v1/users/${u.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((row) => row.id !== u.id));
      setDeletingId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("common.ui.deleteFailed"));
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  return (
    <AdminShell>
      <Eyebrow className="mb-1 block">{t("admin.staff.eyebrow")}</Eyebrow>
      <h1 className="font-serif text-3xl font-semibold text-brand-navy mb-6">
        {t("admin.staff.headingPeopleCollectingData")}
      </h1>

      {/* Create staff account card */}
      <Card className="p-6 mb-8">
        <h2 className="font-serif text-xl font-semibold text-brand-navy mb-4">
          {t("admin.staff.cardTitleCreateAccount")}
        </h2>

        {createSuccess && (
          <div className="rounded-xl border border-status-verified bg-status-verified-light p-3 text-sm font-medium text-status-verified mb-4">
            {t("admin.staff.successAccountCreated")}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="user-name"
              label={t("admin.staff.labelName")}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              id="user-email"
              label={t("admin.staff.labelEmail")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="user-password"
              label={t("admin.staff.labelPassword")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              hint={t("admin.staff.hintPasswordMin8")}
            />

            <label htmlFor="user-role" className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-slate">
                {t("admin.staff.labelRole")}
              </span>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "STAFF" | "ADMIN")}
                className="h-12 w-full rounded-xl border border-brand-gray bg-white px-4 text-base text-brand-slate transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
              >
                <option value="STAFF">{t("admin.staff.optionRoleStaff")}</option>
                <option value="ADMIN">{t("admin.staff.optionRoleAdmin")}</option>
              </select>
            </label>
          </div>

          {createError && (
            <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
              {createError}
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={createSubmitting}
            >
              {t("admin.staff.buttonCreateAccount")}
            </Button>
          </div>
        </form>
      </Card>

      {/* Staff table */}
      <div className="overflow-x-auto rounded-2xl border border-brand-gray bg-white">
        <div className="p-4 border-b border-brand-gray/70">
          <h2 className="font-serif text-lg font-semibold text-brand-navy">
            {t("admin.staff.tableSectionAllUsers")}
          </h2>
        </div>

        {deleteError && (
          <div className="p-4 border-b border-brand-gray/70">
            <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
              {deleteError}
            </div>
          </div>
        )}
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-brand-mist rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-status-emergency mb-3">{error}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              {t("common.ui.retry")}
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-sm text-brand-muted">
            {t("admin.staff.emptyNoUsers")}
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-brand-mist font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderName")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderEmail")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderRole")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderSubmissions")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderApproved")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderJoined")}</th>
                <th className="px-4 py-3 text-left">{t("admin.staff.tableHeaderActions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-brand-gray/70 transition-colors hover:bg-brand-sky-bg-soft">
                  <td className="px-4 py-3.5 font-semibold text-brand-navy">{u.name}</td>
                  <td className="px-4 py-3.5 text-brand-slate">{u.email}</td>
                  <td className="px-4 py-3.5">
                    {u.role === "ADMIN" ? (
                      <span className="inline-flex items-center rounded-full bg-brand-navy-light px-2.5 py-0.5 text-xs font-semibold text-white">
                        {t("admin.staff.badgeAdmin")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-brand-sky-bg px-2.5 py-0.5 text-xs font-semibold text-brand-sky-deep">
                        {t("admin.staff.badgeStaff")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-brand-slate tabular-nums font-semibold">
                    {u.submissionCount ?? 0}
                  </td>
                  <td className="px-4 py-3.5 text-brand-slate tabular-nums font-semibold">
                    {u.approvedCount ?? 0}
                  </td>
                  <td className="px-4 py-3.5 text-brand-muted tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    {u.id === me.id ? (
                      <span className="text-xs text-brand-muted">{t("admin.staff.labelYou")}</span>
                    ) : deletingId === u.id ? (
                      <span className="inline-flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(u)}
                        >
                          {t("common.ui.confirm")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingId(null);
                            setDeleteError("");
                          }}
                        >
                          {t("common.ui.cancel")}
                        </Button>
                      </span>
                    ) : (
                      <Button
                        variant="outlineDanger"
                        size="sm"
                        onClick={() => {
                          setDeletingId(u.id);
                          setDeleteError("");
                        }}
                      >
                        {t("admin.staff.buttonDelete")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
