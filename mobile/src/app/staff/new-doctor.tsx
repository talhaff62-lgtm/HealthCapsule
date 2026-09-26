import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import {
  createDoctor,
  getAreas,
  getFacilityOptions,
  getSpecialties,
  searchDoctorDirectory,
  uploadImage,
} from "@/api/panel";
import { useDebounce } from "@/hooks/use-debounce";
import { getLastFacility } from "@/lib/last-facility";
import { Button, Card, LabeledInput, LabeledTextArea, SectionTitle } from "@/components/panel-ui";
import { ImagePickerField } from "@/components/image-picker-field";
import { StatusBadge } from "@/components/status-badge";
import { colors, fonts, minTouch, radius, spacing } from "@/theme";

type AreaOption = { id: string; name: string; thana?: { name: string } | null };
type SpecialtyOption = { id: string; name: string };
type FacilityOption = { id: string; name: string };
type DirectoryMatch = {
  id: string;
  name: string;
  degrees?: string | string[] | null;
  specialties?: { name: string }[] | null;
};
type CreatedDoctor = { id: string; name: string };

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function degreesText(d: DirectoryMatch["degrees"]): string {
  if (!d) return "";
  return Array.isArray(d) ? d.join(", ") : d;
}

export default function NewDoctorScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ facilityId?: string; facilityName?: string }>();

  const [name, setName] = useState("");
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyOption | null>(null);
  const [degrees, setDegrees] = useState("");
  const [position, setPosition] = useState("");
  const [achievements, setAchievements] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facilityOptions, setFacilityOptions] = useState<FacilityOption[]>([]);
  const [facilityQuery, setFacilityQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<FacilityOption | null>(() =>
    typeof params.facilityId === "string" && typeof params.facilityName === "string"
      ? { id: params.facilityId, name: params.facilityName }
      : getLastFacility(),
  );
  const [fee, setFee] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
  const [duplicates, setDuplicates] = useState<DirectoryMatch[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedDoctor | null>(null);

  const debouncedName = useDebounce(name.trim(), 400);
  const debouncedAreaQuery = useDebounce(areaQuery.trim(), 400);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) return;
      try {
        const [sp, fo] = await Promise.all([
          getSpecialties(token),
          getFacilityOptions(token),
        ]);
        if (active) {
          setSpecialties(toArray<SpecialtyOption>(sp));
          setFacilityOptions(toArray<FacilityOption>(fo));
        }
      } catch {
        // lists stay empty; user can retry by reopening
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
        const res = await searchDoctorDirectory(token, debouncedName);
        if (active) setDuplicates(toArray<DirectoryMatch>(res).slice(0, 3));
      } catch {
        // non-blocking
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
        // ignore
      }
    }
    search();
    return () => {
      active = false;
    };
  }, [token, debouncedAreaQuery]);

  const filteredSpecialties = useMemo(() => {
    const q = specialtyQuery.trim().toLowerCase();
    if (!q) return specialties;
    return specialties.filter((s) => s.name.toLowerCase().includes(q));
  }, [specialties, specialtyQuery]);

  const filteredFacilities = useMemo(() => {
    const q = facilityQuery.trim().toLowerCase();
    if (!q) return facilityOptions.slice(0, 20);
    return facilityOptions.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 20);
  }, [facilityOptions, facilityQuery]);

  const needsSpecialtySearch = specialties.length > 10;

  const reset = () => {
    setName("");
    setSpecialtyQuery("");
    setSelectedSpecialty(null);
    setDegrees("");
    setPosition("");
    setAchievements("");
    setPhotoUri(null);
    setFacilityQuery("");
    setSelectedFacility(null);
    setFee("");
    setAreaQuery("");
    setAreaOptions([]);
    setSelectedArea(null);
    setDuplicates([]);
    setFormError(null);
    setCreated(null);
  };

  const submit = async () => {
    if (!token) return;
    if (!name.trim()) {
      setFormError("Doctor name is required.");
      return;
    }
    if (!degrees.trim()) {
      setFormError("Degrees are required.");
      return;
    }
    if (!selectedSpecialty) {
      setFormError("Please choose a specialization.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (photoUri) {
        try {
          photoUrl = await uploadImage(token, photoUri, "doctors");
        } catch {
          setFormError("Couldn't upload the photo. Submit without it or try again.");
          setSubmitting(false);
          return;
        }
      }
      const res = await createDoctor<CreatedDoctor>(token, {
        name: name.trim(),
        degrees: degrees.trim(),
        ...(position.trim() ? { currentPosition: position.trim() } : {}),
        ...(achievements.trim() ? { achievements: achievements.trim() } : {}),
        ...(photoUrl ? { photoUrl } : {}),
        specialtyId: selectedSpecialty.id,
        ...(selectedFacility ? { facilityId: selectedFacility.id } : {}),
        chamber: {
          ...(selectedArea ? { areaId: selectedArea.id } : {}),
          ...(fee.trim() ? { consultationFee: Number(fee.trim()) } : {}),
        },
      });
      setCreated({ id: res.id, name: res.name });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit doctor");
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
          <Button title="Add another doctor" variant="accent" onPress={reset} />
          <Button title="Back to hub" variant="outline" onPress={() => router.replace("/staff" as never)} />
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
        <LabeledInput label="Doctor name" required value={name} onChangeText={setName} placeholder="e.g. Dr. Ayesha Khan" autoCapitalize="words" />
        {duplicates.length > 0 ? (
          <View style={styles.duplicateBox}>
            <Text style={styles.duplicateTitle}>Already in the system?</Text>
            {duplicates.map((d) => (
              <Text key={d.id} style={styles.duplicateItem} selectable>
                {d.name}
                {degreesText(d.degrees) ? ` · ${degreesText(d.degrees)}` : ""}
                {d.specialties?.[0]?.name ? ` · ${d.specialties[0].name}` : ""}
              </Text>
            ))}
          </View>
        ) : null}
        <LabeledInput label="Degrees" required value={degrees} onChangeText={setDegrees} placeholder="MBBS, FCPS, …" hint="Comma-separated" />
        <LabeledInput label="Current position" value={position} onChangeText={setPosition} placeholder="Optional" />
        <LabeledTextArea label="Achievements" value={achievements} onChangeText={setAchievements} placeholder="Optional" />
        <ImagePickerField
          label="Doctor photo"
          hint="Optional — shown on their profile and cards."
          value={photoUri}
          onChange={setPhotoUri}
        />
      </Card>

      <Card>
        <SectionTitle title="Specialization" />
        {selectedSpecialty ? (
          <Pressable
            onPress={() => setSelectedSpecialty(null)}
            accessibilityRole="button"
            accessibilityLabel={`Remove specialization ${selectedSpecialty.name}`}
            style={styles.chipSelected}
          >
            <Text style={styles.chipSelectedText}>{selectedSpecialty.name} ✕</Text>
          </Pressable>
        ) : (
          <>
            {needsSpecialtySearch ? (
              <LabeledInput label="Search specializations" value={specialtyQuery} onChangeText={setSpecialtyQuery} placeholder="Type to filter" />
            ) : null}
            {filteredSpecialties.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSelectedSpecialty(s)}
                accessibilityRole="button"
                accessibilityLabel={`Select specialization ${s.name}`}
                style={styles.optionRow}
              >
                <Text style={styles.optionText}>{s.name}</Text>
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Linked facility" subtitle="Optional" />
        {selectedFacility ? (
          <Pressable
            onPress={() => setSelectedFacility(null)}
            accessibilityRole="button"
            accessibilityLabel={`Remove facility ${selectedFacility.name}`}
            style={styles.chipSelected}
          >
            <Text style={styles.chipSelectedText}>{selectedFacility.name} ✕</Text>
          </Pressable>
        ) : (
          <>
            <LabeledInput label="Choose facility" value={facilityQuery} onChangeText={setFacilityQuery} placeholder="Type to filter facilities" />
            {filteredFacilities.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => {
                  setSelectedFacility(f);
                  setFacilityQuery("");
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select facility ${f.name}`}
                style={styles.optionRow}
              >
                <Text style={styles.optionText}>{f.name}</Text>
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Chamber" subtitle="Optional" />
        <LabeledInput
          label="Consultation fee"
          value={fee}
          onChangeText={setFee}
          placeholder="Optional"
          keyboardType="numeric"
          style={styles.feeInput}
        />
        {selectedArea ? (
          <Pressable
            onPress={() => setSelectedArea(null)}
            accessibilityRole="button"
            accessibilityLabel={`Remove chamber area ${selectedArea.name}`}
            style={styles.chipSelected}
          >
            <Text style={styles.chipSelectedText}>
              {selectedArea.name}
              {selectedArea.thana?.name ? ` · ${selectedArea.thana.name}` : ""} ✕
            </Text>
          </Pressable>
        ) : (
          <>
            <LabeledInput label="Chamber area" value={areaQuery} onChangeText={setAreaQuery} placeholder="Type to search areas" />
            {areaOptions.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => {
                  setSelectedArea(a);
                  setAreaQuery("");
                  setAreaOptions([]);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select chamber area ${a.name}`}
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
  feeInput: {
    fontVariant: ["tabular-nums"],
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
});
