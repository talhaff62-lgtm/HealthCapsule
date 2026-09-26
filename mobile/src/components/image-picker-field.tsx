import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Trash2 } from "lucide-react-native";
import { colors, minTouch, radius, spacing } from "@/theme";

// Single-image picker row for panel forms: shows a preview once picked and
// hands the LOCAL uri back; the caller uploads it on submit.
export function ImagePickerField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (localUri: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function pick() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset?.uri) onChange(asset.uri);
    } catch {
      Alert.alert("Couldn't open the gallery", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
          <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label}`}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            <Trash2 size={16} color={colors.danger} strokeWidth={2} />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            void pick();
          }}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${label}`}
          style={({ pressed }) => [styles.choose, pressed && styles.pressed, busy && styles.busy]}
        >
          <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.chooseText}>{busy ? "Opening gallery…" : "Choose image"}</Text>
        </Pressable>
      )}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
  },
  choose: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: minTouch,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.canvas,
  },
  chooseText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  preview: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  remove: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: minTouch,
    paddingHorizontal: spacing.sm,
  },
  removeText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  busy: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
  hint: {
    color: colors.secondaryLabel,
    fontSize: 12,
  },
});
