import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    color: colors.label,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
});
