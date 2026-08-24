"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  
  // Parallax and scroll-driven transformations
  const yText = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 250]);
  const opacity = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 0]);
  
  // Telemetry visual transformations
  const visualScale = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 1.15]);
  const visualY = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 150]);
  
  // Path morphing/movement based on scroll
  const path1Offset = useTransform(scrollY, [0, 500], [0, 100]);
  const path2Offset = useTransform(scrollY, [0, 500], [0, -80]);
  const path3Offset = useTransform(scrollY, [0, 500], [0, 120]);
  
  // Base spring physics for smooth entrance
  const transitionBase = { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="relative min-h-[100vh] h-fit w-full flex items-center justify-center overflow-hidden pt-32 pb-16" id="product">
      
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-industrial)]/5 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* LEFT: Massive Typography */}
        <motion.div 
          style={{ y: yText, opacity }}
          className="flex flex-col gap-8 md:gap-10 z-20 h-full justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionBase}
          >
            <h1 className="font-bold tracking-tighter leading-[0.85] text-[var(--color-graphite)] uppercase" style={{ fontSize: "clamp(3rem, 8vw, 8.5rem)" }}>
              Know When <br />
              <span className="text-[var(--color-industrial)]">Your Machines</span> <br />
              Need You.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitionBase, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] max-w-xl font-medium tracking-tight leading-relaxed"
          >
            Turn industrial sensor data into remaining-life predictions and maintenance intelligence. Before failure becomes downtime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionBase, delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <button 
              onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 md:px-8 py-3 md:py-4 bg-[var(--color-industrial)] text-white text-base md:text-lg font-bold rounded-full hover:bg-orange-700 transition-colors flex items-center gap-2 group"
            >
              Analyze Your Data
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-[var(--color-border)] text-[var(--color-graphite)] text-base md:text-lg font-bold rounded-full hover:border-[var(--color-graphite)] transition-colors"
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT: SVG Telemetry Visualization */}
        <motion.div 
          initial={{ opacity: 0, filter: prefersReducedMotion ? "none" : "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ ...transitionBase, delay: 0.3 }}
          className="hidden lg:flex relative min-h-[500px] lg:h-[70vh] max-h-[800px] w-full items-center justify-center"
          style={{ scale: visualScale, y: visualY, opacity }}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-visible">
             <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible" preserveAspectRatio="xMidYMid meet">
               
               {/* Background Grid Lines */}
               <path d="M50 0 V600 M150 0 V600 M250 0 V600 M350 0 V600" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
               <path d="M0 100 H400 M0 300 H400 M0 500 H400" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
               
               {/* Animated Telemetry Traces */}
               <motion.path 
                 d="M-50,200 C100,200 200,50 450,150" 
                 stroke="var(--color-graphite)" strokeWidth="2" strokeOpacity="0.2" fill="none"
                 style={prefersReducedMotion ? {} : { translateY: path1Offset }}
               />
               <motion.path 
                 d="M-50,300 C150,300 250,450 450,250" 
                 stroke="var(--color-graphite)" strokeWidth="1.5" strokeOpacity="0.3" fill="none"
                 style={prefersReducedMotion ? {} : { translateY: path2Offset }}
               />
               <motion.path 
                 d="M-50,400 C100,400 300,100 450,350" 
                 stroke="var(--color-graphite)" strokeWidth="2" strokeOpacity="0.15" fill="none"
                 style={prefersReducedMotion ? {} : { translateY: path3Offset }}
               />
               
               {/* The Hero "Signal" line that turns orange */}
               <motion.path 
                 d="M-50,500 C150,500 250,500 350,100" 
                 stroke="url(#gradient-orange)" strokeWidth="4" fill="none" strokeLinecap="round"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
               />

               {/* Moving Data Points */}
               <motion.circle cx="350" cy="100" r="6" fill="var(--color-industrial)" 
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 2.2, type: "spring" }}
               />
               <motion.circle cx="350" cy="100" r="16" fill="var(--color-industrial)" opacity="0.2"
                 initial={{ scale: 0 }}
                 animate={{ scale: [1, 1.5, 1] }}
                 transition={{ delay: 2.2, duration: 2, repeat: Infinity }}
               />

               <defs>
                 <linearGradient id="gradient-orange" x1="0" y1="500" x2="350" y2="100" gradientUnits="userSpaceOnUse">
                   <stop stopColor="var(--color-industrial)" stopOpacity="0" />
                   <stop offset="0.4" stopColor="var(--color-industrial)" stopOpacity="0.5" />
                   <stop offset="1" stopColor="var(--color-industrial)" />
                 </linearGradient>
               </defs>
             </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
