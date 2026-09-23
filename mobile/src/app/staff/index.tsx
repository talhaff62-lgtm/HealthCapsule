import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { getMyDoctors, getMyFacilities } from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { StatusBadge, type PanelStatus } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

type MineFacility = {
  id: string;
  name: string;
  verificationStatus: PanelStatus;
  collectedAt?: string | null;
};

type MineDoctor = {
  id: string;
  name: string;
  verificationStatus: PanelStatus;
  collectedAt?: string | null;
};

type RecentItem = {
  id: string;
  kind: "facility" | "doctor";
  name: string;
  status: PanelStatus;
  collectedAt: string | null;
};

function toMs(v: string | null): number {
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

export default function StaffHubScreen() {
  const { user, token, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = (user?.name ?? "").split(" ")[0] || "Staff";

  const loadRecent = useCallback(async (): Promise<RecentItem[]> => {
    if (!token) return [];
    const [facilities, doctors] = await Promise.all([
      getMyFacilities<MineFacility[]>(token),
      getMyDoctors<MineDoctor[]>(token),
    ]);
    const items: RecentItem[] = [
      ...(Array.isArray(facilities) ? facilities : []).map((f) => ({
        id: f.id,
        kind: "facility" as const,
        name: f.name,
        status: f.verificationStatus,
        collectedAt: f.collectedAt ?? null,
      })),
      ...(Array.isArray(doctors) ? doctors : []).map((d) => ({
        id: d.id,
        kind: "doctor" as const,
        name: d.name,
        status: d.verificationStatus,
        collectedAt: d.collectedAt ?? null,
      })),
    ];
    items.sort((a, b) => toMs(b.collectedAt) - toMs(a.collectedAt));
    return items.slice(0, 3);
  }, [token]);

  const recent = useAsync<RecentItem[]>(loadRecent);

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
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.roleLine}>Staff field panel</Text>
      </View>

      <Pressable
        onPress={() => router.push("/staff/new-facility" as never)}
        accessibilityRole="button"
        accessibilityLabel="Add hospital or diagnostic centre"
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Text style={styles.cardTitle}>Add hospital / diagnostic centre</Text>
        <Text style={styles.cardHint}>Submit a new facility for review</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/staff/new-doctor" as never)}
        accessibilityRole="button"
        accessibilityLabel="Add a doctor"
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Text style={styles.cardTitle}>Add a doctor</Text>
        <Text style={styles.cardHint}>Submit a new doctor profile for review</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/staff/directory" as never)}
        accessibilityRole="button"
        accessibilityLabel="Check existing entries"
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Text style={styles.cardTitle}>Check existing entries</Text>
        <Text style={styles.cardHint}>Search the read-only directory before submitting</Text>
      </Pressable>

      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent submissions</Text>
        <Pressable
          onPress={() => router.push("/staff/submissions" as never)}
          accessibilityRole="button"
          accessibilityLabel="View all submissions"
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {recent.loading ? (
        <LoadingState />
      ) : recent.error ? (
        <ErrorState message={recent.error} onRetry={recent.reload} />
      ) : !recent.data || recent.data.length === 0 ? (
        <EmptyState title="No submissions yet" hint="New facilities and doctors you submit will appear here." />
      ) : (
        recent.data.map((item) => (
          <Pressable
            key={`${item.kind}-${item.id}`}
            onPress={() => router.push("/staff/submissions" as never)}
            accessibilityRole="button"
            accessibilityLabel={`Open submissions, ${item.name}`}
            style={({ pressed }) => [styles.recentRow, pressed && styles.cardPressed]}
          >
            <View style={styles.recentBody}>
              <Text style={styles.kindLabel}>{item.kind === "facility" ? "Facility" : "Doctor"}</Text>
              <Text style={styles.recentName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </Pressable>
        ))
      )}

      <Pressable
        onPress={() => {
          void signOut().then(() => router.replace("/(tabs)" as never));
        }}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={({ pressed }) => [styles.signOut, pressed && styles.cardPressed]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
  cardPressed: {
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
  recentRow: {
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
  recentBody: {
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
  recentName: {
    color: colors.label,
    fontSize: 15,
    fontWeight: "600",
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
