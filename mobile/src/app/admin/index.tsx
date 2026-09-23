import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import {
  listAllDoctors,
  listAllFacilities,
  listPendingDoctors,
  listPendingFacilities,
  listUsers,
} from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { StatusBadge, type PanelStatus } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";
import {
  areaName,
  collectedByName,
  facilityTypeLabel,
  toMs,
  type PanelRecord,
} from "./admin-shared";

type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type QueueItem = {
  key: string;
  kind: "facility" | "doctor";
  record: PanelRecord;
};

type DashboardData = {
  hospitalsOnSite: number;
  doctorsOnSite: number;
  pending: QueueItem[];
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export default function AdminDashboardScreen() {
  const { user, token, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = (user?.name ?? "").split(" ")[0] || "Admin";

  const load = useCallback(async (): Promise<DashboardData> => {
    if (!token) {
      return { hospitalsOnSite: 0, doctorsOnSite: 0, pending: [] };
    }
    const [verifiedFacilities, verifiedDoctors, pendingFacilities, pendingDoctors] =
      await Promise.all([
        listAllFacilities<unknown>(token, "VERIFIED"),
        listAllDoctors<unknown>(token, "VERIFIED"),
        listPendingFacilities<unknown>(token),
        listPendingDoctors<unknown>(token),
      ]);
    const pending: QueueItem[] = [
      ...asArray<PanelRecord>(pendingFacilities).map((r) => ({
        key: `facility-${r.id}`,
        kind: "facility" as const,
        record: r,
      })),
      ...asArray<PanelRecord>(pendingDoctors).map((r) => ({
        key: `doctor-${r.id}`,
        kind: "doctor" as const,
        record: r,
      })),
    ];
    pending.sort((a, b) => toMs(b.record.collectedAt) - toMs(a.record.collectedAt));
    return {
      hospitalsOnSite: asArray(verifiedFacilities).length,
      doctorsOnSite: asArray(verifiedDoctors).length,
      pending,
    };
  }, [token]);

  const stats = useAsync<DashboardData>(load);

  const loadStaffCount = useCallback(async (): Promise<number> => {
    if (!token) return 0;
    const users = await listUsers<unknown>(token);
    return asArray<PanelUser>(users).filter((u) => u.role === "STAFF").length;
  }, [token]);

  const staffCount = useAsync<number>(loadStaffCount);

  const pendingCount = stats.data?.pending.length ?? 0;
  const preview = (stats.data?.pending ?? []).slice(0, 5);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Admin console</Text>
        <Text style={styles.roleLine}>Hello, {firstName}</Text>
      </View>

      {stats.loading ? (
        <LoadingState />
      ) : stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard label="Hospitals on site" value={stats.data?.hospitalsOnSite ?? 0} />
            <StatCard label="Doctors on site" value={stats.data?.doctorsOnSite ?? 0} />
            <StatCard label="Pending review" value={pendingCount} />
            <StatCard
              label="Active staff"
              value={staffCount.loading ? "…" : (staffCount.data ?? 0)}
            />
          </View>
          {staffCount.error ? (
            <Text style={styles.staffError}>
              Staff count unavailable: {staffCount.error}
            </Text>
          ) : null}

          <NavCard
            title="Review queue"
            hint={pendingCount === 0 ? "Nothing waiting" : `${pendingCount} waiting for review`}
            label="Open review queue"
            onPress={() => router.push("/admin/review" as never)}
          />
          <NavCard
            title="All entries"
            hint="Browse and manage every facility and doctor"
            label="Open all entries"
            onPress={() => router.push("/admin/entries" as never)}
          />
          <NavCard
            title="Staff management"
            hint="Accounts, submissions, and new staff"
            label="Open staff management"
            onPress={() => router.push("/admin/staff" as never)}
          />

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Pending review</Text>
            {pendingCount > 0 ? (
              <Pressable
                onPress={() => router.push("/admin/review" as never)}
                accessibilityRole="button"
                accessibilityLabel="View full review queue"
                style={styles.viewAll}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </Pressable>
            ) : null}
          </View>

          {preview.length === 0 ? (
            <EmptyState
              title="Queue is clear"
              hint="New staff submissions will appear here."
              actionLabel="Review anyway"
              onAction={() => router.push("/admin/review" as never)}
            />
          ) : (
            preview.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => router.push("/admin/review" as never)}
                accessibilityRole="button"
                accessibilityLabel={`Review ${item.record.name}`}
                style={({ pressed }) => [styles.previewRow, pressed && styles.pressed]}
              >
                <View style={styles.previewBody}>
                  <Text style={styles.kindLabel}>
                    {item.kind === "facility"
                      ? facilityTypeLabel(item.record.type)
                      : "Doctor"}
                  </Text>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {item.record.name}
                  </Text>
                  <Text style={styles.previewMeta} numberOfLines={1}>
                    {item.kind === "facility"
                      ? (areaName(item.record) ?? "Unknown area")
                      : (String(item.record.currentPosition ?? "") || "Doctor")}
                    {" · "}
                    {collectedByName(item.record)}
                  </Text>
                </View>
                <StatusBadge status={(item.record.verificationStatus ?? "PENDING") as PanelStatus} />
              </Pressable>
            ))
          )}
        </>
      )}

      <Pressable
        onPress={() => {
          void signOut().then(() => router.replace("/(tabs)" as never));
        }}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavCard({
  title,
  hint,
  label,
  onPress,
}: {
  title: string;
  hint: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardHint}>{hint}</Text>
    </Pressable>
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
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: radius.lg,
    gap: 2,
  },
  greeting: {
    color: "#FFFFFF",
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "700",
  },
  roleLine: {
    color: "#FFFFFFCC",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  stat: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
    minHeight: minTouch,
    justifyContent: "center",
  },
  statValue: {
    fontFamily: fonts.display,
    color: colors.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  staffError: {
    color: colors.danger,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
    minHeight: minTouch,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  cardTitle: {
    fontFamily: fonts.display,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  cardHint: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  recentTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: "700",
  },
  viewAll: {
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  previewRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: minTouch,
  },
  previewBody: {
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
  previewName: {
    color: colors.label,
    fontSize: 15,
    fontWeight: "600",
  },
  previewMeta: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  signOut: {
    alignItems: "center",
    paddingVertical: spacing.md,
    minHeight: minTouch,
    justifyContent: "center",
  },
  signOutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "600",
  },
});
