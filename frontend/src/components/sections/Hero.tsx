"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";

export default function Hero() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  
  // Parallax and scroll-driven transformations
  const yText = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 150]);
  const opacity = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 0]);
  
  // Base spring physics for smooth entrance
  const transitionBase = { duration: 1.2, ease: "circOut" as const };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-32 pb-16" id="product">
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" as const }}
          className="absolute w-[600px] h-[600px] rounded-full bg-[var(--color-primary)] blur-[120px] -top-32 -right-32 opacity-20"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" as const }}
          className="absolute w-[800px] h-[800px] rounded-full bg-[var(--color-secondary)] blur-[150px] -bottom-64 -left-32 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10 max-w-[1440px]">
        
        <motion.div 
          style={{ y: yText, opacity }}
          className="flex flex-col gap-10 md:gap-14 z-20 h-full justify-center max-w-5xl mx-auto text-center items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={transitionBase}
          >
            <h1 className="font-bold tracking-tighter text-[var(--color-text)] uppercase leading-[0.9]" style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}>
              Predictive<br />
              <span className="text-[var(--color-primary)] text-glow-primary">Maintenance</span><br />
              For Real<br />
              Machine Data.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ ...transitionBase, delay: 0.2 }}
            className="text-lg md:text-2xl text-[var(--color-muted)] max-w-2xl font-medium tracking-tight leading-relaxed"
          >
            Train an RUL model on your industrial data,
            evaluate it on unseen machines,
            and turn predictions into maintenance decisions.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionBase, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mt-4"
          >
            <MagneticButton strength={0.4}>
              <button 
                onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 md:px-10 py-4 md:py-5 border border-[var(--color-primary)] text-[var(--color-primary)] text-xs md:text-sm tracking-widest uppercase font-bold rounded-none hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-3 group glass-panel-glow"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </MagneticButton>
            
            <MagneticButton strength={0.4}>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 md:px-10 py-4 md:py-5 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] text-xs md:text-sm tracking-widest uppercase font-bold rounded-none hover:bg-[rgba(232,93,4,0.1)] transition-colors glass-panel"
              >
                System Overview
              </button>
            </MagneticButton>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
