import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { ClipboardList, LayoutDashboard, Stethoscope, UsersRound } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/theme";
import { PanelTabBar } from "@/components/panel-tab-bar";

const ADMIN_TABS = [
  { href: "/admin", label: "Console", icon: LayoutDashboard },
  { href: "/admin/review", label: "Review", icon: ClipboardList },
  { href: "/admin/entries", label: "Entries", icon: Stethoscope },
  { href: "/admin/staff", label: "Staff", icon: UsersRound },
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
        <Stack.Screen name="edit-doctor" options={{ title: "Edit doctor" }} />
        <Stack.Screen name="edit-facility" options={{ title: "Edit facility" }} />
      </Stack>
      <PanelTabBar items={ADMIN_TABS} />
    </View>
  );
}
