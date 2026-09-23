import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { FixtureBanner } from "@/components/fixture-banner";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <AuthProvider>
      <FixtureBanner />
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="doctors/[slug]"
          options={{ headerShown: true, title: "Doctor profile" }}
        />
        <Stack.Screen
          name="facilities/[slug]"
          options={{ headerShown: true, title: "Diagnostic centre" }}
        />
        <Stack.Screen
          name="auth/sign-in"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
