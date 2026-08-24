"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

const FadeText = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-12"
    >
      {children}
    </motion.div>
  );
};

export default function Storytelling() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <section ref={containerRef} className="py-32 bg-[var(--color-graphite)] text-white relative" id="how-it-works">
      
      {/* Background animated connecting line */}
      <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block">
        <motion.div 
          className="absolute top-0 left-0 right-0 bg-[var(--color-industrial)] origin-top"
          style={{ scaleY: pathLength, height: "100%" }}
        />
      </div>

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-32">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none">
            Every Machine <br/> <span className="text-gray-500">Leaves A Signal.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 relative z-10">
          <div className="space-y-32">
            <FadeText>
              <h3 className="text-4xl font-light mb-4 text-[var(--color-industrial)]">01. DATA</h3>
              <p className="text-2xl font-medium tracking-tight text-gray-300">
                Temperature, pressure, vibration, load, cycles. Millions of sensor observations captured every hour.
              </p>
            </FadeText>

            <FadeText>
              <h3 className="text-4xl font-light mb-4 text-[var(--color-industrial)]">02. SIGNAL</h3>
              <p className="text-2xl font-medium tracking-tight text-gray-300">
                Raw data alone doesn't tell you when failure is coming. But within the noise, patterns reveal microscopic degradation.
              </p>
            </FadeText>

            <FadeText>
              <h3 className="text-4xl font-light mb-4 text-[var(--color-industrial)]">03. MODEL</h3>
              <p className="text-2xl font-medium tracking-tight text-gray-300">
                We turn signal into time. The Predictive Engine identifies complex failure trajectories before human operators can see them.
              </p>
            </FadeText>
            
            <FadeText>
              <h3 className="text-4xl font-light mb-4 text-[var(--color-industrial)]">04. DECISION</h3>
              <p className="text-2xl font-medium tracking-tight text-gray-300">
                Stop guessing. Know exactly how many cycles remain, and when maintenance intervention is critical.
              </p>
            </FadeText>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center sticky top-32 h-[60vh]">
             <motion.div className="w-full aspect-square border border-white/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center gap-4">
                <div className="absolute inset-0 bg-[var(--color-industrial)]/5 blur-3xl rounded-full" />
                {/* Abstract Data vis changing based on scroll */}
                <motion.div className="h-1 bg-white/20 w-full overflow-hidden">
                  <motion.div className="h-full bg-[var(--color-industrial)]" style={{ width: useTransform(scrollYProgress, [0, 0.4], ["0%", "100%"]) }} />
                </motion.div>
                <motion.div className="h-1 bg-white/20 w-3/4 overflow-hidden">
                  <motion.div className="h-full bg-[var(--color-industrial)]" style={{ width: useTransform(scrollYProgress, [0.2, 0.6], ["0%", "100%"]) }} />
                </motion.div>
                <motion.div className="h-1 bg-white/20 w-5/6 overflow-hidden">
                  <motion.div className="h-full bg-[var(--color-industrial)]" style={{ width: useTransform(scrollYProgress, [0.4, 0.8], ["0%", "100%"]) }} />
                </motion.div>
                <motion.div className="mt-8 text-center" style={{ opacity: useTransform(scrollYProgress, [0.7, 0.9], [0, 1]) }}>
                  <div className="text-6xl font-bold">42</div>
                  <div className="text-sm tracking-widest uppercase text-[var(--color-industrial)] mt-2">Cycles Remaining</div>
                </motion.div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
