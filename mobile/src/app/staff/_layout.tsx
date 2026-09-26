import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import {
  Building2,
  ClipboardList,
  FolderSearch,
  PlusCircle,
  Stethoscope,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/theme";
import { PanelTabBar } from "@/components/panel-tab-bar";

const STAFF_TABS = [
  { href: "/staff", label: "Home", icon: ClipboardList },
  { href: "/staff/new-facility", label: "Add facility", icon: Building2 },
  { href: "/staff/new-doctor", label: "Add doctor", icon: Stethoscope },
  { href: "/staff/submissions", label: "My submissions", icon: PlusCircle },
  { href: "/staff/directory", label: "Directory", icon: FolderSearch },
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
