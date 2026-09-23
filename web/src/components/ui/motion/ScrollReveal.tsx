"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./variants";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Vertical travel distance in px. */
  y?: number;
  /** Extra classes for the wrapper element. */
  className?: string;
}

/**
 * Fade-in-up wrapper that triggers once when scrolled into view.
 *
 * The workhorse for section headers, copy blocks, and standalone cards.
 * Collapses to an instant no-movement reveal when prefers-reduced-motion is set.
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 28,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduce ? 0 : duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
