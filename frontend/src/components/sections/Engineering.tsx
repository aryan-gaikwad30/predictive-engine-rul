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
    <section className="py-32 bg-[var(--color-graphite)] text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-24">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Built As An <br/> <span className="text-[var(--color-industrial)]">ML System.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-8">
              Engineering Depth
            </h3>
            <div className="space-y-6 text-xl font-medium tracking-tight leading-relaxed text-gray-300">
              <p>
                Predictive Engine isn&apos;t just a notebook script. It&apos;s a decoupled, API-first machine learning architecture.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-industrial)]">✓</span>
                  <span>Automated dataset profiling</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-industrial)]">✓</span>
                  <span>Leakage-safe deterministic validation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-industrial)]">✓</span>
                  <span>Operating-condition normalization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-industrial)]">✓</span>
                  <span>Asynchronous FastAPI backend</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-[var(--color-muted)] mb-8">
              Technology Stack
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              {technologies.map((tech, i) => (
                <motion.div 
                  key={tech.name}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col"
                >
                  <span className="text-2xl font-bold tracking-tight mb-2">{tech.name}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{tech.role}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 pt-16 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1 space-y-2 w-full">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Data Flow</div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                    <span className="font-bold tracking-tighter whitespace-nowrap">DATA</span>
                    <span className="text-[var(--color-industrial)]">→</span>
                    <span className="font-bold tracking-tighter whitespace-nowrap">PYTHON</span>
                    <span className="text-[var(--color-industrial)]">→</span>
                    <span className="font-bold tracking-tighter whitespace-nowrap">XGBOOST</span>
                    <span className="text-[var(--color-industrial)]">→</span>
                    <span className="font-bold tracking-tighter whitespace-nowrap">FASTAPI</span>
                    <span className="text-[var(--color-industrial)]">→</span>
                    <span className="font-bold tracking-tighter whitespace-nowrap text-[var(--color-industrial)]">REACT</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
