"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  
  // Parallax and scroll-driven transformations
  const yText = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 150]);
  const opacity = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 0]);
  
  // Telemetry visual transformations
  const visualScale = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 1.05]);
  const visualY = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 100]);
  
  // Base spring physics for smooth entrance
  const transitionBase = { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-32 pb-16" id="product">
      <div className="container mx-auto px-6 md:px-8 relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center max-w-[1440px]">
        
        {/* LEFT: Massive Typography */}
        <motion.div 
          style={{ y: yText, opacity }}
          className="flex flex-col gap-8 md:gap-12 z-20 h-full justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionBase}
          >
            <h1 className="font-bold tracking-tighter text-[var(--color-graphite)] uppercase leading-[0.9]" style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}>
              Predictive<br />
              <span className="text-[var(--color-industrial)]">Maintenance</span><br />
              For Real<br />
              Machine Data.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitionBase, delay: 0.2 }}
            className="text-base md:text-xl text-[var(--color-muted)] max-w-lg font-medium tracking-tight leading-relaxed"
          >
            Train an RUL model on your industrial data,
            evaluate it on unseen machines,
            and turn predictions into maintenance decisions.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionBase, delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <button 
              onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 md:px-8 py-3 md:py-4 bg-[var(--color-graphite)] text-white text-xs md:text-sm tracking-widest uppercase font-bold rounded-none hover:bg-[var(--color-industrial)] transition-colors flex items-center gap-3 group"
            >
              Analyze Your Data
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 md:px-8 py-3 md:py-4 bg-transparent border border-[var(--color-border)] text-[var(--color-graphite)] text-xs md:text-sm tracking-widest uppercase font-bold rounded-none hover:border-[var(--color-graphite)] transition-colors"
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT: SVG Telemetry Visualization */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transitionBase, delay: 0.3 }}
          className="hidden lg:flex relative h-[600px] w-full items-center justify-center"
          style={{ scale: visualScale, y: visualY, opacity }}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-visible">
             <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible" preserveAspectRatio="xMidYMid meet">
               
               {/* Background Grid Lines (Subtle) */}
               <path d="M50 0 V600 M150 0 V600 M250 0 V600 M350 0 V600" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
               <path d="M0 100 H400 M0 300 H400 M0 500 H400" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
               
               {/* The Hero "Signal" line that shows degradation */}
               <motion.path 
                 d="M0,150 L100,150 L120,130 L140,170 L160,150 L250,150 L300,250 L350,450" 
                 stroke="var(--color-graphite)" strokeWidth="2" fill="none" strokeLinecap="square" strokeLinejoin="miter"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
               />
               
               {/* Predictive orange path showing remaining life */}
               <motion.path 
                 d="M350,450 L380,550" 
                 stroke="var(--color-industrial)" strokeWidth="2" fill="none" strokeDasharray="4 4"
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ duration: 1, ease: "easeOut", delay: 2.1 }}
               />

               {/* Indicator point for current state */}
               <motion.circle cx="350" cy="450" r="4" fill="var(--color-industrial)" 
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 2.1, type: "spring" }}
               />
               <motion.circle cx="350" cy="450" r="12" fill="none" stroke="var(--color-industrial)" strokeWidth="1" opacity="0.5"
                 initial={{ scale: 0 }}
                 animate={{ scale: [1, 1.5, 1] }}
                 transition={{ delay: 2.1, duration: 2, repeat: Infinity }}
               />
             </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
