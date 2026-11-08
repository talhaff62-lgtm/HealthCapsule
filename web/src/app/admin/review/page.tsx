"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { StatusBadge } from "@/components/status-badge";
import { useLanguage } from "@/components/language-provider";
import { api } from "@/lib/client-fetch";
import {
  Card,
  Eyebrow,
  Button,
  TextAreaField,
} from "@/components/panel/ui";

type FacilityItem = {
  id: string;
  name: string;
  type: "HOSPITAL" | "DIAGNOSTIC_CENTER";
  address: string;
  area?: { id: string; name: string };
  amenities: Array<{ amenity: { id: string; name: string } }>;
  discountInfo?: string;
  description?: string | null;
  listingTier?: string;
  featuredUntil?: string | null;
  verificationStatus: string;
  collectedById?: string;
  collectedBy?: { id: string; name: string };
  collectedAt: string;
};

type DoctorItem = {
  id: string;
  name: string;
  specialties: Array<{ specialty: { id: string; name: string } }>;
  degrees: string[];
  currentPosition?: string;
  achievements?: string;
  bio?: string | null;
  consultationFee?: string | number | null;
  listingTier?: string;
  featuredUntil?: string | null;
  chambers?: Array<{ facility?: { id: string; name: string } }>;
  verificationStatus: string;
  collectedById?: string;
  collectedBy?: { id: string; name: string };
  collectedAt: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Entry =
  | (FacilityItem & { kind: "FACILITY" })
  | (DoctorItem & { kind: "DOCTOR" });

export default function AdminReviewPage() {
  const { t } = useLanguage();
  const { me, loading: meLoading } = useMe();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Filters
  const [staffFilter, setStaffFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Selected entry for slide-over panel
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Reject modal
  const [rejectingEntry, setRejectingEntry] = useState<Entry | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirm modal
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    if (!me) return;
    if (me.role !== "ADMIN") {
      router.replace("/staff");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const [facilities, doctors, userList] = await Promise.all([
          api<FacilityItem[]>("/api/v1/facilities?verificationStatus=PENDING"),
          api<DoctorItem[]>("/api/v1/doctors?verificationStatus=PENDING"),
          api<UserItem[]>("/api/v1/users"),
        ]);

        if (!alive) return;

        setUsers(userList);

        const merged: Entry[] = [
          ...facilities.map((f) => ({ ...f, kind: "FACILITY" as const })),
          ...doctors.map((d) => ({ ...d, kind: "DOCTOR" as const })),
        ];

        merged.sort(
          (a, b) =>
            new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
        );
        setEntries(merged);
        setLoading(false);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : t("admin.review.errorLoadFailed")
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
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

  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const filteredEntries = entries.filter((item) => {
    const collectorId = item.collectedBy?.id || item.collectedById;
    if (staffFilter && collectorId !== staffFilter) return false;

    if (typeFilter) {
      if (
        typeFilter === "HOSPITAL" &&
        (item.kind !== "FACILITY" || item.type !== "HOSPITAL")
      )
        return false;
      if (
        typeFilter === "DIAGNOSTIC_CENTER" &&
        (item.kind !== "FACILITY" || item.type !== "DIAGNOSTIC_CENTER")
      )
        return false;
      if (typeFilter === "DOCTOR" && item.kind !== "DOCTOR") return false;
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      const itemTime = new Date(item.collectedAt).getTime();
      if (itemTime < fromTime) return false;
    }

    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
      const itemTime = new Date(item.collectedAt).getTime();
      if (itemTime > toTime) return false;
    }

    return true;
  });

  const handleVerify = async (entry: Entry) => {
    setActionLoading(true);
    try {
      const endpoint =
        entry.kind === "FACILITY"
          ? `/api/v1/facilities/${entry.id}/approve`
          : `/api/v1/doctors/${entry.id}/approve`;
      await api(endpoint, { method: "PATCH" });

      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry(null);
      }
      showToast(t("admin.review.toastVerified"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.review.errorVerificationFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingEntry) return;
    if (!rejectReason.trim()) {
      setRejectError(t("admin.review.errorReasonRequired"));
      return;
    }

    setActionLoading(true);
    setRejectError("");
    try {
      const endpoint =
        rejectingEntry.kind === "FACILITY"
          ? `/api/v1/facilities/${rejectingEntry.id}/reject`
          : `/api/v1/doctors/${rejectingEntry.id}/reject`;
      await api(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ rejectReason: rejectReason.trim() }),
      });

      setEntries((prev) => prev.filter((e) => e.id !== rejectingEntry.id));
      if (selectedEntry?.id === rejectingEntry.id) {
        setSelectedEntry(null);
      }
      setRejectingEntry(null);
      setRejectReason("");
      showToast(t("admin.review.toastRejected"));
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : t("admin.review.errorRejectFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;
    setActionLoading(true);
    try {
      const endpoint =
        deletingEntry.kind === "FACILITY"
          ? `/api/v1/facilities/${deletingEntry.id}`
          : `/api/v1/doctors/${deletingEntry.id}`;
      await api(endpoint, { method: "DELETE" });

      setEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
      if (selectedEntry?.id === deletingEntry.id) {
        setSelectedEntry(null);
      }
      setDeletingEntry(null);
      showToast(t("admin.review.toastDeleted"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.ui.deleteFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell>
      <Eyebrow className="mb-1 block">{t("admin.review.eyebrow")}</Eyebrow>
      <h1 className="font-serif text-3xl font-semibold text-brand-navy mb-6">
        {t("admin.review.headingPendingEntries")}
      </h1>

      {/* Toolbar filters */}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-gray bg-white p-4">
        <div>
          <label
            htmlFor="staff-filter"
            className="mb-1 block text-xs font-semibold text-brand-muted"
          >
            {t("admin.review.filterStaffMemberLabel")}
          </label>
          <select
            id="staff-filter"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="h-10 rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          >
            <option value="">{t("admin.review.filterStaffMemberAll")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="type-filter"
            className="mb-1 block text-xs font-semibold text-brand-muted"
          >
            {t("admin.review.filterTypeLabel")}
          </label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          >
            <option value="">{t("admin.review.filterTypeAll")}</option>
            <option value="HOSPITAL">{t("admin.review.filterTypeHospital")}</option>
            <option value="DIAGNOSTIC_CENTER">{t("admin.review.filterTypeDiagnosticCenter")}</option>
            <option value="DOCTOR">{t("admin.review.filterTypeDoctor")}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="date-from"
            className="mb-1 block text-xs font-semibold text-brand-muted"
          >
            {t("admin.review.filterFromDateLabel")}
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          />
        </div>

        <div>
          <label
            htmlFor="date-to"
            className="mb-1 block text-xs font-semibold text-brand-muted"
          >
            {t("admin.review.filterToDateLabel")}
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          />
        </div>

        {(staffFilter || typeFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setStaffFilter("");
              setTypeFilter("");
              setDateFrom("");
              setDateTo("");
            }}
            className="mt-auto h-10 px-2 text-xs font-semibold text-brand-sky-deep hover:underline"
          >
            {t("admin.review.filterReset")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-status-emergency mb-3">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            {t("common.ui.retry")}
          </Button>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-brand-muted">
            {t("admin.review.emptyNoPendingEntries")}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-gray bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-brand-mist font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">{t("admin.review.tableHeaderName")}</th>
                <th className="px-4 py-3 text-left">{t("admin.review.tableHeaderType")}</th>
                <th className="px-4 py-3 text-left">{t("admin.review.tableHeaderSubmittedBy")}</th>
                <th className="px-4 py-3 text-left">{t("admin.review.tableHeaderDate")}</th>
                <th className="px-4 py-3 text-left">{t("admin.review.tableHeaderActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const collectorName =
                  entry.collectedBy?.name ||
                  userMap.get(entry.collectedById || "") ||
                  t("admin.review.fallbackUnknown");
                return (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="cursor-pointer border-t border-brand-gray/70 transition-colors hover:bg-brand-sky-bg-soft"
                  >
                    <td className="px-4 py-3.5 font-semibold text-brand-navy">
                      {entry.name}
                    </td>
                    <td className="px-4 py-3.5 text-brand-slate">
                      {entry.kind === "DOCTOR"
                        ? t("admin.review.panelTypeDoctor")
                        : entry.type === "DIAGNOSTIC_CENTER"
                        ? t("admin.review.panelTypeDiagnosticCenter")
                        : t("admin.review.panelTypeHospital")}
                    </td>
                    <td className="px-4 py-3.5 text-brand-slate">
                      {collectorName}
                    </td>
                    <td className="px-4 py-3.5 text-brand-muted tabular-nums">
                      {new Date(entry.collectedAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          router.push(
                            entry.kind === "FACILITY"
                              ? `/admin/facilities/${entry.id}/edit`
                              : `/admin/doctors/${entry.id}/edit`
                          )
                        }
                        className="text-xs font-semibold text-brand-sky-deep hover:underline"
                      >
                        {t("admin.review.buttonEdit")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Detail Panel */}
      {selectedEntry && (
        <>
          <div
            className="fixed inset-0 z-30 bg-brand-navy/40 backdrop-blur-[2px]"
            onClick={() => setSelectedEntry(null)}
          />
          <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[480px] flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-gray/70 bg-white pb-4">
              <div>
                <Eyebrow className="block mb-1">{t("admin.review.panelEyebrowFullEntry")}</Eyebrow>
                <h2 className="font-serif text-xl font-semibold text-brand-navy">
                  {selectedEntry.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedEntry.verificationStatus} />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setSelectedEntry(null)}
                  aria-label={t("admin.review.panelCloseAriaLabel")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="my-6 space-y-4 text-sm flex-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                  {t("admin.review.panelLabelType")}
                </span>
                <span className="text-sm text-brand-slate font-medium">
                  {selectedEntry.kind === "DOCTOR"
                    ? t("admin.review.panelTypeDoctor")
                    : selectedEntry.type === "DIAGNOSTIC_CENTER"
                    ? t("admin.review.panelTypeDiagnosticCenter")
                    : t("admin.review.panelTypeHospital")}
                </span>
              </div>

              {selectedEntry.kind === "FACILITY" ? (
                <>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                      {t("admin.review.panelLabelAddress")}
                    </span>
                    <span className="text-sm text-brand-slate">{selectedEntry.address}</span>
                  </div>
                  {selectedEntry.area && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelArea")}
                      </span>
                      <span className="text-sm text-brand-slate">{selectedEntry.area.name}</span>
                    </div>
                  )}
                  {selectedEntry.amenities && selectedEntry.amenities.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelAmenities")}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedEntry.amenities.map(({ amenity }) => (
                          <span
                            key={amenity.id}
                            className="rounded-full bg-brand-sky-bg px-3 py-1 text-xs font-semibold text-brand-sky-deep"
                          >
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEntry.discountInfo && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelDiscountOffer")}
                      </span>
                      <span className="text-sm text-brand-slate">
                        {selectedEntry.discountInfo}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                      {t("admin.review.panelLabelSpecialties")}
                    </span>
                    <span className="text-sm text-brand-slate">
                      {selectedEntry.specialties
                        .map((s) => s.specialty.name)
                        .join(", ") || t("admin.review.fallbackNA")}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                      {t("admin.review.panelLabelDegrees")}
                    </span>
                    <span className="text-sm text-brand-slate">
                      {selectedEntry.degrees.join(", ")}
                    </span>
                  </div>
                  {selectedEntry.currentPosition && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelCurrentPosition")}
                      </span>
                      <span className="text-sm text-brand-slate">
                        {selectedEntry.currentPosition}
                      </span>
                    </div>
                  )}
                  {selectedEntry.achievements && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelAchievements")}
                      </span>
                      <span className="text-sm text-brand-slate">
                        {selectedEntry.achievements}
                      </span>
                    </div>
                  )}
                  {selectedEntry.chambers && selectedEntry.chambers[0]?.facility && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                        {t("admin.review.panelLabelLinkedFacility")}
                      </span>
                      <span className="text-sm text-brand-slate">
                        {selectedEntry.chambers[0].facility.name}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                  {t("admin.review.panelLabelSubmittedBy")}
                </span>
                <span className="text-sm text-brand-slate">
                  {selectedEntry.collectedBy?.name ||
                    userMap.get(selectedEntry.collectedById || "") ||
                    t("admin.review.fallbackUnknown")}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted block mb-1">
                  {t("admin.review.panelLabelSubmittedDate")}
                </span>
                <span className="text-sm text-brand-slate tabular-nums">
                  {new Date(selectedEntry.collectedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 border-t border-brand-gray/60 bg-white/95 px-6 py-4 backdrop-blur space-y-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => handleVerify(selectedEntry)}
                loading={actionLoading}
              >
                {t("admin.review.buttonVerifyEntry")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() =>
                  router.push(
                    selectedEntry.kind === "FACILITY"
                      ? `/admin/facilities/${selectedEntry.id}/edit`
                      : `/admin/doctors/${selectedEntry.id}/edit`
                  )
                }
              >
                {t("admin.review.buttonEditEntry")}
              </Button>
              <Button
                variant="outlineDanger"
                size="lg"
                fullWidth
                onClick={() => {
                  setRejectingEntry(selectedEntry);
                  setRejectReason("");
                  setRejectError("");
                }}
                disabled={actionLoading}
              >
                {t("admin.review.buttonRejectEntry")}
              </Button>
              <Button
                variant="outlineDanger"
                size="lg"
                fullWidth
                onClick={() => setDeletingEntry(selectedEntry)}
                disabled={actionLoading}
              >
                {t("admin.review.buttonDeleteEntry")}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectingEntry && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-brand-navy/40 backdrop-blur-[2px]">
          <Card className="w-full max-w-md p-6">
            <h3 className="font-serif text-xl font-semibold text-brand-navy">
              {t("admin.review.modalRejectTitle")}
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              {t("admin.review.modalRejectDescription")}
            </p>
            <div className="mt-4">
              <TextAreaField
                id="reject-reason"
                label={t("admin.review.modalRejectReasonLabel")}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                error={rejectError}
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setRejectingEntry(null)}
                disabled={actionLoading}
              >
                {t("common.ui.cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleRejectConfirm}
                loading={actionLoading}
                disabled={!rejectReason.trim()}
              >
                {t("admin.review.modalRejectConfirm")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-brand-navy/40 backdrop-blur-[2px]">
          <Card className="w-full max-w-md p-6">
            <h3 className="font-serif text-xl font-semibold text-brand-navy">
              {t("admin.review.modalDeleteTitle")}
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              {t("admin.review.modalDeleteDescription", { name: deletingEntry.name })}
            </p>
            <div className="flex gap-3 justify-end mt-5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeletingEntry(null)}
                disabled={actionLoading}
              >
                {t("common.ui.cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
                loading={actionLoading}
              >
                {t("admin.review.modalDeleteConfirm")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-brand-sky-bright" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminShell>
  );
}
