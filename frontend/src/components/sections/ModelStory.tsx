"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function ModelStory() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-[var(--color-surface)] text-[var(--color-graphite)] border-t border-[var(--color-border)]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="mb-24">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Signal <br/> <span className="text-[var(--color-muted)]">Becomes Prediction.</span>
          </h2>
        </div>

        {/* Model Architecture Flow */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h3 className="text-3xl font-bold tracking-tighter uppercase mb-6">Engineered for Industry</h3>
            <p className="text-xl text-[var(--color-muted)] font-medium leading-relaxed mb-8">
              The system learns robust relationships between temporal machine telemetry and remaining useful life. Built as a deterministic XGBoost Regression pipeline.
            </p>
            
            <div className="space-y-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)]">Model</span>
                <span className="text-2xl font-bold tracking-tight">XGBoost Regression</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)]">Target</span>
                <span className="text-2xl font-bold tracking-tight">Remaining Useful Life (RUL)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)]">Input</span>
                <span className="text-2xl font-bold tracking-tight">Industrial Sensor Telemetry</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-offwhite)] rounded-3xl p-8 md:p-12 border border-[var(--color-border)] shadow-sm relative overflow-hidden">
            {/* Visual flow: Sensors -> ML -> Prediction */}
            <div className="flex flex-col gap-6 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center font-bold shadow-sm shrink-0">01</div>
                 <div className="font-bold text-lg tracking-tight uppercase">Sensor Data</div>
               </div>
               <div className="w-1 h-8 bg-[var(--color-border)] ml-8"></div>
               
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center font-bold shadow-sm shrink-0">02</div>
                 <div className="font-bold text-lg tracking-tight uppercase">Feature Representation</div>
               </div>
               <div className="w-1 h-8 bg-[var(--color-border)] ml-8"></div>
               
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-[var(--color-graphite)] text-white flex items-center justify-center font-bold shadow-sm shrink-0">03</div>
                 <div className="font-bold text-lg tracking-tight uppercase">Machine Learning</div>
               </div>
               <div className="w-1 h-8 bg-[var(--color-industrial)] ml-8"></div>
               
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-[var(--color-industrial)] text-white flex items-center justify-center font-bold shadow-sm shrink-0">04</div>
                 <div className="font-bold text-lg tracking-tight uppercase">RUL Prediction</div>
               </div>
            </div>
          </div>
        </div>

        {/* Why XGBoost Section */}
        <div className="pt-24 border-t border-[var(--color-border)]">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-12 text-center">
            Why <span className="text-[var(--color-industrial)]">XGBoost?</span>
          </h3>
          <p className="text-xl text-[var(--color-muted)] font-medium leading-relaxed max-w-3xl mx-auto text-center mb-16">
            We didn&apos;t just assume deep learning was the answer. Experimental validation across temporal sequence models showed that a properly engineered XGBoost baseline substantially outperformed 1D-CNN and LSTM architectures on the C-MAPSS dataset.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border-2 border-[var(--color-industrial)] shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[var(--color-industrial)] text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">Selected</div>
              <h4 className="text-2xl font-bold tracking-tighter uppercase mb-2">XGBoost</h4>
              <p className="text-sm font-bold text-[var(--color-industrial)] mb-8 tracking-widest uppercase">Baseline Model</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">RMSE</span>
                  <span className="text-2xl font-bold text-[var(--color-graphite)]">1.26</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">MAE</span>
                  <span className="text-2xl font-bold text-[var(--color-graphite)]">0.91</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">NASA Score</span>
                  <span className="text-2xl font-bold text-[var(--color-graphite)]">343</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--color-offwhite)] rounded-3xl p-8 border border-[var(--color-border)] opacity-75"
            >
              <h4 className="text-2xl font-bold tracking-tighter uppercase mb-2 text-[var(--color-muted)]">LSTM</h4>
              <p className="text-sm font-bold text-[var(--color-muted)] mb-8 tracking-widest uppercase">Temporal Sequence</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">RMSE</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">24.47</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">MAE</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">17.91</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">NASA Score</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">94,888</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--color-offwhite)] rounded-3xl p-8 border border-[var(--color-border)] opacity-75"
            >
              <h4 className="text-2xl font-bold tracking-tighter uppercase mb-2 text-[var(--color-muted)]">1D-CNN</h4>
              <p className="text-sm font-bold text-[var(--color-muted)] mb-8 tracking-widest uppercase">Temporal Convolution</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">RMSE</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">31.67</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">MAE</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">23.68</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold tracking-widest text-[var(--color-muted)]">NASA Score</span>
                  <span className="text-2xl font-bold text-[var(--color-muted)]">553,854</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
