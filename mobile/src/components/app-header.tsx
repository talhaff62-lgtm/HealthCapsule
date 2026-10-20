import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

const MARK = require("../../assets/images/splash-icon.png");

// Brand bar shown at the top of every tab screen: logo + wordmark on the left,
// account entry point on the right. Sits above the scroll content, so it never
// needs to fade or hide.
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { status, user } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <View style={styles.markWrap}>
            <Image
              source={MARK}
              style={styles.mark}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          <Text maxFontSizeMultiplier={1.4} style={styles.wordmark}>
            Capsule
          </Text>
        </View>

        {status === "signedIn" && user ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Account, signed in as ${user.name}`}
            accessibilityHint="Opens the More tab"
            onPress={() => router.push("/(tabs)/more" as never)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Text style={styles.chipInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={styles.chipName}>
              {user.name.split(" ")[0]}
            </Text>
          </Pressable>
        ) : status === "signedOut" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityHint="Opens the sign-in screen"
            onPress={() => router.push("/auth/sign-in" as never)}
            style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}
          >
            <Text style={styles.signInLabel}>Sign in</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.canvas,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  markWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: {
    width: 24,
    height: 24,
  },
  wordmark: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  signIn: {
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  signInLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: minTouch,
    paddingLeft: 5,
    paddingRight: spacing.md + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipInitial: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    color: colors.accent,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
  },
  chipName: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 110,
  },
  pressed: {
    opacity: 0.75,
  },
});
