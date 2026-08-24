"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function ProjectJourney() {
  const prefersReducedMotion = useReducedMotion();

  const phases = [
    { phase: "PHASE 01", title: "C-MAPSS exploration", desc: "Data analysis and NASA dataset benchmarking." },
    { phase: "PHASE 02", title: "RUL target analysis", desc: "Defining Remaining Useful Life formulation." },
    { phase: "PHASE 03", title: "XGBoost baseline", desc: "Establishing the primary regression metrics." },
    { phase: "PHASE 04", title: "Temporal CNN", desc: "Experimental 1D-CNN temporal validation." },
    { phase: "PHASE 05", title: "LSTM", desc: "Experimental recurrent network validation." },
    { phase: "PHASE 06", title: "FD002 normalization", desc: "Multi-operating condition k-means clustering." },
    { phase: "PHASE 07", title: "Custom dataset abstraction", desc: "Building the engine to accept any industrial CSV." },
    { phase: "PHASE 08", title: "FastAPI backend", desc: "Serving the pipeline through a REST API." },
    { phase: "PHASE 09", title: "Interactive product frontend", desc: "This experience." }
  ];

  return (
    <section className="py-24 bg-[var(--color-surface)] text-[var(--color-graphite)] border-t border-[var(--color-border)]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
            Engineering Journey
          </h2>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[var(--color-border)] md:-translate-x-1/2"></div>
          
          <div className="space-y-12">
            {phases.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={item.phase}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-center md:justify-between flex-col md:flex-row"
                >
                  <div className={`w-full md:w-[45%] pl-24 md:pl-0 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:order-2 md:pl-12'}`}>
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">{item.phase}</div>
                    <h4 className="text-xl font-bold tracking-tight mb-2">{item.title}</h4>
                    <p className="text-sm font-medium text-[var(--color-muted)]">{item.desc}</p>
                  </div>
                  
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-white border-2 border-[var(--color-industrial)] transform -translate-x-1/2 mt-6 md:mt-0 z-10"></div>
                  
                  <div className={`hidden md:block w-[45%] ${isEven ? 'order-2' : 'order-1'}`}></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
