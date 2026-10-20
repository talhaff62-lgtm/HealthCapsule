import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { fonts } from "@/theme";

// Kept equal to imageWidth in app.json's expo-splash-screen block, so the mark
// lands pixel-identical to the native splash and the handoff reads as one scene.
const MARK_BOX = 220;
const ART = require("../../assets/images/splash-icon.png");

// Fixed rather than theme colors: the splash canvas is always light, so the
// platform-dynamic tokens would lose contrast here in dark mode.
const BG = "#f1f5f9";
const INK = "#0b1f3a";
const MUTED = "#64748b";
const ACCENT = "#0ea5e9";

const easeOut = Easing.out(Easing.cubic);
const easeIn = Easing.in(Easing.cubic);

export function AnimatedSplash({
  onReady,
  onFinish,
}: {
  onReady: () => void;
  onFinish: () => void;
}) {
  // Lazy useState, not useRef().current — reading a ref during render is a React 19 error.
  const [echoA] = useState(() => new Animated.Value(0));
  const [echoB] = useState(() => new Animated.Value(0));
  const [enter] = useState(() => new Animated.Value(0));
  const [mark] = useState(() => new Animated.Value(1));
  const [word] = useState(() => new Animated.Value(0));
  const [rule] = useState(() => new Animated.Value(0));
  const [tag] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  // Held in refs so the timeline runs exactly once. Callers pass inline arrows,
  // so depending on their identity would restart the animation on every parent
  // re-render (the home screen refetches and re-renders several times) and it
  // would never reach its end.
  const cbs = useRef({ onReady, onFinish });
  useEffect(() => {
    cbs.current = { onReady, onFinish };
  }, [onReady, onFinish]);

  useEffect(() => {
    let cancelled = false;
    const native = Platform.OS !== "web";

    const echo = (v: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: native,
        }),
      ]);

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          cbs.current.onFinish();
          return;
        }
        Animated.sequence([
          // The mark lands first (fade + settle from slightly large), with two
          // echoes expanding outward — it reads as "live" before anything else
          // moves, and it suits a health app better than a spin.
          Animated.parallel([
            Animated.timing(enter, {
              toValue: 1,
              duration: 480,
              easing: easeOut,
              useNativeDriver: native,
            }),
            echo(echoA, 120),
            echo(echoB, 380),
          ]),
          Animated.parallel([
            Animated.timing(mark, {
              toValue: 0.9,
              duration: 520,
              easing: easeOut,
              useNativeDriver: native,
            }),
            Animated.timing(word, {
              toValue: 1,
              duration: 560,
              easing: easeOut,
              useNativeDriver: native,
            }),
          ]),
          Animated.parallel([
            Animated.timing(rule, {
              toValue: 1,
              duration: 420,
              easing: easeOut,
              useNativeDriver: native,
            }),
            Animated.timing(tag, {
              toValue: 1,
              duration: 460,
              easing: easeOut,
              useNativeDriver: native,
            }),
          ]),
          Animated.delay(280),
          Animated.parallel([
            Animated.timing(fade, {
              toValue: 0,
              duration: 440,
              easing: easeIn,
              useNativeDriver: native,
            }),
            Animated.timing(mark, {
              toValue: 0.98,
              duration: 440,
              easing: easeIn,
              useNativeDriver: native,
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished && !cancelled) cbs.current.onFinish();
        });
      });

    return () => {
      cancelled = true;
    };
  }, [echoA, echoB, enter, mark, word, rule, tag, fade]);

  // onLayout fires once the overlay is painted — hide the native splash then,
  // so the two are never on screen together.
  const [laidOut, setLaidOut] = useState(false);
  const handleLayout = () => {
    if (laidOut) return;
    setLaidOut(true);
    cbs.current.onReady();
  };

  const rise = (v: Animated.Value, dy: number) => ({
    opacity: v,
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) },
    ],
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: fade }]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.stage,
          {
            opacity: enter,
            transform: [
              {
                scale: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.Image
          source={ART}
          style={[
            styles.mark,
            {
              opacity: echoA.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0],
              }),
              transform: [
                {
                  scale: echoA.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.32],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.Image
          source={ART}
          style={[
            styles.mark,
            {
              opacity: echoB.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0],
              }),
              transform: [
                {
                  scale: echoB.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.32],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.Image
          source={ART}
          style={[styles.mark, { transform: [{ scale: mark }] }]}
        />
      </Animated.View>

      <View style={styles.below}>
        <Animated.Text style={[styles.word, rise(word, 12)]}>
          Capsule
        </Animated.Text>
        <Animated.View style={[styles.rule, { transform: [{ scaleX: rule }] }]} />
        <Animated.Text style={[styles.tag, rise(tag, 8)]}>
          Chattogram, verified care.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  stage: { width: MARK_BOX, height: MARK_BOX },
  mark: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MARK_BOX,
    height: MARK_BOX,
  },
  below: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    marginTop: MARK_BOX / 2 + 6,
    alignItems: "center",
  },
  word: {
    color: INK,
    fontFamily: fonts.display,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  rule: {
    width: 28,
    height: 3,
    borderRadius: 999,
    backgroundColor: ACCENT,
    marginTop: 10,
  },
  tag: { color: MUTED, fontSize: 13, marginTop: 10 },
});
