import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

export type PanelStatus = "PENDING" | "VERIFIED" | "REJECTED";

const LABEL: Record<PanelStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const TONE: Record<PanelStatus, { fg: string; bg: string }> = {
  PENDING: { fg: colors.warning, bg: colors.warningMuted },
  VERIFIED: { fg: colors.verified, bg: `${colors.verified}14` },
  REJECTED: { fg: colors.danger, bg: `${colors.danger}14` },
};

export function StatusBadge({ status }: { status: PanelStatus }) {
  const tone = TONE[status];
  return (
    <View
      accessibilityLabel={`${LABEL[status]} status`}
      style={[styles.badge, { backgroundColor: tone.bg }]}
    >
      <Text style={[styles.label, { color: tone.fg }]}>{LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
