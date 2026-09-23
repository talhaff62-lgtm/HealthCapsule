"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Fixed 2px progress bar pinned to the very top of the viewport.
 * Fills left-to-right with the page scroll position, smoothed by a spring.
 * Uses the brand-sky accent so it reads as part of the design system.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-brand-sky"
    />
  );
}

export default ScrollProgressBar;
