import { Link } from "expo-router";
import { BriefcaseMedical, MapPin } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "@/components/verified-badge";
import { colors, radius, spacing } from "@/theme";
import { facilityTypeLabel } from "@/utils/labels";
import type { FacilitySummary } from "@/types/dto";

export function FacilityCard({ facility }: { facility: FacilitySummary }) {
  return (
    <Link href={`/facilities/${facility.slug}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${facility.name}`}
        accessibilityHint="Opens diagnostic centre details"
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <BriefcaseMedical size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.body}>
            <Text style={styles.typeLabel}>{facilityTypeLabel(facility.type)}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {facility.name}
            </Text>
            {facility.area ? (
              <View style={styles.metaRow}>
                <MapPin size={12} color={colors.secondaryLabel} strokeWidth={2} />
                <Text style={styles.meta} numberOfLines={1}>
                  {facility.area.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.badgeRow}>
          {facility.flags.suggested ? <StatusBadge variant="suggested" /> : null}
          {facility.flags.new ? <StatusBadge variant="new" /> : null}
          {facility.flags.verified ? <StatusBadge variant="verified" /> : null}
          {facility.hasEmergency ? (
            <View style={[styles.badge, { backgroundColor: colors.danger + "14" }]}>
              <Text style={[styles.badgeText, { color: colors.danger }]}>24/7</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontSize: 15,
    fontWeight: "600",
  },
  typeLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  meta: {
    color: colors.secondaryLabel,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
