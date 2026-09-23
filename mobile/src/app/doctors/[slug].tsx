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
import { getDoctor } from "@/api";
import { telUriFor, whatsappUriFor } from "@/utils/phone";
import { openExternalUri } from "@/utils/open-uri";
import { colors, fonts, radius, spacing } from "@/theme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const loadDoctor = useCallback(() => getDoctor(slug), [slug]);
  const { data, loading, error, errorCode, reload } = useAsync(loadDoctor);
  const notFound = errorCode === "NOT_FOUND";

  return (
    <>
      <Stack.Screen options={{ title: data?.name ?? "Doctor profile" }} />
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
          <EmptyState title="Doctor not found" hint="This profile is unavailable." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <EmptyState title="Doctor not found" hint="This profile is unavailable." />
        ) : (
          <View style={{ gap: spacing.lg }}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {data.name.replace(/^Dr\.?\s+/i, "").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name} selectable>
                  {data.name}
                </Text>
                {data.currentPosition ? (
                  <Text style={styles.position}>{data.currentPosition}</Text>
                ) : null}
                <View style={styles.badgeRow}>
                  {data.flags.suggested ? <StatusBadge variant="suggested" /> : null}
                  {data.flags.new ? <StatusBadge variant="new" /> : null}
                  {data.flags.verified ? <StatusBadge variant="verified" /> : null}
                </View>
              </View>
            </View>

            {data.degrees.length > 0 ? (
              <Field label="Degrees">
                <Text style={styles.value}>{data.degrees.join(", ")}</Text>
              </Field>
            ) : null}

            {data.specialties.length > 0 ? (
              <Field label="Specialties">
                <Text style={styles.value}>
                  {data.specialties.map((s) => s.name).join(" · ")}
                </Text>
              </Field>
            ) : null}

            {data.achievements ? (
              <Field label="Achievements">
                <Text style={styles.value}>{data.achievements}</Text>
              </Field>
            ) : null}

            <ContactBlock
              phone={data.contact.phone}
              whatsapp={data.contact.whatsapp}
            />

            {data.chambers.length > 0 ? (
              <Field label="Chambers">
                <View style={{ gap: spacing.sm }}>
                  {data.chambers.map((c, cIdx) => (
                    <View key={c.id ?? `${c.facility?.name ?? "chamber"}-${c.address ?? cIdx}`} style={styles.chamber}>
                      <Text style={styles.chamberTitle}>
                        {c.facility?.name ?? "Private chamber"}
                      </Text>
                      {c.address ? (
                        <Text style={styles.chamberMeta}>{c.address}</Text>
                      ) : null}
                      {c.area ? (
                        <Text style={styles.chamberMeta}>{c.area.name}</Text>
                      ) : null}
                      <Text style={styles.chamberFee} selectable>
                        Consultation {formatFee(c.consultationFee)}
                      </Text>
                      {c.schedules.length > 0 ? (
                        <View style={styles.schedule}>
                          {c.schedules.map((s, sIdx) => (
                            <Text key={sIdx} style={styles.scheduleRow}>
                              <Text style={styles.scheduleDay}>
                                {DAYS[s.dayOfWeek] ?? `Day ${s.dayOfWeek}`}
                              </Text>
                              {"  "}
                              {s.startTime} – {s.endTime}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </Field>
            ) : null}
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

function formatFee(value: string | null): string {
  if (value == null) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";
  const whole = trimmed.endsWith(".00") ? trimmed.slice(0, -3) : trimmed;
  return `৳${whole}`;
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
          accessibilityLabel="Call chamber"
          accessibilityHint="Dials the doctor's public chamber phone"
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
          <SymbolView
            name={{ ios: "phone.fill", android: "call" }}
            tintColor="#FFFFFF"
            size={18}
          />
          <Text style={styles.contactText}>Call</Text>
        </Pressable>
      ) : null}
      {waUri ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="WhatsApp chamber"
          accessibilityHint="Opens WhatsApp to message the doctor's public chamber"
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
          <SymbolView
            name={{ ios: "message.fill", android: "chat" }}
            tintColor="#FFFFFF"
            size={18}
          />
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    color: colors.label,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: "700",
  },
  position: {
    color: colors.secondaryLabel,
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
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
  chamber: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  chamberTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
  },
  chamberMeta: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  chamberFee: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  schedule: {
    gap: 2,
    marginTop: spacing.xs,
  },
  scheduleRow: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  scheduleDay: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "600",
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
