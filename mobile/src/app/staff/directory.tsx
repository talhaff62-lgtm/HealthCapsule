import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { searchDoctorDirectory, searchFacilityDirectory } from "@/api/panel";
import { useDebounce } from "@/hooks/use-debounce";
import { LabeledInput } from "@/components/panel-ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

type Tab = "facilities" | "doctors";

type FacilityHit = {
  id: string;
  name: string;
  type?: string | null;
  area?: { name: string } | null;
};

type DoctorHit = {
  id: string;
  name: string;
  degrees?: string | string[] | null;
  specialties?: { name: string }[] | null;
  chambers?: { facility?: { name: string } | null }[] | null;
};

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function degreesText(d: DoctorHit["degrees"]): string {
  if (!d) return "";
  return Array.isArray(d) ? d.join(", ") : d;
}

export default function DirectoryScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("facilities");
  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState<FacilityHit[]>([]);
  const [doctors, setDoctors] = useState<DoctorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 400);

  useEffect(() => {
    let active = true;
    async function search() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        if (tab === "facilities") {
          const res = await searchFacilityDirectory(token, debouncedQuery);
          if (active) setFacilities(toArray<FacilityHit>(res));
        } else {
          const res = await searchDoctorDirectory(token, debouncedQuery);
          if (active) setDoctors(toArray<DoctorHit>(res));
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        if (active) setLoading(false);
      }
    }
    search();
    return () => {
      active = false;
    };
  }, [token, tab, debouncedQuery]);

  const empty = tab === "facilities" ? facilities.length === 0 : doctors.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.segmented}>
        {(["facilities", "doctors"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityLabel={t === "facilities" ? "Facilities tab" : "Doctors tab"}
            accessibilityState={{ selected: tab === t }}
            style={[styles.segment, tab === t && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === "facilities" ? "Facilities" : "Doctors"}
            </Text>
          </Pressable>
        ))}
      </View>

      <LabeledInput
        label="Search"
        value={query}
        onChangeText={setQuery}
        placeholder={tab === "facilities" ? "Search facilities" : "Search doctors"}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : empty ? (
        <EmptyState
          title="No matches in the system — you can submit it as a new entry."
        />
      ) : tab === "facilities" ? (
        facilities.map((f) => (
          <View key={f.id} style={styles.card}>
            <Text style={styles.name} selectable>
              {f.name}
            </Text>
            <Text style={styles.meta}>
              {f.type ? `${f.type} ` : ""}
              {f.area?.name ? `· ${f.area.name}` : ""}
            </Text>
          </View>
        ))
      ) : (
        doctors.map((d) => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.name} selectable>
              {d.name}
            </Text>
            {degreesText(d.degrees) ? (
              <Text style={styles.meta} selectable>
                {degreesText(d.degrees)}
              </Text>
            ) : null}
            {d.specialties?.[0]?.name ? <Text style={styles.meta}>{d.specialties[0].name}</Text> : null}
            {d.chambers?.[0]?.facility?.name ? (
              <Text style={styles.meta}>{d.chambers[0].facility.name}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: minTouch,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  name: {
    fontFamily: fonts.display,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
});
