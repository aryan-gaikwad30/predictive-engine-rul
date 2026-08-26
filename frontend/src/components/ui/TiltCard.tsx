"use client";

import { useRef } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function TiltCard({ children, className = "", intensity = 15 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });
  const y = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates from -0.5 to 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformPerspective: 1000
      }}
      className={`glass-panel rounded-xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}
