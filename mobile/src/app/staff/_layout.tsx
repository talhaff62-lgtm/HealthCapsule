import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/theme";
import { PanelTabBar } from "@/components/panel-tab-bar";

const STAFF_TABS = [
  { href: "/staff", label: "Home" },
  { href: "/staff/new-facility", label: "Add facility" },
  { href: "/staff/new-doctor", label: "Add doctor" },
  { href: "/staff/submissions", label: "My submissions" },
  { href: "/staff/directory", label: "Directory" },
];

export default function StaffLayout() {
  const { status, user } = useAuth();

  if (status === "loading") return null;
  if (status !== "signedIn" || (user?.role !== "STAFF" && user?.role !== "ADMIN")) {
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
        <Stack.Screen name="index" options={{ title: "Staff panel" }} />
        <Stack.Screen name="new-facility" options={{ title: "Add facility" }} />
        <Stack.Screen name="new-doctor" options={{ title: "Add doctor" }} />
        <Stack.Screen name="submissions" options={{ title: "My submissions" }} />
        <Stack.Screen name="directory" options={{ title: "Check existing entries" }} />
      </Stack>
      <PanelTabBar items={STAFF_TABS} />
    </View>
  );
}
