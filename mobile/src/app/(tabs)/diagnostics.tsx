import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { FacilityCard } from "@/components/facility-card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/skeleton";
import { useAsync } from "@/hooks/use-data";
import { getFilters, listFacilities } from "@/api";
import { colors, radius, spacing } from "@/theme";
import type { FacilitySummary, FilterOption } from "@/types/dto";

export default function DiagnosticsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string | null>(null);

  const loadFilters = useCallback(() => getFilters(), []);
  const filters = useAsync(loadFilters);
  const params = useMemo(
    () => ({ q: query.trim() || undefined, area: area ?? undefined }),
    [query, area],
  );
  const loadFacilities = useCallback(() => listFacilities(params), [params]);
  const facilities = useAsync(loadFacilities);

  const onRefresh = useCallback(() => {
    facilities.reload();
    filters.reload();
  }, [facilities, filters]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostics</Text>
        <Text style={styles.subtitle}>Diagnostic centres across Chattogram</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search" }}
            tintColor={colors.secondaryLabel}
            size={18}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Centre name"
            placeholderTextColor={colors.secondaryLabel}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search diagnostic centres by name"
          />
        </View>
      </View>

      <FilterChips
        options={filters.data?.areas ?? []}
        value={area}
        onChange={setArea}
        hint="Filter diagnostic centres by area"
      />

      {facilities.loading ? (
        <LoadingState />
      ) : facilities.error ? (
        <ErrorState message={facilities.error} onRetry={onRefresh} />
      ) : (
        <FlatList<FacilitySummary>
          data={facilities.data?.results ?? []}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews
          ListEmptyComponent={
            <EmptyState
              title="No centres match that search yet"
              hint="Try a different name or area."
            />
          }
          renderItem={({ item }) => <FacilityCard facility={item} />}
        />
      )}
    </View>
  );
}

function FilterChips({
  options,
  value,
  onChange,
  hint,
}: {
  options: FilterOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  hint?: string;
}) {
  if (options.length === 0) return null;
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={options}
      keyExtractor={(o) => o.value}
      contentContainerStyle={styles.chipsContent}
      ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
      style={styles.chipsRow}
      renderItem={({ item }) => {
        const selected = value === item.value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            accessibilityHint={
              hint ?? (selected ? "Double tap to clear filter" : "Filter diagnostic centres")
            }
            onPress={() => onChange(selected ? null : item.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  title: {
    color: colors.label,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.label,
    fontSize: 15,
    paddingVertical: 0,
  },
  chipsRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  chipsContent: {
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xs,
  },
});
