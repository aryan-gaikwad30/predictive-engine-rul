"use client";

import { useEffect, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { useRef } from "react";

interface NumberCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  decimals?: number;
}

export default function NumberCounter({ 
  value, 
  duration = 1.5, 
  delay = 0,
  className = "",
  decimals = 0 
}: NumberCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration,
        delay,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(latest.toFixed(decimals));
        }
      });
      return () => controls.stop();
    }
  }, [value, duration, delay, isInView, decimals]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
