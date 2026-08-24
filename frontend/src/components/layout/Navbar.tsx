"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { scrollY } = useScroll();
  
  // Fade out and shrink navbar background on scroll
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.9]);
  const paddingY = useTransform(scrollY, [0, 100], ["2rem", "1rem"]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 backdrop-blur-md border-b border-transparent"
      style={{
        paddingTop: paddingY,
        paddingBottom: paddingY,
        backgroundColor: useTransform(bgOpacity, (op) => `rgba(245, 245, 245, ${op})`),
        borderBottomColor: useTransform(bgOpacity, (op) => `rgba(0, 0, 0, ${op * 0.1})`)
      }}
    >
      <div className="flex items-center gap-2 font-bold tracking-tighter text-xl">
        <span className="text-[var(--color-industrial)]">PREDICTIVE</span> ENGINE
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-tight">
        <a href="#product" className="hover:text-[var(--color-industrial)] transition-colors">Product</a>
        <a href="#how-it-works" className="hover:text-[var(--color-industrial)] transition-colors">How It Works</a>
        <a href="#analyze" className="hover:text-[var(--color-industrial)] transition-colors">Analyze</a>
        <a href="#insights" className="hover:text-[var(--color-industrial)] transition-colors">Insights</a>
      </div>

      <button 
        onClick={() => {
          document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="px-5 py-2.5 bg-[var(--color-graphite)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-industrial)] transition-all duration-300 transform hover:scale-105"
      >
        Analyze Data
      </button>
    </motion.nav>
  );
}
