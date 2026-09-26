import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme";

// Fixed height so screens can reserve exactly this much + TAB_BAR_GAP below their
// content. A self-sizing bar would need its measured height plumbed back up.
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP = 10;

// Screens scroll under the floating bar, so their content needs this much extra
// bottom padding or the last card sits behind it.
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP + insets.bottom;
}

type TabRoute = { key: string; name: string };

type Props = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarAccessibilityLabel?: string;
        tabBarIcon?: (p: {
          focused: boolean;
          color: ColorValue;
          size: number;
        }) => React.ReactNode;
      };
    }
  >;
  navigation: {
    emit: (e: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function FloatingTabBar({ state, descriptors, navigation }: Props) {
  const insets = useSafeAreaInsets();
  // The default bar's tabBarHideOnKeyboard doesn't apply to a custom tabBar, so
  // keep the bar clear of the keyboard on the two search tabs.
  const [keyboardUp, setKeyboardUp] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardUp(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardUp) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_GAP }]}
    >
      <View accessibilityRole="tablist" style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = index === state.index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              aria-selected={focused}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              {options.tabBarIcon?.({
                focused,
                color: focused ? colors.accent : colors.secondaryLabel,
                size: 22,
              })}
              <Text
                maxFontSizeMultiplier={1.3}
                numberOfLines={1}
                style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    paddingHorizontal: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0b1f3a",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  item: {
    flex: 1,
    height: TAB_BAR_HEIGHT - 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: radius.pill,
  },
  itemActive: {
    backgroundColor: colors.accentMuted,
  },
  itemPressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  labelInactive: {
    color: colors.tertiaryLabel,
  },
});
