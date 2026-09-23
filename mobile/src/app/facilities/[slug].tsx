import { useLocalSearchParams, Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import { SymbolView } from "expo-symbols";
import { StatusBadge } from "@/components/verified-badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/skeleton";
import { useAsync } from "@/hooks/use-data";
import { getFacility } from "@/api";
import { telUriFor, whatsappUriFor } from "@/utils/phone";
import { openExternalUri } from "@/utils/open-uri";
import { colors, fonts, radius, spacing } from "@/theme";
import { facilityTypeLabel } from "@/utils/labels";

export default function FacilityDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const loadFacility = useCallback(() => getFacility(slug), [slug]);
  const { data, loading, error, errorCode, reload } = useAsync(loadFacility);
  const notFound = errorCode === "NOT_FOUND";

  return (
    <>
      <Stack.Screen options={{ title: data?.name ?? "Diagnostic centre" }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        {loading ? (
          <LoadingState />
        ) : notFound ? (
          <EmptyState title="Centre not found" hint="This diagnostic centre is unavailable." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <EmptyState title="Centre not found" />
        ) : (
          <View style={{ gap: spacing.lg }}>
            <View style={styles.header}>
              <View style={styles.logo}>
                <SymbolView
                  name={{ ios: "cross.case.fill", android: "medical_services" }}
                  tintColor={colors.primary}
                  size={26}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.typeLabel}>{facilityTypeLabel(data.type)}</Text>
                <Text style={styles.name} selectable>
                  {data.name}
                </Text>
                {data.area ? (
                  <Text style={styles.meta}>{data.area.name}</Text>
                ) : null}
                <View style={styles.badgeRow}>
                  {data.flags.suggested ? <StatusBadge variant="suggested" /> : null}
                  {data.flags.new ? <StatusBadge variant="new" /> : null}
                  {data.flags.verified ? <StatusBadge variant="verified" /> : null}
                  {data.hasEmergency ? (
                    <View style={[styles.pill, { backgroundColor: colors.danger + "14" }]}>
                      <Text style={[styles.pillText, { color: colors.danger }]}>24/7 Emergency</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {data.description ? (
              <Field label="About">
                <Text style={styles.value}>{data.description}</Text>
              </Field>
            ) : null}

            {data.address ? (
              <Field label="Address">
                <Text style={styles.value} selectable>
                  {data.address}
                </Text>
              </Field>
            ) : null}

            <Field label="Capabilities">
              <View style={styles.capabilityRow}>
                {(
                  [
                    ["Emergency", data.hasEmergency],
                    ["ICU", data.hasIcu],
                    ["NICU", data.hasNicu],
                    ["Ambulance", data.hasAmbulance],
                  ] as const
                ).map(([label, enabled]) => (
                  <View
                    key={label}
                    style={[
                      styles.capability,
                      enabled
                        ? { backgroundColor: colors.contactMuted }
                        : { backgroundColor: colors.surfaceMuted },
                    ]}
                  >
                    <SymbolView
                      name={enabled ? { ios: "checkmark", android: "check" } : { ios: "minus", android: "remove" }}
                      tintColor={enabled ? colors.contact : colors.tertiaryLabel}
                      size={12}
                    />
                    <Text
                      style={[
                        styles.capabilityText,
                        { color: enabled ? colors.contact : colors.secondaryLabel },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </Field>

            {data.amenities.length > 0 ? (
              <Field label="Amenities">
                <View style={styles.chipRow}>
                  {data.amenities.map((a, aIdx) => (
                    <View key={`${a.name}-${aIdx}`} style={styles.chip}>
                      <Text style={styles.chipText}>{a.name}</Text>
                    </View>
                  ))}
                </View>
              </Field>
            ) : null}

            {data.services.length > 0 ? (
              <Field label="Common services">
                <View style={styles.services}>
                  {data.services.map((s, idx) => (
                    <View key={idx} style={styles.serviceRow}>
                      <Text style={styles.serviceName}>{s.name}</Text>
                      {s.price ? (
                        <Text style={styles.servicePrice} selectable>{formatTaka(s.price)}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </Field>
            ) : null}

            <Field label="Contact">
              {data.phone ? (
                <Text style={styles.value} selectable>{data.phone}</Text>
              ) : (
                <Text style={styles.value}>Public contact not listed</Text>
              )}
            </Field>

            <ContactBlock
              phone={data.contact.phone}
              whatsapp={data.contact.whatsapp}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function formatTaka(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";
  return `৳${trimmed.endsWith(".00") ? trimmed.slice(0, -3) : trimmed}`;
}

function ContactBlock({
  phone,
  whatsapp,
}: {
  phone: string | null;
  whatsapp: string | null;
}) {
  const telUri = telUriFor(phone);
  const waUri = whatsappUriFor(whatsapp);
  if (!telUri && !waUri) {
    return (
      <Field label="Contact">
        <Text style={styles.value}>Public contact not listed</Text>
      </Field>
    );
  }
  return (
    <View style={styles.contactRow}>
      {telUri ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call centre"
          accessibilityHint="Dials the diagnostic centre's public phone"
          onPress={() =>
            openExternalUri(telUri, {
              label: "Phone call",
              help: "Your device couldn't place the call. Please try again.",
            })
          }
          style={({ pressed }) => [
            styles.contactButton,
            { backgroundColor: colors.contact },
            pressed && { opacity: 0.85 },
          ]}
        >
          <SymbolView name={{ ios: "phone.fill", android: "call" }} tintColor="#FFFFFF" size={18} />
          <Text style={styles.contactText}>Call</Text>
        </Pressable>
      ) : null}
      {waUri ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="WhatsApp centre"
          accessibilityHint="Opens WhatsApp to message the diagnostic centre"
          onPress={() =>
            openExternalUri(waUri, {
              label: "WhatsApp",
              help: "WhatsApp couldn't open on this device. Please try again.",
            })
          }
          style={({ pressed }) => [
            styles.contactButton,
            { backgroundColor: colors.contact, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <SymbolView name={{ ios: "message.fill", android: "chat" }} tintColor="#FFFFFF" size={18} />
          <Text style={styles.contactText}>WhatsApp</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: colors.label,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "700",
  },
  typeLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  meta: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    color: colors.label,
    fontSize: 15,
    lineHeight: 20,
  },
  capabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  capability: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  capabilityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  chipText: {
    color: colors.secondaryLabel,
    fontSize: 12,
    fontWeight: "500",
  },
  services: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  serviceName: {
    color: colors.label,
    fontSize: 14,
  },
  servicePrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  contactRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  contactButton: {
    flex: 1,
    minWidth: 140,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
  },
  contactText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
