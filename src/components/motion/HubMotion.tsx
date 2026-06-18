"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, transitionFast } from "@/lib/motion";
import { cn } from "@/lib/utils";

type BaseProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      transition={{ ...transitionFast, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={fadeUp} transition={transitionFast} className={className}>
      {children}
    </motion.div>
  );
}

export function HoverLift({ children, className }: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({ children, className, delay = 0 }: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={scaleIn}
      transition={{ ...transitionFast, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn("hub-card", className)}>{children}</div>;
  }

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={fadeUp}
      transition={{ ...transitionFast, delay }}
      whileHover={{ y: -1 }}
      className={cn("hub-card", className)}
    >
      {children}
    </motion.section>
  );
}
