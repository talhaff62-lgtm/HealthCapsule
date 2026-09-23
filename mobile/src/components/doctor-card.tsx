import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { StatusBadge } from "@/components/verified-badge";
import { colors, fonts, radius, spacing } from "@/theme";
import type { DoctorSummary } from "@/types/dto";

type Props = {
  doctor: DoctorSummary;
  variant?: "list" | "compact";
};

export function DoctorCard({ doctor, variant = "list" }: Props) {
  const primarySpecialty = doctor.specialties[0]?.name ?? "General practice";
  const primaryArea = doctor.chambers[0]?.area?.name ?? doctor.chambers[0]?.facility?.name;
  const fee = wholeTaka(doctor.chambers[0]?.consultationFee ?? null);

  return (
    <Link href={`/doctors/${doctor.slug}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open profile for ${doctor.name}`}
        accessibilityHint="Opens doctor details"
        style={({ pressed }) => [
          styles.card,
          variant === "compact" && styles.compact,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {doctor.name.replace(/^Dr\.?\s+/i, "").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {doctor.degrees.length > 0
                ? [primarySpecialty, doctor.degrees.join(", ")].join(" · ")
                : primarySpecialty}
            </Text>
            {primaryArea ? (
              <View style={styles.metaRow}>
                <SymbolView
                  name={{ ios: "mappin.circle.fill", android: "place" }}
                  tintColor={colors.secondaryLabel}
                  size={12}
                />
                <Text style={styles.meta} numberOfLines={1}>
                  {primaryArea}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.badgeRow}>
          {doctor.flags.suggested ? <StatusBadge variant="suggested" /> : null}
          {doctor.flags.new ? <StatusBadge variant="new" /> : null}
          {doctor.flags.verified ? <StatusBadge variant="verified" /> : null}
          {fee ? (
            <Text style={styles.fee} selectable>৳{fee}</Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

function wholeTaka(value: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.endsWith(".00") ? trimmed.slice(0, -3) : trimmed;
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
  compact: {
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: fonts.display,
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 13,
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
    alignItems: "center",
  },
  fee: {
    marginLeft: "auto",
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
