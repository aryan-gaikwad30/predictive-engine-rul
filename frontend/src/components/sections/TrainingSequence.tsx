"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface TrainingSequenceProps {
  jobId: string;
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

export default function TrainingSequence({ jobId, isComplete }: TrainingSequenceProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setCurrentStage(STAGES.length - 1);
      return;
    }
    
    // Simulate progression while waiting for the synchronous backend to return
    // Since it's synchronous but we might wrap it in async polling later, 
    // we fake the stages to give the "cinematic" feel requested.
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < STAGES.length - 2) return prev + 1;
        return prev;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <section className="py-32 bg-[var(--color-graphite)] text-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        
        <div className="relative h-64 flex flex-col items-center justify-center mb-16">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 border-t-2 border-r-2 border-white/10 rounded-full absolute"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-b-2 border-l-2 border-[var(--color-industrial)] rounded-full absolute"
          />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-light tracking-widest uppercase text-[var(--color-industrial)] absolute"
            >
              {String(currentStage + 1).padStart(2, '0')}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-24">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStage}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter uppercase"
            >
              {STAGES[currentStage]}
            </motion.h2>
          </AnimatePresence>
        </div>
        
        <div className="mt-8 flex justify-center gap-2">
           {STAGES.map((_, i) => (
             <div 
                key={i} 
                className={`h-1 transition-all duration-500 rounded-full ${i <= currentStage ? 'w-16 bg-[var(--color-industrial)]' : 'w-4 bg-white/20'}`}
             />
           ))}
        </div>

      </div>
    </section>
  );
}
