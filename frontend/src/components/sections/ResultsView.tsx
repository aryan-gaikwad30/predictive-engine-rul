"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PredictionResponse, PredictionRow } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useMemo, useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";

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
  let healthBg = "bg-gray-50 border-gray-200";

  if (typeof latestRul === 'number') {
    healthStatus = latestRul <= 30 ? "CRITICAL" : latestRul <= 75 ? "WARNING" : "HEALTHY";
    healthColor = latestRul <= 30 ? "text-red-600" : latestRul <= 75 ? "text-[var(--color-industrial)]" : "text-green-600";
    healthBg = latestRul <= 30 ? "bg-red-50 border-red-200" : latestRul <= 75 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200";
  }

  let splitLabel = "UNKNOWN";
  if (chartData.length > 0 && chartData[0].split) {
    splitLabel = chartData[0].split === 'validation' ? "VALIDATION MACHINE" : "FLEET VIEW";
  }

  const totalMachines = (dataset_metadata?.total_machine_count as number) || machineList.length;

  if (!metrics) return null;

  return (
    <div className="bg-[var(--color-surface)]" id="results">

      {/* Results Hero - Editorial Style */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-24 text-[var(--color-graphite)]"
          >
            Your Machines <br/>
            <span className="text-[var(--color-muted)] font-medium text-4xl md:text-6xl tracking-tight capitalize">Are Now Measurable.</span>
          </motion.h2>

          <div className="mb-4">
            <span className="px-4 py-2 bg-[var(--color-graphite)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
              Model Evaluation
            </span>
            <span className="ml-4 text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Based on unseen validation machines
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t-2 border-[var(--color-border)] pt-16">
             <MetricBlock label="RMSE" value={metrics.RMSE.toFixed(2)} />
             <MetricBlock label="MAE" value={metrics.MAE.toFixed(2)} />
             <div className="flex flex-col border-l-2 border-[var(--color-industrial)] pl-6 justify-between">
               <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter text-[var(--color-graphite)] truncate">
                 {typeof metrics.NASA_score === 'number' ? metrics.NASA_score.toFixed(0) : "N/A"}
               </div>
               <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">
                 NASA Score
               </div>
               {typeof metrics.NASA_score !== 'number' && (
                 <div className="text-xs font-medium text-red-500 mt-2 truncate" title={String(metrics.NASA_score)}>RUL semantics not configured</div>
               )}
             </div>
             <MetricBlock label="Early Predictions" value={`${metrics.early_prediction_percentage.toFixed(1)}%`} />
          </div>
        </div>
      </section>

      {/* RUL Visualization & Machine Health */}
      <section className="py-24 bg-[var(--color-offwhite)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-[var(--color-graphite)] flex flex-col">
              <span>Fleet Health</span>
              <span className="text-lg text-[var(--color-muted)] font-medium tracking-tight mt-1">{totalMachines} MACHINES ANALYZED</span>
            </h3>
            {machineList.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Select Entity:</span>
                <select
                  value={activeMachine as string}
                  onChange={e => setSelectedMachine(e.target.value)}
                  className="bg-white border border-[var(--color-border)] shadow-sm rounded-full px-6 py-3 font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] appearance-none cursor-pointer"
                >
                  {machineList.map(m => <option key={m} value={m}>Machine {m}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Premium Machine Health View */}
          <div className={`mb-8 p-6 rounded-3xl border ${healthBg} flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500`}>
             <div className="flex items-center gap-4">
                <AlertTriangle className={`w-8 h-8 ${healthColor}`} />
                <div className="flex flex-col">
                  <div className="font-bold tracking-widest uppercase text-sm md:text-base text-[var(--color-graphite)]">
                    MACHINE {activeMachine || "DATA UNAVAILABLE"}
                  </div>
                  {splitLabel !== "UNKNOWN" && (
                    <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)] mt-1">
                      {splitLabel}
                    </div>
                  )}
                </div>
             </div>
             <div className="flex items-baseline gap-4">
               <div className={`text-5xl font-bold tracking-tighter ${healthColor}`}>
                 {latestRul}
               </div>
               <div className="text-sm font-bold tracking-widest uppercase text-[var(--color-muted)]">
                 Cycles Remaining
               </div>
             </div>
             <div className={`px-6 py-2 rounded-full font-bold tracking-widest uppercase text-sm border bg-white ${healthColor} shadow-sm`}>
               {healthStatus}
             </div>
          </div>

          <div className="h-[500px] w-full bg-white rounded-[2rem] p-8 shadow-sm border border-[var(--color-border)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <XAxis dataKey="cycle" stroke="var(--color-muted)" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted)" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-graphite)', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: 'var(--color-graphite)' }}
                  cursor={{ stroke: 'var(--color-border)', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={30} label={{ position: 'top', value: 'Critical Threshold', fill: 'var(--color-industrial)', fontSize: 12, fontWeight: 'bold' }} stroke="var(--color-industrial)" strokeDasharray="3 3" />

                {chartData.length > 0 && chartData[0].actual_RUL !== undefined && (
                  <Line type="monotone" dataKey="actual_RUL" name="Actual RUL" stroke="var(--color-graphite)" strokeWidth={2} dot={false} isAnimationActive={!prefersReducedMotion} />
                )}
                <Line type="monotone" dataKey="predicted_RUL" name="Predicted RUL" stroke="var(--color-industrial)" strokeWidth={4} dot={false} isAnimationActive={!prefersReducedMotion} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Feature Importance & Decision Matrix */}
      <section className="py-32 bg-[var(--color-surface)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-24">

            {/* Feature Importance */}
            <div className="lg:col-span-7">
              <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-[var(--color-graphite)] mb-12">
                What Drives Prediction?
              </h3>
              <div className="space-y-8">
                {feature_importance?.slice(0, 6).map((feat, i) => (
                  <div key={feat.feature} className="relative group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xl font-bold tracking-tight text-[var(--color-graphite)] group-hover:text-[var(--color-industrial)] transition-colors">{feat.feature}</span>
                      <span className="text-2xl font-bold text-[var(--color-industrial)]">{(feat.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-[var(--color-border)] overflow-hidden">
                      <motion.div
                        initial={{ width: prefersReducedMotion ? `${feat.importance * 100}%` : 0 }}
                        whileInView={{ width: `${feat.importance * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full bg-[var(--color-graphite)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Matrix */}
            <div className="lg:col-span-5 bg-[var(--color-offwhite)] rounded-[2rem] p-10 md:p-16 border border-[var(--color-border)] h-fit">
              <h3 className="text-2xl font-bold uppercase tracking-tighter text-[var(--color-graphite)] mb-10">
                Action Matrix
              </h3>
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-red-500 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">
                    ≤30
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[var(--color-graphite)]">Critical Maintenance</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-1 text-sm leading-relaxed">Immediate intervention required. Isolate machine to prevent catastrophic failure.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-[var(--color-industrial)] text-[var(--color-industrial)] flex items-center justify-center font-bold text-sm shrink-0">
                    ≤75
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[var(--color-graphite)]">Warning State</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-1 text-sm leading-relaxed">Schedule maintenance window. Degradation is measurable and accelerating.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-green-500 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">
                    ≤100
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[var(--color-graphite)]">Planning Phase</h4>
                    <p className="text-[var(--color-muted)] font-medium mt-1 text-sm leading-relaxed">Begin resource allocation. Machine is operating safely but entering its wear phase.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[var(--color-graphite)] text-[var(--color-offwhite)] text-center">
        <div className="container mx-auto px-6 max-w-4xl">
           <motion.h2
             initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8 leading-[0.9]"
           >
             Don&apos;t Wait <br/> For Failure.
           </motion.h2>
           <p className="text-2xl font-medium mb-12 text-[var(--color-muted)] tracking-tight">Turn your machine data into a decisive maintenance advantage.</p>
           <button
             onClick={onReset}
             className="px-10 py-5 bg-[var(--color-industrial)] text-white text-lg font-bold uppercase tracking-widest rounded-full hover:bg-orange-700 transition-colors flex items-center gap-3 mx-auto group"
           >
             Analyze Another Dataset
             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </section>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string, value: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="flex flex-col border-l-2 border-[var(--color-industrial)] pl-6"
    >
      <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter text-[var(--color-graphite)]">{value}</div>
      <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)]">{label}</div>
    </motion.div>
  )
}
