"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function ModelStory() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 md:py-32 bg-[var(--color-surface)] text-[var(--color-graphite)] border-t border-[var(--color-border)]">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        
        <div className="mb-24 md:mb-32">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Signal <br/> <span className="text-[var(--color-muted)]">Becomes Prediction.</span>
          </h2>
        </div>

        {/* Model Architecture Flow */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-24 items-center mb-32 md:mb-48">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-8">Engineered for Industry</h3>
            <p className="text-xl md:text-2xl text-[var(--color-muted)] font-medium leading-[1.3] mb-12 max-w-2xl">
              The system learns robust relationships between temporal machine telemetry and remaining useful life. Built as a deterministic XGBoost Regression pipeline.
            </p>
            
            <div className="space-y-8 border-l-2 border-[var(--color-industrial)] pl-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Model</span>
                <span className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">XGBoost Regression</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Target</span>
                <span className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">Remaining Useful Life (RUL)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Input</span>
                <span className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">Industrial Sensor Telemetry</span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 border border-[var(--color-border)] bg-[var(--color-offwhite)] relative overflow-hidden">
            {/* Visual flow: Sensors -> ML -> Prediction */}
            <div className="flex flex-col gap-6 relative z-10">
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 border border-[var(--color-graphite)] flex items-center justify-center font-bold text-xs tracking-widest shrink-0 font-mono">01</div>
                 <div className="font-bold text-xl tracking-tight uppercase">Sensor Data</div>
               </div>
               <div className="w-[1px] h-8 bg-[var(--color-border)] ml-6"></div>
               
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 border border-[var(--color-graphite)] flex items-center justify-center font-bold text-xs tracking-widest shrink-0 font-mono">02</div>
                 <div className="font-bold text-xl tracking-tight uppercase">Feature Representation</div>
               </div>
               <div className="w-[1px] h-8 bg-[var(--color-border)] ml-6"></div>
               
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-[var(--color-graphite)] text-white flex items-center justify-center font-bold text-xs tracking-widest shrink-0 font-mono">03</div>
                 <div className="font-bold text-xl tracking-tight uppercase text-[var(--color-graphite)]">Machine Learning</div>
               </div>
               <div className="w-[1px] h-8 bg-[var(--color-industrial)] ml-6"></div>
               
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-[var(--color-industrial)] text-white flex items-center justify-center font-bold text-xs tracking-widest shrink-0 font-mono">04</div>
                 <div className="font-bold text-xl tracking-tight uppercase text-[var(--color-industrial)]">RUL Prediction</div>
               </div>
            </div>
          </div>
        </div>

        {/* Why XGBoost Section */}
        <div className="pt-24 border-t border-[var(--color-border)]">
          <div className="max-w-3xl mb-16 md:mb-24">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase mb-8">
              Why <span className="text-[var(--color-industrial)]">XGBoost?</span>
            </h3>
            <p className="text-xl md:text-2xl text-[var(--color-graphite)] font-medium leading-[1.3]">
              We didn&apos;t just assume deep learning was the answer. Experimental validation across temporal sequence models showed that a properly engineered XGBoost baseline substantially outperformed 1D-CNN and LSTM architectures on the C-MAPSS dataset.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-8 border border-[var(--color-industrial)] relative overflow-hidden bg-[var(--color-offwhite)]"
            >
              <div className="absolute top-0 right-0 bg-[var(--color-industrial)] text-white text-xs font-bold uppercase tracking-widest px-4 py-2">Selected</div>
              <h4 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-1">XGBoost</h4>
              <p className="text-xs font-bold text-[var(--color-industrial)] mb-12 tracking-widest uppercase">Baseline Model</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">RMSE</span>
                  <span className="text-3xl font-bold text-[var(--color-graphite)] font-mono">1.26</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">MAE</span>
                  <span className="text-3xl font-bold text-[var(--color-graphite)] font-mono">0.91</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">NASA Score</span>
                  <span className="text-3xl font-bold text-[var(--color-graphite)] font-mono">343</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 border border-[var(--color-border)]"
            >
              <h4 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-1 text-[var(--color-muted)]">LSTM</h4>
              <p className="text-xs font-bold text-[var(--color-muted)] mb-12 tracking-widest uppercase">Temporal Sequence</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">RMSE</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">24.47</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">MAE</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">17.91</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">NASA Score</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">94,888</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 border border-[var(--color-border)]"
            >
              <h4 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-1 text-[var(--color-muted)]">1D-CNN</h4>
              <p className="text-xs font-bold text-[var(--color-muted)] mb-12 tracking-widest uppercase">Temporal Convolution</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">RMSE</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">31.67</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">MAE</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">23.68</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-border)]">NASA Score</span>
                  <span className="text-3xl font-bold text-[var(--color-muted)] font-mono">553,854</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
