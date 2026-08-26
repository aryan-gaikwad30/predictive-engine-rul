"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PredictionResponse, PredictionRow } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useMemo, useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import NumberCounter from "../ui/NumberCounter";
import TiltCard from "../ui/TiltCard";
import MagneticButton from "../ui/MagneticButton";

export default function ResultsView({ results, onReset }: { results: PredictionResponse, onReset: () => void }) {
  const { metrics, feature_importance, fleet_predictions, predictions, dataset_metadata } = results;
  const [selectedMachine, setSelectedMachine] = useState<number | string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Group predictions by machine for the RUL chart
  const machineGroups = useMemo(() => {
    const activePredictions = fleet_predictions || predictions;
    if (!activePredictions) return {};
    const groups: Record<string, PredictionRow[]> = {};

    activePredictions.forEach(p => {
      const m = String(p.unit);
      if (!groups[m]) groups[m] = [];
      groups[m].push(p);
    });

    // Sort by cycle
    Object.values(groups).forEach(g => g.sort((a, b) => a.cycle - b.cycle));
    return groups;
  }, [fleet_predictions, predictions]);

  const machineList = Object.keys(machineGroups);
  const activeMachine = selectedMachine || (machineList.length > 0 ? machineList[0] : null);
  const chartData = activeMachine ? machineGroups[activeMachine] : [];

  // Get latest RUL for active machine
  let latestRul: number | string = "—";
  if (chartData.length > 0 && chartData[chartData.length - 1].predicted_RUL !== undefined) {
    latestRul = Math.max(0, Math.round(chartData[chartData.length - 1].predicted_RUL));
  }

  let healthStatus = "UNKNOWN";
  let healthColor = "text-[var(--color-muted)]";
  let healthBg = "bg-transparent border-[var(--color-border)]";

  if (typeof latestRul === 'number') {
    healthStatus = latestRul <= 30 ? "CRITICAL" : latestRul <= 75 ? "WARNING" : "HEALTHY";
    healthColor = latestRul <= 30 ? "text-[var(--color-critical)]" : latestRul <= 75 ? "text-[var(--color-primary)]" : "text-[var(--color-secondary)]";
    healthBg = latestRul <= 30 ? "bg-[var(--color-surface)] border-[var(--color-critical)] shadow-[0_0_20px_rgba(230,57,70,0.2)]" : latestRul <= 75 ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-[0_0_20px_rgba(232,93,4,0.15)]" : "bg-[var(--color-surface)] border-[var(--color-secondary)] shadow-[0_0_20px_rgba(0,137,123,0.1)]";
  }

  let splitLabel = "UNKNOWN";
  if (chartData.length > 0 && chartData[0].split) {
    splitLabel = chartData[0].split === 'validation' ? "VALIDATION MACHINE" : "FLEET VIEW";
  }

  const totalMachines = (dataset_metadata?.total_machine_count as number) || machineList.length;

  if (!metrics) return null;

  return (
    <div className="bg-transparent" id="results">

      {/* Results Hero - Control Room Style */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-8 max-w-[1440px] relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-24 text-[var(--color-text)]"
          >
            System Status <br/>
            <span className="text-[var(--color-primary)] text-4xl md:text-5xl lg:text-7xl tracking-tighter capitalize text-glow-primary">Online & Monitoring.</span>
          </motion.h2>

          <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-center gap-4">
            <span className="px-6 py-3 glass-panel text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest border border-[var(--color-primary)] rounded-sm">
              Model Evaluation
            </span>
            <span className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-widest">
              Based on unseen validation machines
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 border-t border-[var(--color-border)] pt-16">
             <MetricBlock label="RMSE" value={metrics.RMSE} isDecimal={true} />
             <MetricBlock label="MAE" value={metrics.MAE} isDecimal={true} />
             <div className="flex flex-col border-l border-[var(--color-primary)] pl-6 justify-between">
               <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter text-[var(--color-text)] font-mono truncate">
                 {typeof metrics.NASA_score === 'number' ? <NumberCounter value={metrics.NASA_score} /> : "N/A"}
               </div>
               <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">
                 NASA Score
               </div>
               {typeof metrics.NASA_score !== 'number' && (
                 <div className="text-[10px] font-bold text-[var(--color-critical)] mt-2 tracking-widest uppercase truncate" title={String(metrics.NASA_score)}>RUL semantics not configured</div>
               )}
             </div>
             <MetricBlock label="Early Predictions" value={metrics.early_prediction_percentage} isPercentage={true} isDecimal={true} />
          </div>
        </div>
      </section>

      {/* RUL Visualization & Machine Health */}
      <section className="py-24 md:py-32 bg-transparent border-y border-[var(--color-border)]">
        <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
            <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-[var(--color-text)] flex flex-col">
              <span>Fleet Telemetry</span>
              <span className="text-lg md:text-xl text-[var(--color-primary)] font-medium tracking-tight mt-2 font-mono">{totalMachines} MACHINES ANALYZED</span>
            </h3>
            {machineList.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Select Entity:</span>
                <select
                  value={activeMachine as string}
                  onChange={e => setSelectedMachine(e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] px-8 py-4 font-bold text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer uppercase tracking-widest text-sm rounded-md"
                >
                  {machineList.map(m => <option key={m} value={m}>Machine {m}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Premium Machine Health View */}
          <TiltCard intensity={5} className={`mb-12 p-8 md:p-12 border ${healthBg} flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-colors duration-500 rounded-lg glass-panel`}>
             <div className="flex items-center gap-6">
                <AlertTriangle className={`w-10 h-10 ${healthColor}`} />
                <div className="flex flex-col">
                  <div className="font-bold tracking-widest uppercase text-base md:text-lg text-[var(--color-text)]">
                    MACHINE {activeMachine || "DATA UNAVAILABLE"}
                  </div>
                  {splitLabel !== "UNKNOWN" && (
                    <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)] mt-1">
                      {splitLabel}
                    </div>
                  )}
                </div>
             </div>
             <div className="flex flex-wrap items-baseline gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-6 md:pt-0 md:pl-8">
               <div className={`text-6xl md:text-7xl font-bold tracking-tighter font-mono ${healthColor}`}>
                 {typeof latestRul === 'number' ? <NumberCounter value={latestRul} /> : latestRul}
               </div>
               <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">
                 Cycles Remaining
               </div>
             </div>
             <div className={`px-8 py-4 font-bold tracking-widest uppercase text-sm border bg-[var(--color-background)] ${healthColor} ${healthStatus === "CRITICAL" ? 'border-[var(--color-critical)]' : 'border-[var(--color-border)]'} rounded-md`}>
               {healthStatus}
             </div>
          </TiltCard>

          <div className="h-[400px] md:h-[600px] w-full glass-panel p-6 md:p-12 border border-[var(--color-border)] relative rounded-lg">
            <div className="absolute top-8 right-8 text-xs font-bold tracking-widest uppercase text-[var(--color-muted)] flex items-center gap-6 z-10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)]" /> Predicted
              </div>
              {chartData.length > 0 && chartData[0].actual_RUL !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-[var(--color-text)]" /> Actual
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="cycle" stroke="var(--color-muted)" tick={{fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', fill: 'var(--color-muted)'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--color-muted)" tick={{fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', fill: 'var(--color-muted)'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-primary)', borderRadius: '4px', color: 'var(--color-text)', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '12px', boxShadow: '0 0 15px rgba(232, 93, 4, 0.1)' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={30} label={{ position: 'top', value: 'CRITICAL THRESHOLD', fill: 'var(--color-critical)', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.1em' }} stroke="var(--color-critical)" strokeDasharray="2 2" />

                {chartData.length > 0 && chartData[0].actual_RUL !== undefined && (
                  <Line type="stepAfter" dataKey="actual_RUL" name="Actual RUL" stroke="var(--color-text)" strokeWidth={1} dot={false} isAnimationActive={!prefersReducedMotion} />
                )}
                <Line type="monotone" dataKey="predicted_RUL" name="Predicted RUL" stroke="var(--color-primary)" strokeWidth={2} dot={false} isAnimationActive={!prefersReducedMotion} style={{ filter: "drop-shadow(0 0 5px var(--color-primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Feature Importance & Decision Matrix */}
      <section className="py-24 md:py-32 bg-transparent">
        <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
          <div className="grid lg:grid-cols-12 gap-16 md:gap-24">

            {/* Feature Importance */}
            <div className="lg:col-span-7">
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-[var(--color-text)] mb-12 md:mb-16">
                Signal Weights
              </h3>
              <div className="space-y-10">
                {feature_importance?.slice(0, 6).map((feat, i) => (
                  <div key={feat.feature} className="relative group">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase text-[var(--color-text)] group-hover:text-[var(--color-primary)] group-hover:text-glow-primary transition-colors">{feat.feature}</span>
                      <span className="text-xl md:text-2xl font-bold text-[var(--color-primary)] font-mono"><NumberCounter value={feat.importance * 100} decimals={1} />%</span>
                    </div>
                    <div className="h-[2px] w-full bg-[var(--color-border)] overflow-hidden">
                      <motion.div
                        initial={{ width: prefersReducedMotion ? `${feat.importance * 100}%` : 0 }}
                        whileInView={{ width: `${feat.importance * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Matrix */}
            <div className="lg:col-span-5 glass-panel p-10 md:p-16 border border-[var(--color-border)] h-fit rounded-xl">
              <h3 className="text-3xl font-bold uppercase tracking-tighter text-[var(--color-text)] mb-12">
                Action Protocol
              </h3>
              <div className="space-y-12">
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 border border-[var(--color-critical)] text-[var(--color-critical)] bg-[rgba(230,57,70,0.1)] flex items-center justify-center font-bold text-lg font-mono shrink-0 rounded-md">
                    ≤30
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--color-text)] tracking-tight uppercase">Critical Alert</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-2 text-base leading-relaxed">Immediate intervention required. Isolate machine to prevent catastrophic failure.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 border border-[var(--color-primary)] text-[var(--color-primary)] bg-[rgba(232,93,4,0.1)] flex items-center justify-center font-bold text-lg font-mono shrink-0 rounded-md">
                    ≤75
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--color-text)] tracking-tight uppercase">Warning State</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-2 text-base leading-relaxed">Schedule maintenance window. Degradation is measurable and accelerating.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 border border-[var(--color-secondary)] text-[var(--color-secondary)] bg-[rgba(0,137,123,0.1)] flex items-center justify-center font-bold text-lg font-mono shrink-0 rounded-md">
                    ≤100
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--color-text)] tracking-tight uppercase">Monitoring Phase</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-2 text-base leading-relaxed">Begin resource allocation. Machine is operating safely but entering its wear phase.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-48 bg-transparent text-center border-t border-[var(--color-border)] relative overflow-hidden">
        {/* Background ambient motion */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          animate={prefersReducedMotion ? {} : {
            background: [
              "radial-gradient(circle at 50% 100%, var(--color-primary) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 100%, var(--color-secondary) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 100%, var(--color-primary) 0%, transparent 50%)"
            ]
          }}
          transition={prefersReducedMotion ? {} : { duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ filter: "blur(100px)" }}
        />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
           <motion.h2
             initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase mb-10 leading-[0.9] text-[var(--color-text)]"
           >
             Avert <br/> <span className="text-[var(--color-primary)] text-glow-primary">Downtime.</span>
           </motion.h2>
           <p className="text-2xl md:text-3xl font-medium mb-16 text-[var(--color-muted)] tracking-tight">Turn telemetry into decisive maintenance action.</p>
           
           <MagneticButton strength={0.4}>
             <button
               onClick={onReset}
               className="px-12 py-6 glass-panel border border-[var(--color-primary)] text-[var(--color-text)] text-sm md:text-base font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-4 mx-auto group rounded-md glass-panel-glow"
             >
               Initialize New Session
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
           </MagneticButton>
        </div>
      </section>
    </div>
  );
}

function MetricBlock({ label, value, isPercentage = false, isDecimal = false }: { label: string, value: number | string, isPercentage?: boolean, isDecimal?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="flex flex-col border-l border-[var(--color-primary)] pl-6"
    >
      <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter text-[var(--color-text)] font-mono">
        {typeof value === 'number' ? <NumberCounter value={value} decimals={isDecimal ? 2 : 0} /> : value}
        {isPercentage && "%"}
      </div>
      <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">{label}</div>
    </motion.div>
  )
}
