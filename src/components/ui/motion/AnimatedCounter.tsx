"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "motion/react";

interface AnimatedCounterProps {
  /**
   * The value to animate. Non-numeric parts are preserved, e.g.:
   *   "120+"  -> counts 0 → 120, renders "120+"
   *   "9"     -> counts 0 → 9
   *   "5"     -> counts 0 → 5
   */
  value: string;
  /** Duration of the count-up in seconds. */
  duration?: number;
  className?: string;
}

/**
 * Counts a number from 0 up to its target when scrolled into view (once).
 * Leading numeric portion animates; any suffix (e.g. "+") is held static.
 * Respects prefers-reduced-motion (renders the final value immediately).
 */
export function AnimatedCounter({
  value,
  duration = 1.4,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  // Parse leading number + trailing suffix once.
  const match = value.match(/^([\d,]*\.?\d+)(.*)$/);
  const hasNumber = !!match;
  const target = hasNumber ? parseFloat(match![1].replace(/,/g, "")) : 0;
  const suffix = hasNumber ? match![2] : "";
  // Preserve thousands separators / decimals formatting of the original.
  const useCommas = match ? match![1].includes(",") : false;
  const decimals = match ? (match![1].split(".")[1]?.length ?? 0) : 0;

  const count = useMotionValue(0);
  const [display, setDisplay] = useState(
    reduce || !hasNumber ? value : formatNumber(0, decimals, useCommas) + suffix
  );

  useEffect(() => {
    if (!inView || !hasNumber || reduce) return;

    const controls = animate(count, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(formatNumber(latest, decimals, useCommas) + suffix);
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, reduce]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

function formatNumber(n: number, decimals: number, useCommas: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!useCommas) return fixed;
  const [int, dec] = fixed.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withCommas}.${dec}` : withCommas;
}

export default AnimatedCounter;
