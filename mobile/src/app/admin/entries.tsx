import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import {
  approveDoctor,
  approveFacility,
  deleteDoctor,
  deleteFacility,
  listAllDoctors,
  listAllFacilities,
  rejectDoctor,
  rejectFacility,
  unverifyDoctor,
  unverifyFacility,
} from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { useDebounce } from "@/hooks/use-debounce";
import { StatusBadge } from "@/components/status-badge";
import { Button, LabeledInput } from "@/components/panel-ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, minTouch, radius, spacing } from "@/theme";
import {
  areaName,
  collectedByName,
  facilityTypeLabel,
  formatDate,
  messageOf,
  RejectBlock,
  scalar,
  Segmented,
  VerifyButton,
  type PanelRecord,
} from "./admin-shared";

type StatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";
type Kind = "facility" | "doctor";

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function DeleteBlock({
  itemName,
  busy,
  onConfirm,
}: {
  itemName: string;
  busy: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${itemName}`}
        style={({ pressed }) => [styles.deleteOutline, pressed && styles.pressedStyle]}
      >
        <Text style={styles.deleteOutlineText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.deleteForm}>
      <Text style={styles.deleteWarning}>
        Permanently delete {itemName} and its linked data? This cannot be undone.
      </Text>
      <View style={styles.deleteRow}>
        <View style={styles.flex}>
          <Button
            title="Confirm delete"
            variant="danger"
            loading={busy}
            onPress={() => {
              void onConfirm()
                .then(() => setOpen(false))
                .catch(() => undefined);
            }}
          />
        </View>
        <View style={styles.flex}>
          <Button title="Cancel" variant="outline" disabled={busy} onPress={() => setOpen(false)} />
        </View>
      </View>
    </View>
  );
}

function EntryCard({
  record,
  kind,
  entryBusy,
  error,
  onVerify,
  onReject,
  onHide,
  onEdit,
  onDelete,
}: {
  record: PanelRecord;
  kind: Kind;
  entryBusy: boolean;
  error: string | null;
  onVerify: () => void;
  onReject: (reason: string) => Promise<void>;
  onHide: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const status = record.verificationStatus;
  const subtitle =
    kind === "facility"
      ? `${facilityTypeLabel(record.type)} · ${areaName(record) ?? "Unknown area"}`
      : (scalar(record.currentPosition) ?? "Doctor");
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.kindLabel}>{kind === "facility" ? "Facility" : "Doctor"}</Text>
        <Text style={styles.name}>{record.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {collectedByName(record)} · {formatDate(record.collectedAt)}
        </Text>
      </View>
      <StatusBadge status={status} />
      {status === "REJECTED" && record.rejectReason ? (
        <Text style={styles.rejectReason}>{record.rejectReason}</Text>
      ) : null}
      {error ? (
        <Text style={styles.apiError} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {status === "PENDING" ? (
        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <VerifyButton itemName={record.name} busy={entryBusy} onPress={onVerify} />
            <RejectBlock itemName={record.name} busy={entryBusy} onConfirm={onReject} />
          </View>
        </View>
      ) : null}
      {status === "VERIFIED" ? (
        <Button
          title="Hide from site"
          variant="outline"
          loading={entryBusy}
          onPress={onHide}
          accessibilityLabel={`Hide ${record.name} from site`}
        />
      ) : null}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${record.name}`}
          style={({ pressed }) => [styles.editOutline, pressed && styles.pressedStyle]}
        >
          <Text style={styles.editOutlineText}>Edit</Text>
        </Pressable>
        <DeleteBlock itemName={record.name} busy={entryBusy} onConfirm={onDelete} />
      </View>
    </View>
  );
}

export default function AllEntriesScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<Kind>("facility");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (): Promise<PanelRecord[]> => {
    if (!token) return [];
    const fetchStatus = status === "ALL" ? undefined : status;
    const raw =
      kind === "facility"
        ? await listAllFacilities<unknown>(token, fetchStatus)
        : await listAllDoctors<unknown>(token, fetchStatus);
    return asArray<PanelRecord>(raw);
  }, [token, kind, status]);

  const list = useAsync<PanelRecord[]>(load);

  const q = debouncedQuery.trim().toLowerCase();
  const filtered = (list.data ?? []).filter((r) =>
    q ? r.name.toLowerCase().includes(q) : true,
  );

  async function mutate(
    record: PanelRecord,
    fn: (tok: string) => Promise<PanelRecord>,
    ok: string,
  ): Promise<void> {
    const tok = token;
    if (!tok || busyKey) return;
    const key = `${kind}-${record.id}`;
    setBusyKey(key);
    setNotice(null);
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    try {
      const updated = await fn(tok);
      setNotice(`${ok}: ${updated?.name ?? record.name}`);
      list.reload();
    } catch (err) {
      const message = messageOf(err);
      setItemErrors((prev) => ({ ...prev, [key]: message }));
      throw new Error(message);
    } finally {
      setBusyKey(null);
    }
  }

  function verify(record: PanelRecord): void {
    void mutate(
      record,
      (t) =>
        kind === "facility"
          ? approveFacility<PanelRecord>(t, record.id)
          : approveDoctor<PanelRecord>(t, record.id),
      "Verified",
    ).catch(() => undefined);
  }

  function reject(record: PanelRecord, reason: string): Promise<void> {
    return mutate(
      record,
      (t) =>
        kind === "facility"
          ? rejectFacility<PanelRecord>(t, record.id, reason)
          : rejectDoctor<PanelRecord>(t, record.id, reason),
      "Rejected",
    );
  }

  function hide(record: PanelRecord): void {
    void mutate(
      record,
      (t) =>
        kind === "facility"
          ? unverifyFacility<PanelRecord>(t, record.id)
          : unverifyDoctor<PanelRecord>(t, record.id),
      "Hidden from site",
    ).catch(() => undefined);
  }

  function edit(record: PanelRecord): void {
    router.push(
      (kind === "facility"
        ? `/admin/edit-facility?id=${record.id}`
        : `/admin/edit-doctor?id=${record.id}`) as never,
    );
  }

  function remove(record: PanelRecord): Promise<void> {
    return mutate(
      record,
      (t) =>
        kind === "facility"
          ? deleteFacility<PanelRecord>(t, record.id)
          : deleteDoctor<PanelRecord>(t, record.id),
      "Deleted",
    );
  }

  const emptyTitle = q
    ? `No ${kind === "facility" ? "facilities" : "doctors"} match "${debouncedQuery.trim()}"`
    : `No ${status === "ALL" ? "" : `${status.toLowerCase()} `}${kind === "facility" ? "facilities" : "doctors"} found`;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <Segmented<Kind>
        label="Entry type"
        value={kind}
        onChange={(v) => setKind(v)}
        options={[
          { value: "facility", label: "Facilities" },
          { value: "doctor", label: "Doctors" },
        ]}
      />
      <Segmented<StatusFilter>
        label="Status"
        value={status}
        onChange={(v) => setStatus(v)}
        options={[
          { value: "ALL", label: "All" },
          { value: "PENDING", label: "Pending" },
          { value: "VERIFIED", label: "Verified" },
          { value: "REJECTED", label: "Rejected" },
        ]}
      />
      <LabeledInput
        label="Search by name"
        value={query}
        onChangeText={setQuery}
        placeholder={kind === "facility" ? "Search facilities" : "Search doctors"}
        autoCapitalize="none"
        accessibilityLabel="Search entries by name"
      />

      {notice ? (
        <Text style={styles.notice} accessibilityRole="text">
          {notice}
        </Text>
      ) : null}

      {list.loading ? (
        <LoadingState />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title={emptyTitle} hint="Try a different search or filter." />
      ) : (
        filtered.map((record) => {
          const key = `${kind}-${record.id}`;
          return (
            <EntryCard
              key={key}
              record={record}
              kind={kind}
              entryBusy={busyKey === key}
              error={itemErrors[key] ?? null}
              onVerify={() => verify(record)}
              onReject={(reason) => reject(record, reason)}
              onHide={() => hide(record)}
              onEdit={() => edit(record)}
              onDelete={() => remove(record)}
            />
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  notice: {
    backgroundColor: `${colors.verified}14`,
    color: colors.verified,
    fontSize: 14,
    fontWeight: "600",
    padding: spacing.md,
    borderRadius: radius.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardBody: {
    gap: 2,
  },
  kindLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    color: colors.label,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  rejectReason: {
    color: colors.danger,
    fontSize: 13,
  },
  apiError: {
    color: colors.danger,
    fontSize: 13,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    minHeight: minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  editOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    minHeight: minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  deleteOutlineText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteForm: {
    flex: 1,
    gap: spacing.sm,
  },
  deleteWarning: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  pressedStyle: {
    opacity: 0.7,
  },
});
