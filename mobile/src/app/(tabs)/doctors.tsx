import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Search } from "lucide-react-native";
import { DoctorCard } from "@/components/doctor-card";
import { AppHeader } from "@/components/app-header";
import { useTabBarInset } from "@/components/floating-tab-bar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/skeleton";
import { useAsync } from "@/hooks/use-data";
import { getFilters, listDoctors } from "@/api";
import { colors, radius, spacing } from "@/theme";
import type { DoctorSummary, FilterOption } from "@/types/dto";

export default function DoctorsScreen() {
  const tabBarInset = useTabBarInset();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const loadFilters = useCallback(() => getFilters(), []);
  const filters = useAsync(loadFilters);
  const params = useMemo(
    () => ({ q: query.trim() || undefined, specialty: specialty ?? undefined, area: area ?? undefined }),
    [query, specialty, area],
  );
  const loadDoctors = useCallback(() => listDoctors(params), [params]);
  const doctors = useAsync(loadDoctors);

  const onRefresh = useCallback(() => {
    doctors.reload();
    filters.reload();
  }, [doctors, filters]);

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Doctors</Text>
        <Text style={styles.subtitle}>
          Verification status reviewed by HealthCapsule before listing
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.secondaryLabel} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name or degree"
            placeholderTextColor={colors.secondaryLabel}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search doctors by name or degree"
          />
        </View>
      </View>

      <FilterChips
        label="Specialty"
        options={filters.data?.specialties ?? []}
        value={specialty}
        onChange={setSpecialty}
        hint="Filter doctors by specialty"
      />
      <FilterChips
        label="Area"
        options={filters.data?.areas ?? []}
        value={area}
        onChange={setArea}
        hint="Filter doctors by area"
      />

      {doctors.loading ? (
        <LoadingState />
      ) : doctors.error ? (
        <ErrorState message={doctors.error} onRetry={onRefresh} />
      ) : (
        <FlatList<DoctorSummary>
          data={doctors.data?.results ?? []}
          keyExtractor={(d) => d.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarInset }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews
          ListEmptyComponent={
            <EmptyState
              title="No doctors match that search yet"
              hint="Try a different name or specialty."
            />
          }
          renderItem={({ item }) => <DoctorCard doctor={item} />}
        />
      )}
    </View>
  );
}

function FilterChips({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  hint?: string;
}) {
  if (options.length === 0) return null;
  return (
    <View style={styles.chipsRow}>
      <Text style={styles.chipsLabel}>{label}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={options}
        keyExtractor={(o) => o.value}
        contentContainerStyle={styles.chipsContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
        renderItem={({ item }) => {
          const selected = value === item.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              accessibilityHint={
                hint ?? (selected ? "Double tap to clear filter" : `Filter by ${label.toLowerCase()}`)
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
    </View>
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
    gap: spacing.xs,
  },
  chipsLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
    paddingTop: spacing.xs,
  },
});
