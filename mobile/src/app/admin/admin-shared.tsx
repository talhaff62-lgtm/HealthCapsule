import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/panel-ui";
import type { PanelStatus } from "@/components/status-badge";
import { colors, minTouch, radius, spacing } from "@/theme";

export type PanelRecord = {
  id: string;
  name: string;
  verificationStatus: PanelStatus;
  rejectReason?: string | null;
  collectedAt?: string | null;
  [key: string]: unknown;
};

export function messageOf(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

export function toMs(v: string | null | undefined): number {
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

export function formatDate(v: string | null | undefined): string {
  if (!v) return "Unknown date";
  const t = Date.parse(v);
  if (Number.isNaN(t)) return "Unknown date";
  return new Date(t).toLocaleDateString();
}

export function scalar(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  return null;
}

export function nestedName(item: unknown): string | null {
  if (typeof item === "string" && item) return item;
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    for (const key of ["name", "specialty", "amenity", "facility"]) {
      const inner = o[key];
      const direct = scalar(inner);
      if (direct) return direct;
      if (inner && typeof inner === "object") {
        const deep = scalar((inner as Record<string, unknown>).name);
        if (deep) return deep;
      }
    }
  }
  return null;
}

export function joinNames(v: unknown): string | null {
  if (!Array.isArray(v)) return scalar(v);
  const names = v.map(nestedName).filter((n): n is string => Boolean(n));
  return names.length ? names.join(", ") : null;
}

export function collectedByName(r: PanelRecord): string {
  return nestedName(r.collectedBy) ?? "Unknown";
}

export function areaName(r: PanelRecord): string | null {
  return nestedName(r.area);
}

export function facilityTypeLabel(type: unknown): string {
  const s = String(type ?? "").toUpperCase();
  if (s.includes("DIAG")) return "Diagnostic centre";
  return "Hospital";
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} selectable>
        {value}
      </Text>
    </View>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      <Text style={styles.segmentedLabel}>{label}</Text>
      <View style={styles.segmentedRow}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="button"
              accessibilityLabel={o.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.pill,
                active && styles.pillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function VerifyButton({
  itemName,
  busy,
  onPress,
}: {
  itemName: string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={`Verify ${itemName}`}
      style={({ pressed }) => [
        styles.verify,
        pressed && styles.pressed,
        busy && styles.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.verifyText}>Verify</Text>
      )}
    </Pressable>
  );
}

export function RejectBlock({
  itemName,
  busy,
  onConfirm,
}: {
  itemName: string;
  busy: boolean;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function confirm() {
    if (!reason.trim()) {
      setLocalError("A reason is required to reject.");
      return;
    }
    setLocalError(null);
    try {
      await onConfirm(reason.trim());
      setReason("");
      setOpen(false);
    } catch {
      // The parent surfaces the API error next to the item; keep the form open.
    }
  }

  if (!open) {
    return (
      <View style={styles.flex}>
        <Pressable
          onPress={() => {
            setOpen(true);
            setLocalError(null);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Reject ${itemName}`}
          style={({ pressed }) => [
            styles.rejectOutline,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.rejectOutlineText}>Reject</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.rejectForm}>
      <TextInput
        style={styles.reasonInput}
        placeholder="Reason for rejection (required)"
        placeholderTextColor={colors.tertiaryLabel}
        value={reason}
        onChangeText={setReason}
        multiline
        textAlignVertical="top"
        accessibilityLabel={`Rejection reason for ${itemName}`}
      />
      {localError ? <Text style={styles.apiError}>{localError}</Text> : null}
      <View style={styles.rejectRow}>
        <View style={styles.flex}>
          <Button
            title="Confirm reject"
            variant="danger"
            loading={busy}
            onPress={() => {
              void confirm();
            }}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title="Cancel"
            variant="outline"
            disabled={busy}
            onPress={() => setOpen(false)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 2,
    paddingVertical: spacing.xs,
  },
  fieldLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: colors.label,
    fontSize: 15,
  },
  segmented: {
    gap: spacing.xs,
  },
  segmentedLabel: {
    color: colors.secondaryLabel,
    fontSize: 12,
    fontWeight: "600",
  },
  segmentedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: minTouch,
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.secondaryLabel,
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
  flex: {
    flex: 1,
  },
  verify: {
    flex: 1,
    backgroundColor: colors.verified,
    borderRadius: radius.md,
    minHeight: minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  verifyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  rejectOutline: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    minHeight: minTouch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  rejectOutlineText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
  rejectForm: {
    gap: spacing.sm,
  },
  reasonInput: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 88,
    fontSize: 16,
    color: colors.label,
  },
  rejectRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  apiError: {
    color: colors.danger,
    fontSize: 13,
  },
});
