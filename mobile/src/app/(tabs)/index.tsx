import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Search, ShieldCheck } from "lucide-react-native";
import { Link } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTabBarInset } from "@/components/floating-tab-bar";
import { AppHeader } from "@/components/app-header";
import { DoctorCard } from "@/components/doctor-card";
import { FacilityCard } from "@/components/facility-card";
import { Section } from "@/components/section";
import { EmptyState, ErrorState, SkeletonCard } from "@/components/skeleton";
import { useAsync } from "@/hooks/use-data";
import { getHome, listFacilities } from "@/api";
import { colors, fonts, radius, spacing } from "@/theme";

export default function HomeScreen() {
  const tabBarInset = useTabBarInset();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const loadHome = useCallback(() => getHome(), []);
  const home = useAsync(loadHome);
  const loadFacilities = useCallback(() => listFacilities({}), []);
  const facilities = useAsync(loadFacilities);

  const suggested = useMemo(
    () => (home.data?.suggestedDoctors ?? []).slice(0, 4),
    [home.data],
  );
  const newDocs = useMemo(
    () => (home.data?.newlyAvailableDoctors ?? []).slice(0, 4),
    [home.data],
  );
  const suggestedFacilities = useMemo(
    () => (home.data?.suggestedFacilities ?? []).slice(0, 4),
    [home.data],
  );
  const nearbyFacilities = useMemo(
    () => (home.data?.nearbyFacilities ?? facilities.data?.results ?? []).slice(0, 4),
    [home.data, facilities.data],
  );
  // Show suggested when available; otherwise fall back to nearby with a
  // different heading. Never label a general fallback "Suggested".
  const facilitySection = suggestedFacilities.length > 0
    ? { title: "Suggested Diagnostic Centres", subtitle: "Featured and premium verified centres", items: suggestedFacilities }
    : { title: "Nearby Diagnostic Centres", subtitle: "Verified centres for tests and imaging", items: nearbyFacilities };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.container,
          { paddingTop: spacing.md, paddingBottom: tabBarInset },
        ]}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{home.data?.context.city ?? "Chattogram"}</Text>
        <Text style={styles.title}>Chattogram, verified care.</Text>
        <Text style={styles.subtitle}>
          {home.data?.context.note ||
            "Search doctors and diagnostic centres serving your area."}
        </Text>
        <Link href="/doctors" asChild accessibilityRole="link">
          <Pressable
            accessibilityLabel="Open doctor search"
            accessibilityHint="Opens the doctor search screen"
            style={({ pressed }) => [
              styles.searchBox,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Search size={18} color={colors.secondaryLabel} strokeWidth={2} />
            <Text style={styles.searchPlaceholder}>Search doctors, specialties…</Text>
          </Pressable>
        </Link>
      </View>

      {home.loading ? (
        <View style={styles.loadingGroup}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : home.error ? (
        <ErrorState message={home.error} onRetry={home.reload} />
      ) : (
        <View style={{ gap: spacing.xl }}>
          <Section
            title={facilitySection.title}
            subtitle={facilitySection.subtitle}
          >
            {facilitySection.items.length === 0 ? (
              <EmptyState
                title="No diagnostic centres yet"
                hint="Check back soon as more diagnostic centres join."
              />
            ) : (
              <View style={[styles.grid, isWide && styles.gridWide]}>
                {facilitySection.items.map((f) => (
                  <View key={f.id} style={[styles.gridItem, isWide && styles.gridItemWide]}>
                    <FacilityCard facility={f} />
                  </View>
                ))}
              </View>
            )}
          </Section>

          <Section
            title="Suggested Doctors"
            subtitle="Practitioners whose verification status is reviewed by HealthCapsule"
          >
            {suggested.length === 0 ? (
              <EmptyState
                title="No suggested doctors yet"
                hint="Try browsing all doctors instead."
              />
            ) : (
              <View style={styles.stack}>
                {suggested.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </View>
            )}
          </Section>

          <Section
            title="Newly Available Doctors"
            subtitle="Recently added to the registry"
          >
            {newDocs.length === 0 ? (
              <EmptyState
                title="No new doctors yet"
                hint="Check back soon as more doctors join the registry."
              />
            ) : (
              <View style={styles.stack}>
                {newDocs.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </View>
            )}
          </Section>

          <TrustExplainer />
        </View>
      )}
      </ScrollView>
    </View>
  );
}

function TrustExplainer() {
  return (
    <View accessibilityRole="summary" style={styles.trust}>
      <View style={styles.trustHeader}>
        <ShieldCheck size={18} color={colors.verified} strokeWidth={2} />
        <Text style={styles.trustTitle}>Why HealthCapsule is trusted</Text>
      </View>
      <Text style={styles.trustBody}>
        Every listed doctor&apos;s verification status is reviewed by HealthCapsule
        before they appear here. We never expose account data; only public
        contact details for chambers and diagnostic centres.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  subtitle: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 15,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  searchPlaceholder: {
    color: colors.secondaryLabel,
    fontSize: 15,
  },
  grid: {
    gap: spacing.md,
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "100%",
  },
  gridItemWide: {
    width: "48%",
  },
  stack: {
    gap: spacing.sm,
  },
  loadingGroup: {
    gap: spacing.md,
  },
  trust: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  trustTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "700",
  },
  trustBody: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
});
