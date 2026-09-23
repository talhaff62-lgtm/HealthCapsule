import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";
import { getFixtureSource } from "@/api";

/**
 * Development-only fixture banner. Renders a visible, accessible bar at the
 * top of the screen when the API layer is serving fixture data instead of
 * live API responses. In production builds __DEV__ is false so this component
 * always returns null regardless of the fixture source flag.
 */
export function FixtureBanner() {
  const source = getFixtureSource();
  if (!__DEV__ || !source) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Development fixture data is active"
      style={styles.banner}
    >
      <Text style={styles.text}>
        ⚠ DEV FIXTURE — data is offline sample, not live
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning + "1A",
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + "40",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignItems: "center",
  },
  text: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
