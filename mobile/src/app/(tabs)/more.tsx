import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/lib/auth-context";
import { openExternalUri } from "@/utils/open-uri";
import { colors, radius, spacing } from "@/theme";

const REGISTER_URL = "https://www.healthcapsule.app/register";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { status, user, signOut } = useAuth();
  const signedIn = status === "signedIn" && user;
  const panelRole = user?.role === "STAFF" || user?.role === "ADMIN";
  const open = (url: string, label: string) =>
    openExternalUri(url, { label, help: `Couldn't open ${label}. Please try again.` });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl },
      ]}
    >
      <Text style={styles.title}>More</Text>

      <Section label="Account">
        <Row
          icon={{ ios: "person.crop.circle.badge.plus", android: "person_add" }}
          title="Register as a provider"
          subtitle="Doctors and diagnostic centres can apply on the web portal"
          onPress={() => open(REGISTER_URL, "Registration page")}
          accessibilityLabel="Register as a provider"
          accessibilityHint="Opens the web portal registration page"
        />
        <Row
          icon={{ ios: "key.fill", android: "vpn_key" }}
          title="Sign in"
          subtitle="Staff and admin panel access"
          onPress={() => router.push("/auth/sign-in" as never)}
          accessibilityLabel="Sign in to staff panel"
          accessibilityHint="Opens the in-app staff and admin sign-in screen"
        />
        {signedIn && panelRole ? (
          <Row
            icon={{ ios: "briefcase.fill", android: "work" }}
            title={user?.role === "ADMIN" ? "Open admin panel" : "Open staff panel"}
            subtitle={`Signed in as ${user?.name ?? user?.email ?? "staff"}`}
            onPress={() => router.push((user?.role === "ADMIN" ? "/admin" : "/staff") as never)}
            accessibilityLabel={user?.role === "ADMIN" ? "Open admin panel" : "Open staff panel"}
            accessibilityHint={
              user?.role === "ADMIN" ? "Opens the in-app admin panel" : "Opens the in-app staff panel"
            }
          />
        ) : null}
        {signedIn ? (
          <Row
            icon={{ ios: "rectangle.portrait.and.arrow.right", android: "logout" }}
            title="Sign out"
            subtitle={user?.email ?? "Signed in"}
            onPress={() => {
              void signOut();
            }}
            accessibilityLabel="Sign out"
            accessibilityHint="Signs out of the current account"
          />
        ) : null}
      </Section>

      <Section label="Preferences">
        <Row
          icon={{ ios: "globe", android: "language" }}
          title="Language"
          subtitle="English (Bangla coming soon)"
          onPress={() => {}}
          accessibilityHint="Language preference isn't adjustable yet"
        />
        <Row
          icon={{ ios: "bell.badge", android: "notifications" }}
          title="Notifications"
          subtitle="Availability and update preferences (coming soon)"
          onPress={() => {}}
          accessibilityHint="Notification preferences aren't available yet"
        />
      </Section>

      <Section label="About verification">
        <View style={styles.info}>
          <Text style={styles.infoBody}>
            Every listed doctor&apos;s verification status is reviewed by
            HealthCapsule before they appear in search results. Listed phone
            numbers and WhatsApp lines belong to the doctor&apos;s chamber or
            facility, not their personal account.
          </Text>
        </View>
      </Section>

      <Text style={styles.footer}>v1.0.0 · Patient preview</Text>
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  icon: { ios: string; android: string };
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>
        <SymbolView name={icon as never} tintColor={colors.primary} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <SymbolView
        name={{ ios: "arrow.up.right.square", android: "open_in_new" }}
        tintColor={colors.tertiaryLabel}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    color: colors.label,
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: spacing.xs,
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    color: colors.label,
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    color: colors.secondaryLabel,
    fontSize: 12,
  },
  info: {
    padding: spacing.md,
  },
  infoBody: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
