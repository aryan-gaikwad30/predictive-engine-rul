"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code } from "lucide-react";

export default function About() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-[var(--color-surface)]" id="about">
      {/* About The Builder */}
      <div className="py-32 border-t border-[var(--color-border)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9] mb-8 text-[var(--color-graphite)]">
                Built By An <br/>
                <span className="text-[var(--color-muted)]">Engineer Who Likes To Know What&apos;s Under The Hood.</span>
              </h2>
              
              <div className="mb-10">
                <div className="text-sm font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">Name</div>
                <div className="text-3xl font-bold tracking-tighter text-[var(--color-graphite)]">Aryan</div>
              </div>
              <div className="mb-10">
                <div className="text-sm font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">Role</div>
                <div className="text-2xl font-bold tracking-tight text-[var(--color-graphite)]">Engineer / AIML Developer</div>
              </div>
              
              <p className="text-xl font-medium tracking-tight text-[var(--color-muted)] leading-relaxed max-w-lg mb-12">
                I build machine-learning systems that move beyond notebooks — from data pipelines and model evaluation to APIs and interactive product experiences.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 border-2 border-[var(--color-border)] rounded-full text-sm font-bold uppercase tracking-widest text-[var(--color-graphite)] hover:border-[var(--color-graphite)] transition-colors group">
                  View Source
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 border-2 border-[var(--color-border)] rounded-full text-sm font-bold uppercase tracking-widest text-[#0077b5] hover:border-[#0077b5] transition-colors group">
                  Connect on LinkedIn
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="bg-[var(--color-offwhite)] rounded-3xl p-12 border border-[var(--color-border)] relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <Code className="w-8 h-8 text-[var(--color-industrial)]" />
                <h3 className="text-2xl font-bold tracking-tight uppercase">Predictive Engine</h3>
              </div>
              
              <p className="text-[var(--color-muted)] font-medium mb-8 leading-relaxed">
                Explore the complete repository, including all model experiments, data pipelines, API specifications, and the Next.js frontend code.
              </p>
              
              <ul className="space-y-4 mb-12 font-bold tracking-widest uppercase text-sm text-[var(--color-graphite)]">
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span>Source Code</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)]" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span>Model Experiments</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)]" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span>API Documentation</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)]" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span>Frontend Architecture</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)]" />
                </li>
              </ul>
              
              <a href="#" target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 bg-[var(--color-graphite)] text-white font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
                View Repository
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 bg-[var(--color-industrial)] text-white text-center border-t-4 border-white">
        <div className="container mx-auto px-6 max-w-4xl">
           <motion.h2 
             initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-12 leading-[0.9]"
           >
             Ready To See <br/> What Your Data <br/> Knows?
           </motion.h2>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto px-10 py-5 bg-white text-[var(--color-industrial)] text-lg font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 group shadow-lg"
             >
               Analyze Your Data
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
             
             <a href="#" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-white text-white text-lg font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-[var(--color-industrial)] transition-colors flex items-center justify-center">
               View The Source
             </a>
           </div>
        </div>
      </div>
    </section>
  );
}
