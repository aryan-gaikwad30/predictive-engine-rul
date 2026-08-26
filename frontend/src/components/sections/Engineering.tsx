"use client";

import { motion, useReducedMotion } from "framer-motion";
import TiltCard from "../ui/TiltCard";

export default function Engineering() {
  const prefersReducedMotion = useReducedMotion();

  const technologies = [
    { name: "Python", role: "Core Language" },
    { name: "Pandas & NumPy", role: "Data Processing" },
    { name: "Scikit-Learn", role: "Validation & Profiling" },
    { name: "XGBoost", role: "ML Engine" },
    { name: "FastAPI", role: "Backend API" },
    { name: "React", role: "Product Interface" },
    { name: "Framer Motion", role: "Interaction" },
    { name: "Recharts", role: "Visualization" }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent border-t border-[var(--color-border)] text-[var(--color-text)]" id="engineering">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <div className="mb-24 md:mb-32">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.9]">
            Built As An <br/> <span className="text-[var(--color-primary)] text-glow-primary">ML System.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 md:gap-24">
          <div className="lg:col-span-5">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-12 flex items-center gap-4">
              <div className="w-12 h-[2px] bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)]" />
              Engineering Depth
            </h3>
            <div className="space-y-8 text-xl md:text-2xl font-medium tracking-tight leading-[1.3] text-[var(--color-muted)]">
              <p>
                Predictive Engine isn&apos;t just a notebook script. It&apos;s a decoupled, API-first machine learning architecture.
              </p>
              <ul className="space-y-6 pt-8 border-t border-[var(--color-border)] text-[var(--color-text)]">
                <li className="flex items-start gap-4 glass-panel p-4 rounded-md group hover:border-[var(--color-primary)] transition-colors">
                  <span className="text-[var(--color-primary)] font-mono font-bold mt-1 group-hover:text-glow-primary">01</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Automated dataset profiling</span>
                </li>
                <li className="flex items-start gap-4 glass-panel p-4 rounded-md group hover:border-[var(--color-primary)] transition-colors">
                  <span className="text-[var(--color-primary)] font-mono font-bold mt-1 group-hover:text-glow-primary">02</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Leakage-safe deterministic validation</span>
                </li>
                <li className="flex items-start gap-4 glass-panel p-4 rounded-md group hover:border-[var(--color-primary)] transition-colors">
                  <span className="text-[var(--color-primary)] font-mono font-bold mt-1 group-hover:text-glow-primary">03</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Operating-condition normalization</span>
                </li>
                <li className="flex items-start gap-4 glass-panel p-4 rounded-md group hover:border-[var(--color-primary)] transition-colors">
                  <span className="text-[var(--color-primary)] font-mono font-bold mt-1 group-hover:text-glow-primary">04</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Asynchronous FastAPI backend</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-12 flex items-center gap-4">
              <div className="w-12 h-[2px] bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)]" />
              Technology Stack
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {technologies.map((tech, i) => (
                <TiltCard key={tech.name} intensity={10} className="p-4 border-l-2 border-l-[var(--color-primary)] bg-transparent border-y-0 border-r-0 rounded-none shadow-none hover:bg-[rgba(232,93,4,0.05)] transition-colors">
                  <motion.div 
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex flex-col"
                  >
                    <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase mb-2 leading-none text-[var(--color-text)]">{tech.name}</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">{tech.role}</span>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
            
            <div className="mt-24 pt-16 border-t border-[var(--color-border)]">
              <div className="flex flex-col gap-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)]" /> Data Flow Architecture
                </div>
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                  <span className="px-4 py-2 glass-panel font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-text)] rounded-sm">DATA</span>
                  <span className="text-[var(--color-primary)] text-xl text-glow-primary">→</span>
                  <span className="px-4 py-2 glass-panel font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-text)] rounded-sm">PYTHON</span>
                  <span className="text-[var(--color-primary)] text-xl text-glow-primary">→</span>
                  <span className="px-4 py-2 glass-panel font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-text)] rounded-sm">XGBOOST</span>
                  <span className="text-[var(--color-primary)] text-xl text-glow-primary">→</span>
                  <span className="px-4 py-2 glass-panel font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-text)] rounded-sm">FASTAPI</span>
                  <span className="text-[var(--color-primary)] text-xl text-glow-primary">→</span>
                  <span className="px-4 py-2 glass-panel border-[var(--color-primary)] shadow-[0_0_10px_rgba(232,93,4,0.2)] font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-primary)] rounded-sm text-glow-primary">REACT</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
