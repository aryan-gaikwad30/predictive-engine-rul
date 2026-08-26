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
    <section className="py-24 md:py-48 bg-[var(--color-surface)] text-[var(--color-graphite)] border-t border-[var(--color-border)]">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <div className="mb-24 md:mb-40">
          <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.9]">
            Engineering <br />
            <span className="text-[var(--color-muted)]">Journey.</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[var(--color-border)] md:-translate-x-1/2"></div>
          
          <div className="space-y-16 md:space-y-24">
            {phases.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={item.phase}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col md:flex-row items-start md:items-center md:justify-between"
                >
                  <div className={`w-full md:w-[45%] pl-24 md:pl-0 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:order-2 md:pl-16'}`}>
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-4 font-mono">{item.phase}</div>
                    <h4 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4 uppercase">{item.title}</h4>
                    <p className="text-base md:text-lg font-medium text-[var(--color-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                  
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-[var(--color-surface)] border-2 border-[var(--color-graphite)] transform -translate-x-1/2 mt-2 md:mt-0 z-10 transition-colors duration-300 hover:bg-[var(--color-industrial)] hover:border-[var(--color-industrial)]"></div>
                  
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
