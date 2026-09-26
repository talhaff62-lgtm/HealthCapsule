import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { getDoctor, updateDoctor } from "@/api/panel";
import { Button, Card, LabeledInput, LabeledTextArea, SectionTitle } from "@/components/panel-ui";
import { StatusBadge, type PanelStatus } from "@/components/status-badge";
import { ErrorState, LoadingState } from "@/components/skeleton";
import { colors, spacing } from "@/theme";
import { messageOf, scalar, Segmented } from "./admin-shared";

type Tier = "FREE" | "VERIFIED" | "FEATURED" | "PREMIUM";

type DoctorRecord = {
  id: string;
  name: string;
  verificationStatus?: string;
  bio?: string | null;
  consultationFee?: string | number | null;
  listingTier?: string;
  collectedBy?: { name?: string | null } | null;
};

const TIERS: { value: Tier; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FEATURED", label: "Featured" },
  { value: "PREMIUM", label: "Premium" },
];

export default function EditDoctorScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const doctorId = typeof id === "string" ? id : "";
  const hasRef = Boolean(token && doctorId);

  const [loaded, setLoaded] = useState<DoctorRecord | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [fee, setFee] = useState("");
  const [tier, setTier] = useState<Tier>("FREE");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<DoctorRecord> => {
    if (!token || !doctorId) throw new Error("Missing doctor reference");
    return getDoctor<DoctorRecord>(token, doctorId);
  }, [token, doctorId]);

  useEffect(() => {
    if (!hasRef) return;
    let active = true;
    load()
      .then((r) => {
        if (!active) return;
        setLoaded(r);
        setName(r.name ?? "");
        setBio(r.bio ?? "");
        setFee(scalar(r.consultationFee) ?? "");
        const t = String(r.listingTier ?? "FREE").toUpperCase() as Tier;
        if (TIERS.some((o) => o.value === t)) setTier(t);
      })
      .catch((err) => {
        if (active) setLoadError(messageOf(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hasRef, load, attempt]);

  async function save() {
    const tok = token;
    if (!tok || !doctorId || saving) return;
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    const trimmedFee = fee.trim();
    if (trimmedFee && !Number.isFinite(Number(trimmedFee))) {
      setFormError("Consultation fee must be a number.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await updateDoctor<DoctorRecord>(tok, doctorId, {
        name: name.trim(),
        bio: bio.trim() || null,
        consultationFee: trimmedFee === "" ? null : Number(trimmedFee),
        listingTier: tier,
      });
      router.back();
    } catch (err) {
      setFormError(messageOf(err));
    } finally {
      setSaving(false);
    }
  }

  if (!hasRef || (loadError && !loaded)) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ErrorState
          message={loadError ?? "Missing doctor reference"}
          onRetry={
            hasRef
              ? () => {
                  setLoadError(null);
                  setLoading(true);
                  setAttempt((a) => a + 1);
                }
              : undefined
          }
        />
      </View>
    );
  }

  if (loading && !loaded) {
    return (
      <View style={[styles.screen, styles.center]}>
        <LoadingState />
      </View>
    );
  }

  const current = loaded;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.head}>
        <SectionTitle title={current?.name ?? ""} subtitle="Edit the doctor's listing details" />
        <StatusBadge status={(current?.verificationStatus ?? "PENDING") as PanelStatus} />
      </View>
      {current?.collectedBy?.name ? (
        <Text style={styles.enteredBy}>Entered by {current.collectedBy.name}</Text>
      ) : null}

      <Card>
        <LabeledInput
          label="Name"
          required
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          autoCapitalize="words"
        />
        <LabeledTextArea
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Short professional bio"
        />
        <LabeledInput
          label="Consultation fee (BDT)"
          value={fee}
          onChangeText={setFee}
          placeholder="e.g. 600"
          keyboardType="numeric"
          hint="Leave empty if the fee is unknown."
        />
        <Segmented<Tier>
          label="Listing tier"
          value={tier}
          onChange={setTier}
          options={TIERS}
        />
        {formError ? (
          <Text style={styles.apiError} accessibilityRole="alert">
            {formError}
          </Text>
        ) : null}
        <Button title="Save changes" loading={saving} onPress={() => void save()} />
        <Button title="Cancel" variant="outline" disabled={saving} onPress={() => router.back()} />
      </Card>

      <Text style={styles.readonlyHint}>
        Specialties, chambers and schedules are managed from the web portal.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  center: {
    paddingTop: spacing.xxl,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  enteredBy: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  apiError: {
    color: colors.danger,
    fontSize: 13,
  },
  readonlyHint: {
    color: colors.tertiaryLabel,
    fontSize: 12,
    textAlign: "center",
  },
});
