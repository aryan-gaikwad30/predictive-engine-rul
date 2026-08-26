"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import TiltCard from "../ui/TiltCard";

const FadeText = ({ children, delay = 0, index }: { children: React.ReactNode, delay?: number, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : (index % 2 === 0 ? -50 : 50) }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : (index % 2 === 0 ? -50 : 50) }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="py-16 md:py-24 border-b border-[var(--color-border)] last:border-none"
    >
      {children}
    </motion.div>
  );
};

export default function Storytelling() {
  return (
    <section className="py-24 md:py-40 bg-transparent text-[var(--color-text)] relative overflow-hidden" id="how-it-works">
      
      {/* Abstract Background Math Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
        <div className="text-[200px] leading-none font-mono font-bold whitespace-nowrap select-none">
          ∫f(x)dx ∑(x_i - μ)² ∇·E=ρ/ε₀
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 max-w-[1440px] relative z-10">
        <div className="mb-16 md:mb-32">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
            Signal To <br/> <span className="text-[var(--color-primary)] text-glow-primary">Intelligence.</span>
          </h2>
        </div>

        <div className="flex flex-col relative z-10">
          <FadeText index={0}>
            <TiltCard intensity={5} className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-baseline glass-panel p-8 md:p-12 border-l-2 border-[var(--color-primary)] rounded-md">
              <h3 className="w-48 shrink-0 text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] font-mono">01. Telemetry Capture</h3>
              <p className="text-3xl md:text-5xl lg:text-5xl font-medium tracking-tighter text-[var(--color-text)] leading-[1.1]">
                Temperature, pressure, vibration, load. Millions of observations captured every hour across the industrial fleet.
              </p>
            </TiltCard>
          </FadeText>

          <FadeText index={1}>
            <TiltCard intensity={5} className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-baseline glass-panel p-8 md:p-12 border-l-2 border-[var(--color-primary)] rounded-md md:ml-24">
              <h3 className="w-48 shrink-0 text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] font-mono">02. Noise Reduction</h3>
              <p className="text-3xl md:text-5xl lg:text-5xl font-medium tracking-tighter text-[var(--color-text)] leading-[1.1]">
                Raw data alone doesn&apos;t tell you when failure is coming. But within the stochastic noise, deterministic patterns emerge.
              </p>
            </TiltCard>
          </FadeText>

          <FadeText index={2}>
            <TiltCard intensity={5} className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-baseline glass-panel p-8 md:p-12 border-l-2 border-[var(--color-primary)] rounded-md">
              <h3 className="w-48 shrink-0 text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] font-mono">03. Trajectory Mapping</h3>
              <p className="text-3xl md:text-5xl lg:text-5xl font-medium tracking-tighter text-[var(--color-text)] leading-[1.1]">
                Signals converge. Microscopic degradation becomes measurable across multiple sensors simultaneously.
              </p>
            </TiltCard>
          </FadeText>
          
          <FadeText index={3}>
            <TiltCard intensity={5} className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-baseline glass-panel p-8 md:p-12 border-l-2 border-[var(--color-primary)] shadow-[0_0_15px_rgba(232,93,4,0.1)] rounded-md md:ml-24">
              <h3 className="w-48 shrink-0 text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] font-mono">04. Predictive Action</h3>
              <p className="text-3xl md:text-5xl lg:text-5xl font-medium tracking-tighter text-[var(--color-text)] leading-[1.1]">
                The abstract pattern becomes a concrete timeline. Know exactly how many cycles remain until critical failure.
              </p>
            </TiltCard>
          </FadeText>
        </div>
      </div>
    </section>
  );
}
