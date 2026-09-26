import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { FixtureBanner } from "@/components/fixture-banner";
import { AnimatedSplash } from "@/components/animated-splash";
import { AuthProvider } from "@/lib/auth-context";

// Hold the native splash until the overlay has painted, so the two never both
// show at once. The overlay's mark matches the native image, so the swap is invisible.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const [introDone, setIntroDone] = useState(false);

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
      {!introDone && (
        <AnimatedSplash
          onReady={() => SplashScreen.hideAsync().catch(() => {})}
          onFinish={() => setIntroDone(true)}
        />
      )}
    </AuthProvider>
  );
}
