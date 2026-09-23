import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, radius, spacing } from "@/theme";

export function Skeleton({ width, height }: { width?: number | string; height?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.skeleton,
        { width: (width as never) ?? "100%", height: height ?? 16 },
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View
      accessibilityRole="none"
      accessibilityLabel="Loading content"
      style={styles.card}
    >
      <View style={styles.row}>
        <Skeleton width={44} height={44} />
        <View style={styles.body}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
          <Skeleton width="30%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={title}
      style={styles.empty}
    >
      <SymbolView
        name={{ ios: "tray", android: "inbox" }}
        tintColor={colors.tertiaryLabel}
        size={32}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${message}`}
      style={styles.empty}
    >
      <SymbolView
        name={{ ios: "exclamationmark.triangle.fill", android: "error" }}
        tintColor={colors.danger}
        size={28}
      />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyHint} selectable>
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingState() {
  return (
    <View accessibilityRole="progressbar" style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyHint: {
    color: colors.secondaryLabel,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
