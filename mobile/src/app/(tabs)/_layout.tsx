import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { colors } from "@/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: "bottom",
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryLabel ?? "#64748b",
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="doctors" options={{ title: "Doctors" }} />
      <Tabs.Screen name="diagnostics" options={{ title: "Diagnostics" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    borderTopWidth: Platform.OS === "web" ? 0 : StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  label: { fontSize: 11, fontWeight: "600", marginTop: 2 },
});
