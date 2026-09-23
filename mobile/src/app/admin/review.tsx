import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import {
  approveDoctor,
  approveFacility,
  listPendingDoctors,
  listPendingFacilities,
  rejectDoctor,
  rejectFacility,
} from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, minTouch, radius, spacing } from "@/theme";
import {
  areaName,
  collectedByName,
  facilityTypeLabel,
  Field,
  formatDate,
  joinNames,
  messageOf,
  RejectBlock,
  scalar,
  toMs,
  VerifyButton,
  type PanelRecord,
} from "./admin-shared";

type QueueItem = {
  key: string;
  kind: "facility" | "doctor";
  record: PanelRecord;
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export default function ReviewQueueScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<QueueItem[]> => {
    if (!token) return [];
    const [facilities, doctors] = await Promise.all([
      listPendingFacilities<unknown>(token),
      listPendingDoctors<unknown>(token),
    ]);
    const merged: QueueItem[] = [
      ...asArray<PanelRecord>(facilities).map((r) => ({
        key: `facility-${r.id}`,
        kind: "facility" as const,
        record: r,
      })),
      ...asArray<PanelRecord>(doctors).map((r) => ({
        key: `doctor-${r.id}`,
        kind: "doctor" as const,
        record: r,
      })),
    ];
    merged.sort((a, b) => toMs(b.record.collectedAt) - toMs(a.record.collectedAt));
    return merged;
  }, [token]);

  const queue = useAsync<QueueItem[]>(load);
  const visible = items ?? queue.data;

  async function runAction(
    item: QueueItem,
    fn: (tok: string) => Promise<unknown>,
    ok: string,
  ): Promise<void> {
    const tok = token;
    if (!tok || busyKey) return;
    setBusyKey(item.key);
    setNotice(null);
    setActionError(null);
    const previous = visible;
    setItems((previous ?? []).filter((i) => i.key !== item.key));
    try {
      await fn(tok);
      setNotice(`${ok}: ${item.record.name}`);
      if (expanded === item.key) setExpanded(null);
    } catch (err) {
      setItems(previous);
      const message = messageOf(err);
      setActionError(message);
      throw new Error(message);
    } finally {
      setBusyKey(null);
    }
  }

  function verify(item: QueueItem): void {
    void (item.kind === "facility"
      ? runAction(item, (t) => approveFacility(t, item.record.id), "Verified")
      : runAction(item, (t) => approveDoctor(t, item.record.id), "Verified")
    ).catch(() => undefined);
  }

  function reject(item: QueueItem, reason: string): Promise<void> {
    if (item.kind === "facility") {
      return runAction(item, (t) => rejectFacility(t, item.record.id, reason), "Rejected");
    }
    return runAction(item, (t) => rejectDoctor(t, item.record.id, reason), "Rejected");
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      {notice ? (
        <Text style={styles.notice} accessibilityRole="text">
          {notice}
        </Text>
      ) : null}
      {actionError ? (
        <Text style={styles.apiError} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}

      {queue.loading && !visible ? (
        <LoadingState />
      ) : queue.error && !visible ? (
        <ErrorState message={queue.error} onRetry={queue.reload} />
      ) : !visible || visible.length === 0 ? (
        <EmptyState
          title="Queue is clear. Nothing waiting for review."
          hint="New staff submissions will appear here."
          actionLabel="Reload"
          onAction={queue.reload}
        />
      ) : (
        visible.map((item) => {
          const open = expanded === item.key;
          const typeLabel =
            item.kind === "facility" ? facilityTypeLabel(item.record.type) : "Doctor";
          return (
            <View key={item.key} style={styles.card}>
              <Pressable
                onPress={() => setExpanded(open ? null : item.key)}
                accessibilityRole="button"
                accessibilityLabel={`${open ? "Collapse" : "Expand"} ${item.record.name}`}
                style={styles.cardHead}
              >
                <View style={styles.cardBody}>
                  <Text style={styles.kindLabel}>{typeLabel}</Text>
                  <Text style={styles.name}>{item.record.name}</Text>
                  <Text style={styles.meta}>
                    {collectedByName(item.record)} · {formatDate(item.record.collectedAt)}
                  </Text>
                </View>
                <StatusBadge status="PENDING" />
              </Pressable>

              {open ? (
                <View style={styles.detail}>
                  <SubmittedDetail record={item.record} kind={item.kind} />
                  <View style={styles.actions}>
                    <VerifyButton
                      itemName={item.record.name}
                      busy={busyKey === item.key}
                      onPress={() => verify(item)}
                    />
                    <RejectBlock
                      itemName={item.record.name}
                      busy={busyKey === item.key}
                      onConfirm={(reason) => reject(item, reason)}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function SubmittedDetail({ record, kind }: { record: PanelRecord; kind: "facility" | "doctor" }) {
  if (kind === "doctor") {
    const chamber =
      Array.isArray(record.chambers) && record.chambers.length > 0
        ? (record.chambers[0] as Record<string, unknown>)
        : null;
    const chamberFacility = chamber ? chamber.facility : null;
    const chamberName =
      chamberFacility && typeof chamberFacility === "object"
        ? scalar((chamberFacility as Record<string, unknown>).name)
        : scalar(chamber?.facilityName);
    return (
      <View>
        <Field label="Degrees" value={joinNames(record.degrees) ?? "Not provided"} />
        <Field label="Current position" value={scalar(record.currentPosition) ?? "Not provided"} />
        <Field label="Specialty" value={joinNames(record.specialties) ?? "Not provided"} />
        <Field label="Achievements" value={scalar(record.achievements) ?? "Not provided"} />
        <Field label="Chamber" value={chamberName ?? "Not provided"} />
        <Field
          label="Collected by"
          value={`${collectedByName(record)} · ${formatDate(record.collectedAt)}`}
        />
      </View>
    );
  }
  return (
    <View>
      <Field label="Type" value={facilityTypeLabel(record.type)} />
      <Field label="Address" value={scalar(record.address) ?? "Not provided"} />
      <Field label="Area" value={areaName(record) ?? "Not provided"} />
      <Field label="Amenities" value={joinNames(record.amenities) ?? "None listed"} />
      <Field label="Discount info" value={scalar(record.discountInfo) ?? "Not provided"} />
      <Field
        label="Collected by"
        value={`${collectedByName(record)} · ${formatDate(record.collectedAt)}`}
      />
    </View>
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
  apiError: {
    color: colors.danger,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: minTouch,
  },
  cardBody: {
    flex: 1,
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
  detail: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
