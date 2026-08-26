"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code } from "lucide-react";

export default function About() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-[var(--color-surface)]" id="about">
      {/* About The Builder */}
      <div className="py-24 md:py-40 border-t border-[var(--color-border)]">
        <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            <motion.div 
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-12 text-[var(--color-graphite)]">
                Built By An <br/>
                <span className="text-[var(--color-muted)] text-4xl md:text-5xl lg:text-7xl">Engineer Who Likes To Know What&apos;s Under The Hood.</span>
              </h2>
              
              <div className="flex flex-col md:flex-row gap-12 mb-12 pt-12 border-t border-[var(--color-border)]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-3 font-mono">Name</div>
                  <div className="text-3xl font-bold tracking-tighter text-[var(--color-graphite)] uppercase">Aryan</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-3 font-mono">Role</div>
                  <div className="text-xl md:text-2xl font-bold tracking-tighter text-[var(--color-graphite)] uppercase mt-1 md:mt-2">Engineer / AIML Developer</div>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl font-medium tracking-tight text-[var(--color-muted)] leading-[1.3] max-w-2xl mb-16">
                I build machine-learning systems that move beyond notebooks — from data pipelines and model evaluation to APIs and interactive product experiences.
              </p>

              <div className="flex flex-wrap gap-6">
                <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-5 border border-[var(--color-border)] bg-transparent text-sm font-bold uppercase tracking-widest text-[var(--color-graphite)] hover:border-[var(--color-graphite)] transition-colors group">
                  View Source
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="YOUR_LINKEDIN_URL_HERE" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-5 border border-[#0077b5] bg-transparent text-sm font-bold uppercase tracking-widest text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-colors group">
                  Connect on LinkedIn
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="bg-[var(--color-offwhite)] p-10 md:p-16 border border-[var(--color-border)] relative"
            >
              <div className="flex items-center gap-6 mb-10">
                <Code className="w-10 h-10 text-[var(--color-industrial)]" />
                <h3 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-[var(--color-graphite)]">Predictive Engine</h3>
              </div>
              
              <p className="text-[var(--color-muted)] font-medium mb-12 leading-[1.6] text-lg">
                Explore the complete repository, including all model experiments, data pipelines, API specifications, and the Next.js frontend code.
              </p>
              
              <ul className="space-y-6 mb-16 font-bold tracking-widest uppercase text-xs text-[var(--color-graphite)]">
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 group cursor-pointer hover:text-[var(--color-industrial)] transition-colors">
                  <span>Source Code</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)] group-hover:translate-x-1 transition-transform" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 group cursor-pointer hover:text-[var(--color-industrial)] transition-colors">
                  <span>Model Experiments</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)] group-hover:translate-x-1 transition-transform" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 group cursor-pointer hover:text-[var(--color-industrial)] transition-colors">
                  <span>API Documentation</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)] group-hover:translate-x-1 transition-transform" />
                </li>
                <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 group cursor-pointer hover:text-[var(--color-industrial)] transition-colors">
                  <span>Frontend Architecture</span> <ArrowRight className="w-4 h-4 text-[var(--color-industrial)] group-hover:translate-x-1 transition-transform" />
                </li>
              </ul>
              
              <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="block w-full text-center py-6 border border-[var(--color-graphite)] bg-[var(--color-graphite)] text-white text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-industrial)] hover:border-[var(--color-industrial)] transition-colors">
                View Repository
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 md:py-48 bg-[var(--color-industrial)] text-white text-center">
        <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
           <motion.h2 
             initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase mb-16 leading-[0.9]"
           >
             Ready To See <br/> What Your Data <br/> Knows?
           </motion.h2>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto px-12 py-6 bg-white text-[var(--color-industrial)] text-sm md:text-base font-bold uppercase tracking-widest hover:bg-[var(--color-graphite)] hover:text-white transition-colors flex items-center justify-center gap-4 group border border-white"
             >
               Analyze Your Data
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
             
             <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-12 py-6 bg-transparent border border-white text-white text-sm md:text-base font-bold uppercase tracking-widest hover:bg-white hover:text-[var(--color-industrial)] transition-colors flex items-center justify-center">
               View The Source
             </a>
           </div>
        </div>
      </div>
    </section>
  );
}
