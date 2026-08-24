"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  
  // Transform background and borders for a pill-effect on scroll
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.95]);
  const bgColor = useTransform(bgOpacity, (op) => `rgba(255, 255, 255, ${op})`);
  const paddingY = useTransform(scrollY, [0, 50], ["1.5rem", "0.75rem"]);
  const maxWidth = useTransform(scrollY, [0, 50], ["100%", "900px"]);
  const borderRadius = useTransform(scrollY, [0, 50], ["0px", "9999px"]);
  const borderWidth = useTransform(scrollY, [0, 50], ["0px", "1px"]);

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-7xl px-4 md:px-6 mt-4 flex justify-center pointer-events-none">
      <motion.nav
        className="flex items-center justify-between px-6 md:px-8 backdrop-blur-md pointer-events-auto overflow-hidden"
        style={prefersReducedMotion ? {
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "var(--color-border)",
          borderWidth: "1px",
          borderRadius: "9999px",
          width: "100%",
          maxWidth: "900px"
        } : {
          paddingTop: paddingY,
          paddingBottom: paddingY,
          backgroundColor: bgColor,
          borderColor: "var(--color-border)",
          borderWidth: borderWidth,
          borderRadius: borderRadius,
          width: "100%",
          maxWidth: maxWidth
        }}
      >
        <div className="flex-shrink-0 flex items-center gap-2 font-bold tracking-tighter text-xl">
          <span className="text-[var(--color-industrial)]">PREDICTIVE</span> ENGINE
        </div>
        
        <div className="hidden lg:flex flex-1 justify-center items-center gap-8 text-sm font-semibold tracking-tight text-[var(--color-graphite)] whitespace-nowrap px-4">
          <a href="#product" className="hover:text-[var(--color-industrial)] transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-[var(--color-industrial)] transition-colors">How It Works</a>
          <a href="#analyze" className="hover:text-[var(--color-industrial)] transition-colors">Analyze</a>
          <a href="#results" className="hover:text-[var(--color-industrial)] transition-colors">Insights</a>
        </div>

        <div className="flex-shrink-0">
          <button 
            onClick={() => {
              document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-[var(--color-graphite)] text-white text-xs md:text-sm font-bold rounded-full hover:bg-[var(--color-industrial)] transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
          >
            Analyze Data
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
