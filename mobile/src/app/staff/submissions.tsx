import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { getMyDoctors, getMyFacilities } from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { StatusBadge, type PanelStatus } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

type MineRecord = {
  id: string;
  name: string;
  verificationStatus: PanelStatus;
  rejectReason?: string | null;
  collectedAt?: string | null;
  [key: string]: unknown;
};

type Submission = {
  id: string;
  kind: "facility" | "doctor";
  name: string;
  status: PanelStatus;
  collectedAt: string | null;
  record: MineRecord;
};

function toMs(v: string | null): number {
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

function formatDate(v: string | null): string {
  if (!v) return "Unknown date";
  const t = Date.parse(v);
  if (Number.isNaN(t)) return "Unknown date";
  return new Date(t).toLocaleDateString();
}

function scalar(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  return null;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function SubmissionsScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (): Promise<Submission[]> => {
    if (!token) return [];
    const [facilities, doctors] = await Promise.all([
      getMyFacilities<MineRecord[]>(token),
      getMyDoctors<MineRecord[]>(token),
    ]);
    const items: Submission[] = [
      ...(Array.isArray(facilities) ? facilities : []).map((f) => ({
        id: f.id,
        kind: "facility" as const,
        name: f.name,
        status: f.verificationStatus,
        collectedAt: f.collectedAt ?? null,
        record: f,
      })),
      ...(Array.isArray(doctors) ? doctors : []).map((d) => ({
        id: d.id,
        kind: "doctor" as const,
        name: d.name,
        status: d.verificationStatus,
        collectedAt: d.collectedAt ?? null,
        record: d,
      })),
    ];
    items.sort((a, b) => toMs(b.collectedAt) - toMs(a.collectedAt));
    return items;
  }, [token]);

  const { data, loading, error, reload } = useAsync<Submission[]>(load);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          hint="Facilities and doctors you submit will appear here with their review status."
        />
      ) : (
        data.map((item) => {
          const key = `${item.kind}-${item.id}`;
          const open = expanded === key;
          const r = item.record;
          return (
            <Pressable
              key={key}
              onPress={() => setExpanded(open ? null : key)}
              accessibilityRole="button"
              accessibilityLabel={`${item.kind === "facility" ? "Facility" : "Doctor"} ${item.name}`}
              accessibilityState={{ expanded: open }}
              style={styles.card}
            >
              <Text style={styles.kindLabel}>{item.kind === "facility" ? "Hospital" : "Doctor"}</Text>
              <Text style={styles.name} selectable>
                {item.name}
              </Text>
              <StatusBadge status={item.status} />
              <Text style={styles.date}>{formatDate(item.collectedAt)}</Text>
              {open ? (
                <View style={styles.detail}>
                  {scalar(r.type) ? <Field label="Type" value={scalar(r.type)!} /> : null}
                  {scalar(r.address) ? <Field label="Address" value={scalar(r.address)!} /> : null}
                  {scalar(r.area && typeof r.area === "object" ? (r.area as { name?: string }).name : null) ? (
                    <Field
                      label="Area"
                      value={scalar((r.area as { name?: string }).name)!}
                    />
                  ) : null}
                  {scalar(r.degrees) || Array.isArray(r.degrees) ? (
                    <Field
                      label="Degrees"
                      value={Array.isArray(r.degrees) ? (r.degrees as unknown[]).map(String).join(", ") : scalar(r.degrees)!}
                    />
                  ) : null}
                  {scalar(r.currentPosition) ? <Field label="Position" value={scalar(r.currentPosition)!} /> : null}
                  {scalar(r.achievements) ? <Field label="Achievements" value={scalar(r.achievements)!} /> : null}
                  {scalar(r.discountInfo) ? <Field label="Discount" value={scalar(r.discountInfo)!} /> : null}
                  {item.status === "REJECTED" && scalar(r.rejectReason) ? (
                    <View style={styles.rejectBox}>
                      <Text style={styles.rejectTitle}>Rejected</Text>
                      <Text style={styles.rejectText} selectable>
                        {scalar(r.rejectReason)!}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    minHeight: minTouch,
  },
  kindLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: fonts.display,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  date: {
    color: colors.secondaryLabel,
    fontSize: 12,
  },
  detail: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: colors.label,
    fontSize: 14,
  },
  rejectBox: {
    backgroundColor: `${colors.danger}14`,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rejectTitle: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  rejectText: {
    color: colors.label,
    fontSize: 13,
  },
});
