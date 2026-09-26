import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import {
  createFacility,
  getAmenities,
  getAreas,
  searchFacilityDirectory,
  uploadImage,
} from "@/api/panel";
import { useDebounce } from "@/hooks/use-debounce";
import { setLastFacility } from "@/lib/last-facility";
import { Button, Card, LabeledInput, LabeledTextArea, SectionTitle } from "@/components/panel-ui";
import { ImagePickerField } from "@/components/image-picker-field";
import { StatusBadge } from "@/components/status-badge";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

type FacilityType = "HOSPITAL" | "DIAGNOSTIC_CENTER";

type AreaOption = { id: string; name: string; thana?: { name: string } | null };
type AmenityOption = { id: string; name: string };
type DirectoryMatch = { id: string; name: string; area?: { name: string } | null };
type CreatedFacility = { id: string; name: string };

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export default function NewFacilityScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<FacilityType>("HOSPITAL");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [discount, setDiscount] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DirectoryMatch[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedFacility | null>(null);

  const debouncedName = useDebounce(name.trim(), 400);
  const debouncedAreaQuery = useDebounce(areaQuery.trim(), 400);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) return;
      try {
        const res = await getAmenities(token);
        if (active) setAmenities(toArray<AmenityOption>(res));
      } catch {
        // leave empty; submission still works without amenities
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!token || debouncedName.length < 3) {
        if (active) setDuplicates([]);
        return;
      }
      try {
        const res = await searchFacilityDirectory(token, debouncedName);
        if (active) setDuplicates(toArray<DirectoryMatch>(res).slice(0, 3));
      } catch {
        // non-blocking; ignore duplicate-check failures
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [token, debouncedName]);

  useEffect(() => {
    let active = true;
    async function search() {
      if (!token || !debouncedAreaQuery) {
        if (active) setAreaOptions([]);
        return;
      }
      try {
        const res = await getAreas(token, debouncedAreaQuery);
        if (active) setAreaOptions(toArray<AreaOption>(res));
      } catch {
        // ignore; user can retry typing
      }
    }
    search();
    return () => {
      active = false;
    };
  }, [token, debouncedAreaQuery]);

  const toggleAmenity = (id: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const reset = () => {
    setType("HOSPITAL");
    setName("");
    setAddress("");
    setAreaQuery("");
    setAreaOptions([]);
    setSelectedArea(null);
    setSelectedAmenities([]);
    setDiscount("");
    setLogoUri(null);
    setCoverUri(null);
    setDuplicates([]);
    setFormError(null);
    setCreated(null);
  };

  const submit = async () => {
    if (!token) return;
    if (!name.trim()) {
      setFormError("Facility name is required.");
      return;
    }
    if (!address.trim()) {
      setFormError("Address is required.");
      return;
    }
    if (!selectedArea) {
      setFormError("Please choose an area.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let logoUrl: string | undefined;
      let coverImageUrl: string | undefined;
      try {
        if (logoUri) logoUrl = await uploadImage(token, logoUri, "facilities");
        if (coverUri) coverImageUrl = await uploadImage(token, coverUri, "facilities");
      } catch {
        setFormError("Couldn't upload the images. Submit without them or try again.");
        setSubmitting(false);
        return;
      }
      const res = await createFacility<CreatedFacility>(token, {
        name: name.trim(),
        type,
        address: address.trim(),
        areaId: selectedArea.id,
        amenityIds: selectedAmenities,
        ...(discount.trim() ? { discountInfo: discount.trim() } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(coverImageUrl ? { coverImageUrl } : {}),
      });
      setLastFacility({ id: res.id, name: res.name });
      setCreated({ id: res.id, name: res.name });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit facility");
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <View style={[styles.screen, styles.centered, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.successPanel}>
          <Text style={styles.successTitle}>{created.name}</Text>
          <StatusBadge status="PENDING" />
          <Text style={styles.successHint}>Submitted for review.</Text>
          <Button
            title="Add a doctor here"
            variant="accent"
            onPress={() =>
              router.push(
                {
                  pathname: "/staff/new-doctor",
                  params: { facilityId: created.id, facilityName: created.name },
                } as never,
              )
            }
          />
          <Button title="Add another" variant="outline" onPress={reset} />
        </View>
      </View>
    );
  }

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
      <Card>
        <SectionTitle title="Facility type" />
        <View style={styles.segmented}>
          {(["HOSPITAL", "DIAGNOSTIC_CENTER"] as FacilityType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              accessibilityRole="button"
              accessibilityLabel={t === "HOSPITAL" ? "Hospital" : "Diagnostic centre"}
              accessibilityState={{ selected: type === t }}
              style={[styles.segment, type === t && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
                {t === "HOSPITAL" ? "Hospital" : "Diagnostic centre"}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <LabeledInput label="Facility name" required value={name} onChangeText={setName} placeholder="e.g. City General Hospital" autoCapitalize="words" />
        {duplicates.length > 0 ? (
          <View style={styles.duplicateBox}>
            <Text style={styles.duplicateTitle}>Already in the system?</Text>
            {duplicates.map((d) => (
              <Text key={d.id} style={styles.duplicateItem} selectable>
                {d.name}
                {d.area?.name ? ` · ${d.area.name}` : ""}
              </Text>
            ))}
          </View>
        ) : null}
        <LabeledTextArea label="Address" required value={address} onChangeText={setAddress} placeholder="Street address" />
      </Card>

      <Card>
        <SectionTitle title="Area" subtitle="Search and pick one area" />
        {selectedArea ? (
          <Pressable
            onPress={() => setSelectedArea(null)}
            accessibilityRole="button"
            accessibilityLabel={`Remove area ${selectedArea.name}`}
            style={styles.chipSelected}
          >
            <Text style={styles.chipSelectedText}>
              {selectedArea.name}
              {selectedArea.thana?.name ? ` · ${selectedArea.thana.name}` : ""} ✕
            </Text>
          </Pressable>
        ) : (
          <>
            <LabeledInput label="Search area" value={areaQuery} onChangeText={setAreaQuery} placeholder="Type to search areas" />
            {areaOptions.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => {
                  setSelectedArea(a);
                  setAreaQuery("");
                  setAreaOptions([]);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select area ${a.name}`}
                style={styles.optionRow}
              >
                <Text style={styles.optionText} selectable>
                  {a.name}
                  {a.thana?.name ? ` · ${a.thana.name}` : ""}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Amenities" subtitle="Optional — tap to toggle" />
        <View style={styles.chipWrap}>
          {amenities.map((a) => {
            const active = selectedAmenities.includes(a.id);
            return (
              <Pressable
                key={a.id}
                onPress={() => toggleAmenity(a.id)}
                accessibilityRole="button"
                accessibilityLabel={`Toggle amenity ${a.name}`}
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{a.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <LabeledInput label="Discount info" value={discount} onChangeText={setDiscount} placeholder="Optional discount details" />
      </Card>

      <Card>
        <SectionTitle title="Images" subtitle="Optional — shown on cards and the facility page" />
        <ImagePickerField
          label="Logo"
          hint="Square image works best."
          value={logoUri}
          onChange={setLogoUri}
        />
        <ImagePickerField
          label="Cover photo"
          hint="Wide image shown at the top of the facility page."
          value={coverUri}
          onChange={setCoverUri}
        />
      </Card>

      {formError ? (
        <Text style={styles.formError} selectable>
          {formError}
        </Text>
      ) : null}

      <Button title="Submit for review" loading={submitting} onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centered: {
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
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
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.sm,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  duplicateBox: {
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  duplicateTitle: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "700",
  },
  duplicateItem: {
    color: colors.label,
    fontSize: 13,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipSelected: {
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
  },
  chipSelectedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  optionRow: {
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  optionText: {
    color: colors.label,
    fontSize: 14,
  },
  successPanel: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  successTitle: {
    fontFamily: fonts.display,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  successHint: {
    color: "#FFFFFFCC",
    fontSize: 14,
  },
  formError: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  errorHint: {
    display: "none",
    fontSize: 1,
  },
});
