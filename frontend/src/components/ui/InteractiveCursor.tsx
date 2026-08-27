"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function InteractiveCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  if (!isClient || prefersReducedMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-0 h-96 w-96 rounded-full mix-blend-multiply opacity-50 dark:mix-blend-screen"
      animate={{
        x: mousePosition.x - 192,
        y: mousePosition.y - 192,
      }}
      transition={{ type: "tween", ease: "circOut", duration: 0.15 }}
      style={{
        background: "radial-gradient(circle, rgba(232, 93, 4, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
      }}
    />
  );
}
