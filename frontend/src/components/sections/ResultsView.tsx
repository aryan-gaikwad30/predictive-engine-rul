"use client";

import { motion } from "framer-motion";
import { PredictionResponse } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useMemo, useState } from "react";

export default function ResultsView({ results }: { results: PredictionResponse }) {
  const { metrics, feature_importance, maintenance_metrics, predictions, dataset_metadata } = results;
  const [selectedMachine, setSelectedMachine] = useState<number | string | null>(null);

  // Group predictions by machine for the RUL chart
  const machineGroups = useMemo(() => {
    if (!predictions) return {};
    const groups: Record<string, any[]> = {};
    const entityCol = dataset_metadata?.entity_column || 'unit_number';
    const timeCol = dataset_metadata?.time_column || 'time_cycles';
    
    predictions.forEach(p => {
      const m = p[entityCol];
      if (!groups[m]) groups[m] = [];
      groups[m].push(p);
    });
    
    // Sort by time
    Object.values(groups).forEach(g => g.sort((a, b) => a[timeCol] - b[timeCol]));
    return groups;
  }, [predictions, dataset_metadata]);

  const machineList = Object.keys(machineGroups);
  const activeMachine = selectedMachine || (machineList.length > 0 ? machineList[0] : null);
  const chartData = activeMachine ? machineGroups[activeMachine] : [];
  
  const timeCol = dataset_metadata?.time_column || 'time';

  if (!metrics) return null;

  return (
    <div className="bg-white" id="results">
      {/* Results Hero */}
      <section className="py-32 bg-[var(--color-graphite)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-industrial)]/10 blur-3xl transform -translate-y-1/2 rounded-full" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-24"
          >
            Your Machines <br/>
            <span className="text-[var(--color-industrial)]">Are Now Measurable.</span>
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/20 pt-16">
             <MetricBlock label="RMSE" value={metrics.RMSE.toFixed(2)} />
             <MetricBlock label="MAE" value={metrics.MAE.toFixed(2)} />
             <MetricBlock label="NASA Score" value={metrics.NASA_score.toFixed(0)} />
             <MetricBlock label="Early Predictions" value={`${metrics.early_prediction_percentage.toFixed(1)}%`} />
          </div>
        </div>
      </section>

      {/* RUL Visualization */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <h3 className="text-4xl font-bold uppercase tracking-tighter text-[var(--color-graphite)]">
              Remaining Useful Life
            </h3>
            {machineList.length > 0 && (
              <select 
                value={activeMachine as string} 
                onChange={e => setSelectedMachine(e.target.value)}
                className="bg-[var(--color-offwhite)] border-0 rounded-full px-6 py-3 font-semibold focus:ring-2 focus:ring-[var(--color-industrial)]"
              >
                {machineList.map(m => <option key={m} value={m}>Machine {m}</option>)}
              </select>
            )}
          </div>

          <div className="h-[500px] w-full border border-gray-100 rounded-3xl p-6 shadow-sm bg-[var(--color-offwhite)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey={timeCol} stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <ReferenceLine y={30} label={{ position: 'top', value: 'Critical', fill: '#ff4d00', fontSize: 12 }} stroke="#ff4d00" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="predicted_rul" name="Predicted RUL" stroke="var(--color-industrial)" strokeWidth={3} dot={false} />
                {chartData.length > 0 && chartData[0].actual_rul !== undefined && (
                  <Line type="monotone" dataKey="actual_rul" name="Actual RUL" stroke="#1c1c1c" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.5} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Maintenance Horizon & Feature Importance */}
      <section className="py-32 bg-[var(--color-offwhite)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-24">
            
            {/* Horizon */}
            <div>
              <h3 className="text-4xl font-bold uppercase tracking-tighter text-[var(--color-graphite)] mb-12">
                Maintenance Horizon
              </h3>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center font-bold text-red-500 shrink-0">
                    ≤30
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">Critical</h4>
                    <p className="text-gray-500 mt-2">Immediate intervention required. Extremely high risk of failure.</p>
                  </div>
                </div>
                <div className="w-1 h-8 bg-gray-300 ml-8" />
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-[var(--color-industrial)] flex items-center justify-center font-bold text-[var(--color-industrial)] shrink-0">
                    ≤75
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">Warning</h4>
                    <p className="text-gray-500 mt-2">Schedule maintenance soon. Degradation is measurable and accelerating.</p>
                  </div>
                </div>
                <div className="w-1 h-8 bg-gray-300 ml-8" />
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-600 shrink-0">
                    ≤100
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">Planning</h4>
                    <p className="text-gray-500 mt-2">Begin resource allocation. Machine is operating safely but entering wear phase.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            <div>
              <h3 className="text-4xl font-bold uppercase tracking-tighter text-[var(--color-graphite)] mb-12">
                What Drives Prediction?
              </h3>
              <div className="space-y-6">
                {feature_importance?.slice(0, 8).map((feat, i) => (
                  <div key={feat.feature} className="relative">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                      <span>{feat.feature}</span>
                      <span className="text-[var(--color-industrial)]">{(feat.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
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

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[var(--color-industrial)] text-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8"
           >
             Don't Wait <br/> For Failure.
           </motion.h2>
           <p className="text-2xl font-light mb-12">Turn your machine data into a maintenance decision.</p>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="px-8 py-4 bg-white text-[var(--color-industrial)] font-bold uppercase tracking-wider rounded-full hover:bg-gray-100 transition-colors"
           >
             Analyze Another Dataset
           </button>
        </div>
      </section>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string, value: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="flex flex-col"
    >
      <div className="text-4xl md:text-6xl font-bold mb-4">{value}</div>
      <div className="text-sm font-semibold tracking-widest uppercase text-[var(--color-industrial)]">{label}</div>
    </motion.div>
  )
}
