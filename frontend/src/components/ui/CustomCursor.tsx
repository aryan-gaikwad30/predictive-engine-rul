"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mousePos.x, springConfig);
  const smoothY = useSpring(mousePos.y, springConfig);

  useEffect(() => {
    setIsClient(true);
    
    const updateMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      smoothX.set(e.clientX);
      smoothY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || 
          target.tagName.toLowerCase() === 'button' || 
          target.closest('a') || 
          target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("mouseover", handleMouseOver);

    // Hide default cursor globally
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, [smoothX, smoothY]);

  if (!isClient) return null;

  return (
    <>
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[var(--color-primary)] rounded-full pointer-events-none z-[9999]"
        style={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          boxShadow: "0 0 10px var(--color-primary)"
        }}
      />
      {/* Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[var(--color-primary)] rounded-full pointer-events-none z-[9998]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.4,
          borderColor: isHovering ? "var(--color-secondary)" : "var(--color-primary)",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
