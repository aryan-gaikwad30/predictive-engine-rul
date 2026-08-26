"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface TrainingSequenceProps {
  isComplete: boolean;
}

const STAGES = [
  "Reading Sensor Data",
  "Mapping Machine Histories",
  "Preparing Features",
  "Training XGBoost Engine",
  "Evaluating Maintenance Risk",
  "Model Ready"
];

export default function TrainingSequence({ isComplete }: TrainingSequenceProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => setCurrentStage(STAGES.length - 1), 0);
      return;
    }
    
    // Simulate progression through meaningful stages while waiting for the synchronous backend response
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < STAGES.length - 2) return prev + 1;
        return prev;
      });
    }, 1200);
    
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <section className="py-32 bg-[var(--color-surface)] min-h-[60vh] flex items-center justify-center relative overflow-hidden border-y border-[var(--color-border)]">
      
      {/* Background ambient motion */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        animate={prefersReducedMotion ? {} : {
          background: [
            "radial-gradient(circle at 30% 50%, var(--color-industrial) 0%, transparent 40%)",
            "radial-gradient(circle at 70% 50%, var(--color-industrial) 0%, transparent 40%)",
            "radial-gradient(circle at 30% 50%, var(--color-industrial) 0%, transparent 40%)"
          ]
        }}
        transition={prefersReducedMotion ? {} : { duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(120px)" }}
      />

      <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
        
        {/* Animated Pipeline Visual */}
        <div className="relative h-32 flex items-center justify-center mb-16">
          <div className="w-full max-w-2xl h-[2px] bg-[var(--color-border)] relative overflow-hidden">
             <motion.div 
               className="absolute top-0 bottom-0 left-0 bg-[var(--color-industrial)]"
               initial={{ width: "0%" }}
               animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
               transition={{ duration: 1, ease: "easeInOut" }}
             />
          </div>
          
          <div className="absolute inset-0 flex justify-between items-center max-w-2xl mx-auto">
             {STAGES.map((_, i) => (
               <motion.div 
                 key={i}
                 className={`w-3 h-3 transition-colors duration-500 z-10 ${i <= currentStage ? 'bg-[var(--color-industrial)]' : 'bg-white border border-[var(--color-border)]'}`}
                 initial={{ scale: 0.8 }}
                 animate={{ scale: i === currentStage ? [1, 1.5, 1] : 1 }}
                 transition={i === currentStage ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
               />
             ))}
          </div>
        </div>

        <div className="h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
               <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-4 font-mono">
                 Phase {String(currentStage + 1).padStart(2, '0')}
               </div>
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-[var(--color-graphite)] leading-tight">
                 {STAGES[currentStage]}
               </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
