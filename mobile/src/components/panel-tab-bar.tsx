// ponytail: shared bottom bar for panel stacks; if patient tabs ever need >4 items or badges, promote this into the Tabs API instead.
import { useState } from "react";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "@/theme";

export type PanelTabItem = { href: string; label: string; icon: LucideIcon };

const ICON_SIZE = 20;

// In-flow (not absolutely positioned), so panel screens keep their layout; the
// canvas strip behind the pill blends with the screens' own background.
export function PanelTabBar({ items }: { items: PanelTabItem[] }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  return (
    <View style={[styles.strip, { paddingBottom: insets.bottom + 10 }]}>
      <View accessibilityRole="tablist" style={styles.bar}>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Pressable
              key={item.href}
              accessibilityRole="tab"
              aria-selected={active}
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) router.push(item.href as never);
              }}
              onPressIn={() => setPressedKey(item.href)}
              onPressOut={() => setPressedKey(null)}
              style={({ pressed }) => [
                styles.item,
                active && styles.itemActive,
                (pressed || pressedKey === item.href) && styles.itemPressed,
              ]}
            >
              <Icon
                size={ICON_SIZE}
                color={active ? colors.accent : colors.tertiaryLabel}
                strokeWidth={active ? 2.5 : 2}
              />
              <Text
                maxFontSizeMultiplier={1.3}
                numberOfLines={1}
                style={[styles.label, active ? styles.labelActive : styles.labelInactive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: colors.canvas,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  bar: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    paddingHorizontal: 5,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0b1f3a",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  item: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  itemActive: {
    backgroundColor: colors.accentMuted,
  },
  itemPressed: {
    opacity: 0.6,
  },
  label: { fontSize: 10, fontWeight: "600" } as { fontSize: number; fontWeight: "600" },
  labelActive: { color: colors.accent, fontWeight: "700" },
  labelInactive: { color: colors.tertiaryLabel } as { color: ColorValue },
});
