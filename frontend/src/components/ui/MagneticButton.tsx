"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useReducedMotion, HTMLMotionProps } from "framer-motion";

interface MagneticButtonProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  strength?: number;
  disabled?: boolean;
}

export default function MagneticButton({ children, strength = 0.5, className, disabled, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);
  
  useEffect(() => {
    if (prefersReducedMotion) {
      x.set(0);
      y.set(0);
    }
  }, [prefersReducedMotion, x, y]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull
    setPosition({
      x: (clientX - centerX) * strength,
      y: (clientY - centerY) * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.5 : 1 }}
      {...props}
    >
      <motion.div style={{ x, y }} className="w-full h-full flex items-center justify-center">
        {children}
      </motion.div>
    </motion.div>
  );
}
