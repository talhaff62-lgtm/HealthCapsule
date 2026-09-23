import { Platform } from "react-native";
import { Color } from "expo-router";

// Light/dark semantic palette.
export const colors = {
  canvas: "#f1f5f9",
  surface: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: "#FFFFFF",
  })!,
  surfaceMuted: "#e8eef4",
  border: "#dbe3ec",
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#0b1f3a",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#475569",
  })!,
  tertiaryLabel: Platform.select({
    ios: Color.ios.tertiaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#64748b",
  })!,
  // Brand colors
  primary: "#0b1f3a",
  primaryMuted: "#0b1f3a14",
  accent: "#0ea5e9",
  accentMuted: "#0ea5e914",
  contact: "#1F7A4D",
  contactMuted: "#1F7A4D14",
  suggested: "#d97706",
  suggestedMuted: "#d9770614",
  warning: "#d97706",
  warningMuted: "#d9770614",
  verified: "#16a34a",
  danger: "#dc2626",
} as const;

export const fonts = {
  display: Platform.select({ ios: "Georgia", default: "serif" }),
  body: undefined as string | undefined,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const minTouch = 44; // 44dp minimum hit target

export type ColorKey = keyof typeof colors;
