// ponytail: shared bottom bar for panel stacks; if patient tabs ever need >4 items or badges, promote this into the Tabs API instead.
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";

export type PanelTabItem = { href: string; label: string };

export function PanelTabBar({ items }: { items: PanelTabItem[] }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            style={styles.item}
          >
            <Text style={[styles.label, active ? styles.active : styles.inactive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 52,
  },
  label: { fontSize: 11, fontWeight: "600" },
  active: { color: colors.accent },
  inactive: { color: "rgba(255,255,255,0.7)" },
});
