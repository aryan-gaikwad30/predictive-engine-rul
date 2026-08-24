"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const yText = useTransform(scrollY, [0, 500], [0, prefersReducedMotion ? 0 : 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, prefersReducedMotion ? 1 : 0]);
  const scaleVisual = useTransform(scrollY, [0, 600], [1, prefersReducedMotion ? 1 : 1.2]);

  // Synthetic data traces for background animation
  const [traces, setTraces] = useState<number[]>([]);
  useEffect(() => {
    setTimeout(() => setTraces(Array.from({ length: 40 }, () => Math.random() * 100)), 0);
    const interval = setInterval(() => {
      setTraces(prev => prev.map(v => Math.max(10, Math.min(90, v + (Math.random() - 0.5) * 20))));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" id="product">
      {/* Background animated sensor traces forming a subtle structure */}
      <motion.div 
        className="absolute inset-0 z-0 flex items-end justify-between opacity-10 pointer-events-none"
        style={{ scale: scaleVisual }}
      >
        {traces.map((h, i) => (
          <motion.div
            key={i}
            className="w-full bg-black mx-[1px]"
            animate={{ height: `${h}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        ))}
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          style={{ y: yText, opacity }}
          className="flex flex-col gap-8"
        >
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-[var(--color-graphite)] uppercase">
              Know When <br />
              <span className="text-[var(--color-industrial)]">Your Machines</span> <br />
              Need You.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-600 max-w-xl font-light tracking-tight leading-relaxed"
          >
            Turn industrial sensor data into remaining-life predictions and maintenance intelligence. Before failure becomes downtime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-[var(--color-industrial)] text-white text-lg font-semibold rounded-full hover:bg-orange-700 transition-colors flex items-center gap-2 group"
            >
              Analyze Your Data
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-[var(--color-graphite)] text-[var(--color-graphite)] text-lg font-semibold rounded-full hover:bg-[var(--color-graphite)] hover:text-white transition-colors"
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* Right side abstract machine visual */}
        <motion.div 
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="hidden lg:flex justify-center items-center relative h-[600px]"
          style={{ opacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-industrial)]/20 to-transparent rounded-full blur-3xl" />
          <motion.div 
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={prefersReducedMotion ? {} : { duration: 40, repeat: Infinity, ease: "linear" }}
            className="relative w-96 h-96 border-[1px] border-[var(--color-graphite)]/20 rounded-full flex items-center justify-center"
          >
            <Activity className="w-32 h-32 text-[var(--color-industrial)] opacity-80" strokeWidth={1} />
            <div className="absolute top-0 right-1/4 w-3 h-3 bg-[var(--color-graphite)] rounded-full" />
            <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-[var(--color-industrial)] rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
