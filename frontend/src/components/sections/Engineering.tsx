"use client";

import { motion, useReducedMotion } from "framer-motion";

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
    <section className="py-24 md:py-32 bg-[var(--color-graphite)] text-white">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <div className="mb-24 md:mb-32">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.9]">
            Built As An <br/> <span className="text-[var(--color-industrial)]">ML System.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 md:gap-24">
          <div className="lg:col-span-5">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-12 flex items-center gap-4">
              <div className="w-12 h-[2px] bg-[var(--color-industrial)]" />
              Engineering Depth
            </h3>
            <div className="space-y-8 text-xl md:text-2xl font-medium tracking-tight leading-[1.3] text-gray-300">
              <p>
                Predictive Engine isn&apos;t just a notebook script. It&apos;s a decoupled, API-first machine learning architecture.
              </p>
              <ul className="space-y-6 pt-8 border-t border-gray-800">
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-industrial)] font-mono font-bold mt-1">01</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Automated dataset profiling</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-industrial)] font-mono font-bold mt-1">02</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Leakage-safe deterministic validation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-industrial)] font-mono font-bold mt-1">03</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Operating-condition normalization</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-industrial)] font-mono font-bold mt-1">04</span>
                  <span className="uppercase tracking-widest text-sm md:text-base font-bold">Asynchronous FastAPI backend</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-12 flex items-center gap-4">
              <div className="w-12 h-[2px] bg-[var(--color-industrial)]" />
              Technology Stack
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {technologies.map((tech, i) => (
                <motion.div 
                  key={tech.name}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col border-l border-gray-800 pl-4"
                >
                  <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase mb-2 leading-none text-white">{tech.name}</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)]">{tech.role}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-24 pt-16 border-t border-gray-800">
              <div className="flex flex-col gap-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--color-industrial)]" /> Data Flow Architecture
                </div>
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                  <span className="px-4 py-2 border border-gray-700 font-mono text-sm font-bold tracking-widest whitespace-nowrap text-white">DATA</span>
                  <span className="text-[var(--color-industrial)] text-xl">→</span>
                  <span className="px-4 py-2 border border-gray-700 font-mono text-sm font-bold tracking-widest whitespace-nowrap text-white">PYTHON</span>
                  <span className="text-[var(--color-industrial)] text-xl">→</span>
                  <span className="px-4 py-2 border border-gray-700 font-mono text-sm font-bold tracking-widest whitespace-nowrap text-white">XGBOOST</span>
                  <span className="text-[var(--color-industrial)] text-xl">→</span>
                  <span className="px-4 py-2 border border-gray-700 font-mono text-sm font-bold tracking-widest whitespace-nowrap text-white">FASTAPI</span>
                  <span className="text-[var(--color-industrial)] text-xl">→</span>
                  <span className="px-4 py-2 border border-[var(--color-industrial)] font-mono text-sm font-bold tracking-widest whitespace-nowrap text-[var(--color-industrial)]">REACT</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
