import { Alert, Linking } from "react-native";

// Open an external URI (tel:, https://wa.me/, etc.) without swallowing the
// failure. Linking rejects when no handler is installed or the OS refuses
// the URI; we surface an Alert so the user can retry, while keeping the
// app's no-crash behavior.
export async function openExternalUri(
  uri: string,
  context: { label: string; help?: string },
): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(uri);
    if (!supported) {
      Alert.alert(
        `${context.label} unavailable`,
        context.help ??
          "Your device can't open this link. Try again or use another contact method.",
      );
      return;
    }
    await Linking.openURL(uri);
  } catch (err) {
    Alert.alert(
      `${context.label} couldn't open`,
      `${context.help ?? "Please try again."}\n\n${(err as Error).message}`,
    );
  }
}
