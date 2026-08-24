"use client";

import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const FadeText = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-16"
    >
      {children}
    </motion.div>
  );
};

export default function Storytelling() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"]
  });
  
  const prefersReducedMotion = useReducedMotion();
  
  // Transform paths to simulate "convergence" of signals based on scroll
  const path1Top = useTransform(scrollYProgress, [0, 0.4, 0.8], ["10%", "30%", "50%"]);
  const path2Top = useTransform(scrollYProgress, [0, 0.4, 0.8], ["30%", "40%", "50%"]);
  const path3Top = useTransform(scrollYProgress, [0, 0.4, 0.8], ["70%", "60%", "50%"]);
  const path4Top = useTransform(scrollYProgress, [0, 0.4, 0.8], ["90%", "70%", "50%"]);
  
  // Show degradation line when converged
  const anomalyOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const anomalyPathLength = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  
  // RUL prediction fade in
  const rulOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const rulScale = useTransform(scrollYProgress, [0.85, 0.95], [0.8, 1]);

  return (
    <section ref={containerRef} className="py-24 bg-[var(--color-offwhite)] text-[var(--color-graphite)] relative" id="how-it-works">
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-24">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Every Machine <br/> <span className="text-[var(--color-muted)]">Leaves A Signal.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
          <div className="space-y-32 pb-32">
            <FadeText>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[var(--color-industrial)]">01. Data</h3>
              <p className="text-3xl lg:text-4xl font-medium tracking-tight text-[var(--color-graphite)] leading-tight">
                Temperature, pressure, vibration, load. Millions of observations captured every hour.
              </p>
            </FadeText>

            <FadeText>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[var(--color-industrial)]">02. Signal</h3>
              <p className="text-3xl lg:text-4xl font-medium tracking-tight text-[var(--color-graphite)] leading-tight">
                Raw data alone doesn&apos;t tell you when failure is coming. But within the noise, patterns emerge.
              </p>
            </FadeText>

            <FadeText>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[var(--color-industrial)]">03. Pattern</h3>
              <p className="text-3xl lg:text-4xl font-medium tracking-tight text-[var(--color-graphite)] leading-tight">
                Signals converge. Microscopic degradation becomes measurable across multiple sensors simultaneously.
              </p>
            </FadeText>
            
            <FadeText>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[var(--color-industrial)]">04. Prediction</h3>
              <p className="text-3xl lg:text-4xl font-medium tracking-tight text-[var(--color-graphite)] leading-tight">
                The pattern becomes a timeline. Know exactly how many cycles remain until critical failure.
              </p>
            </FadeText>
          </div>
          
          {/* Scroll-linked convergence visualization */}
          <div className="hidden lg:block relative">
             <div className="sticky top-[calc(var(--nav-height)+2rem)] w-full h-[600px] max-h-[calc(100vh-var(--nav-height)-4rem)] border border-[var(--color-border)] rounded-3xl p-8 bg-white shadow-sm flex flex-col justify-between overflow-hidden">
                
                {/* SVG lines converging */}
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
                  <motion.line x1="0" y1={prefersReducedMotion ? "50%" : path1Top as any} x2="100" y2="50" stroke="var(--color-graphite)" strokeWidth="0.2" opacity="0.2" />
                  <motion.line x1="0" y1={prefersReducedMotion ? "50%" : path2Top as any} x2="100" y2="50" stroke="var(--color-graphite)" strokeWidth="0.3" opacity="0.3" />
                  <motion.line x1="0" y1={prefersReducedMotion ? "50%" : path3Top as any} x2="100" y2="50" stroke="var(--color-graphite)" strokeWidth="0.3" opacity="0.3" />
                  <motion.line x1="0" y1={prefersReducedMotion ? "50%" : path4Top as any} x2="100" y2="50" stroke="var(--color-graphite)" strokeWidth="0.2" opacity="0.2" />
                  
                  {/* The degradation curve (appears near the end) */}
                  <motion.path 
                    d="M10,50 Q40,50 60,60 T100,90"
                    stroke="var(--color-industrial)"
                    strokeWidth="1.5"
                    fill="none"
                    style={{ opacity: prefersReducedMotion ? 1 : anomalyOpacity, pathLength: prefersReducedMotion ? 1 : anomalyPathLength }}
                  />
                </svg>
                {/* eslint-enable @typescript-eslint/no-explicit-any */}

                <div className="relative z-10 w-full h-full flex items-end justify-end pb-4 pr-4">
                  {/* Final Prediction Reveal */}
                  <motion.div 
                    className="text-right"
                    style={{ opacity: prefersReducedMotion ? 1 : rulOpacity, scale: prefersReducedMotion ? 1 : rulScale }}
                  >
                    <div className="text-7xl xl:text-8xl font-bold tracking-tighter text-[var(--color-graphite)] leading-none">42</div>
                    <div className="text-sm xl:text-base font-bold tracking-widest uppercase text-[var(--color-industrial)] mt-2">Cycles Remaining</div>
                  </motion.div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
