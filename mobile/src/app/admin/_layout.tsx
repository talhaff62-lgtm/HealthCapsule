import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/theme";
import { PanelTabBar } from "@/components/panel-tab-bar";

const ADMIN_TABS = [
  { href: "/admin", label: "Console" },
  { href: "/admin/review", label: "Review" },
  { href: "/admin/entries", label: "Entries" },
  { href: "/admin/staff", label: "Staff" },
];

export default function AdminLayout() {
  const { status, user } = useAuth();

  if (status === "loading") return null;
  if (status !== "signedIn" || user?.role !== "ADMIN") {
    return <Redirect href={"/auth/sign-in" as never} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Admin console" }} />
        <Stack.Screen name="review" options={{ title: "Review queue" }} />
        <Stack.Screen name="entries" options={{ title: "All entries" }} />
        <Stack.Screen name="staff" options={{ title: "Staff management" }} />
      </Stack>
      <PanelTabBar items={ADMIN_TABS} />
    </View>
  );
}
