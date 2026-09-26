import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { getFacility, updateFacility, uploadImage } from "@/api/panel";
import { Button, Card, LabeledInput, LabeledTextArea, SectionTitle } from "@/components/panel-ui";
import { ImagePickerField } from "@/components/image-picker-field";
import { StatusBadge, type PanelStatus } from "@/components/status-badge";
import { ErrorState, LoadingState } from "@/components/skeleton";
import { colors, spacing } from "@/theme";
import { facilityTypeLabel, messageOf, nestedName, Segmented } from "./admin-shared";

type Tier = "FREE" | "VERIFIED" | "FEATURED" | "PREMIUM";

type FacilityRecord = {
  id: string;
  name: string;
  type?: string;
  verificationStatus?: string;
  description?: string | null;
  listingTier?: string;
  area?: { name?: string | null } | null;
  collectedBy?: { name?: string | null } | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  [key: string]: unknown;
};

const TIERS: { value: Tier; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FEATURED", label: "Featured" },
  { value: "PREMIUM", label: "Premium" },
];

export default function EditFacilityScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const facilityId = typeof id === "string" ? id : "";
  const hasRef = Boolean(token && facilityId);

  const [loaded, setLoaded] = useState<FacilityRecord | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<Tier>("FREE");
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<FacilityRecord> => {
    if (!token || !facilityId) throw new Error("Missing facility reference");
    return getFacility<FacilityRecord>(token, facilityId);
  }, [token, facilityId]);

  useEffect(() => {
    if (!hasRef) return;
    let active = true;
    load()
      .then((r) => {
        if (!active) return;
        setLoaded(r);
        setName(r.name ?? "");
        setDescription(r.description ?? "");
        setLogo(r.logoUrl ?? null);
        setCover(r.coverImageUrl ?? null);
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
    if (!tok || !facilityId || saving) return;
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    let finalLogoUrl: string | null = logo;
    let finalCoverUrl: string | null = cover;

    if (logo && !logo.startsWith("http://") && !logo.startsWith("https://")) {
      try {
        finalLogoUrl = await uploadImage(tok, logo, "facilities");
      } catch {
        setFormError("Couldn't upload the images. Try again or remove them.");
        setSaving(false);
        return;
      }
    }

    if (cover && !cover.startsWith("http://") && !cover.startsWith("https://")) {
      try {
        finalCoverUrl = await uploadImage(tok, cover, "facilities");
      } catch {
        setFormError("Couldn't upload the images. Try again or remove them.");
        setSaving(false);
        return;
      }
    }

    const origLogoUrl = loaded?.logoUrl ?? null;
    const origCoverUrl = loaded?.coverImageUrl ?? null;

    const body: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim() || null,
      listingTier: tier,
    };
    if (finalLogoUrl !== origLogoUrl) {
      body.logoUrl = finalLogoUrl;
    }
    if (finalCoverUrl !== origCoverUrl) {
      body.coverImageUrl = finalCoverUrl;
    }

    try {
      await updateFacility<FacilityRecord>(tok, facilityId, body);
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
          message={loadError ?? "Missing facility reference"}
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
  const meta = current
    ? `${facilityTypeLabel(current.type)} · ${nestedName(current.area) ?? "Unknown area"}`
    : "";

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
        <SectionTitle
          title={current?.name ?? ""}
          subtitle={meta}
        />
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
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What this facility offers"
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

      <Card>
        <ImagePickerField
          label="Logo"
          hint="Square image works best."
          value={logo}
          onChange={setLogo}
        />
        <ImagePickerField
          label="Cover photo"
          hint="Wide image shown at the top of the facility page."
          value={cover}
          onChange={setCover}
        />
      </Card>

      <Text style={styles.readonlyHint}>
        Area, contact details and amenities are managed from the web portal.
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
