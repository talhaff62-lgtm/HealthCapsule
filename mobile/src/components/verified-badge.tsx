import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

type Variant = "verified" | "suggested" | "new";

const LABEL: Record<Variant, string> = {
  verified: "Verified",
  suggested: "Suggested",
  new: "New",
};

const ICON = {
  verified: { ios: "checkmark.seal.fill", android: "verified_user" },
  suggested: { ios: "star.fill", android: "star" },
  new: { ios: "sparkles", android: "auto_awesome" },
} as const;

const TONE: Record<Variant, { fg: string; bg: string }> = {
  verified: { fg: colors.verified, bg: `${colors.verified}14` },
  suggested: { fg: colors.suggested, bg: colors.suggestedMuted },
  new: { fg: colors.primary, bg: colors.primaryMuted },
};

export function StatusBadge({ variant }: { variant: Variant }) {
  const tone = TONE[variant];
  return (
    <View
      accessibilityLabel={`${LABEL[variant]} status`}
      style={[styles.badge, { backgroundColor: tone.bg }]}
    >
      <SymbolView name={ICON[variant]} tintColor={tone.fg} size={12} weight="semibold" />
      <Text style={[styles.label, { color: tone.fg }]}>{LABEL[variant]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
