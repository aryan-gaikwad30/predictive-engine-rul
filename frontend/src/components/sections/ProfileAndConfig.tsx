"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProfileResponse } from "@/lib/api";
import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

interface ProfileAndConfigProps {
  profile: ProfileResponse;
  onTrain: (config: { entity_column?: string; time_column?: string; target_column?: string; feature_columns?: string; condition_columns?: string }) => void;
}

export default function ProfileAndConfig({ profile, onTrain }: ProfileAndConfigProps) {
  const [entityCol, setEntityCol] = useState(profile.detected_entity || "");
  const [timeCol, setTimeCol] = useState(profile.detected_time || "");
  const [targetCol, setTargetCol] = useState(profile.detected_target || "");
  const prefersReducedMotion = useReducedMotion();

  const hasAmbiguity = !profile.detected_entity || !profile.detected_time || !profile.detected_target;

  return (
    <section className="py-24 bg-[var(--color-offwhite)]" id="profile">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <motion.div initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase text-[var(--color-graphite)] leading-[0.9]">
              Your Dataset <br />
              <span className="text-[var(--color-muted)] font-medium text-3xl tracking-tight capitalize">Parsed and Ready</span>
            </h2>
          </motion.div>
          {profile.warnings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex items-center gap-3 bg-white text-[var(--color-industrial)] px-6 py-3 rounded-full font-bold border border-[var(--color-border)] shadow-sm"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{profile.warnings.length} notice{profile.warnings.length > 1 ? 's' : ''} require attention</span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
            className="flex flex-col border-l-2 border-[var(--color-industrial)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2">
              {profile.row_count.toLocaleString()}
            </div>
            <div className="text-sm uppercase tracking-widest text-[var(--color-muted)] font-bold">Total Observations</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            className="flex flex-col border-l-2 border-[var(--color-border)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2">
              {profile.column_count}
            </div>
            <div className="text-sm uppercase tracking-widest text-[var(--color-muted)] font-bold">Data Variables</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
            className="flex flex-col border-l-2 border-[var(--color-border)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2">
              {profile.feature_candidates.length}
            </div>
            <div className="text-sm uppercase tracking-widest text-[var(--color-muted)] font-bold">Sensor Features</div>
          </motion.div>
        </div>

        {hasAmbiguity ? (
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-16 border border-[var(--color-border)] shadow-sm mb-20"
          >
            <h3 className="text-3xl font-bold mb-4 tracking-tight text-[var(--color-graphite)]">We Need Your Input.</h3>
            <p className="text-xl text-[var(--color-muted)] mb-12 max-w-2xl font-medium leading-relaxed">
              Our engine detected multiple candidate columns for your machine identities or time cycles. Please confirm the correct schema before training.
            </p>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-3">Entity (Machine ID)</label>
                <select 
                  value={entityCol} 
                  onChange={e => setEntityCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-5 text-lg font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-3">Time / Cycle</label>
                <select 
                  value={timeCol} 
                  onChange={e => setTimeCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-5 text-lg font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-3">Target (RUL)</label>
                <select 
                  value={targetCol} 
                  onChange={e => setTargetCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-5 text-lg font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-12 bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm mb-20"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6 tracking-tight text-[var(--color-graphite)]">Schema Detected Successfully</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Entity</span>
                  <span className="font-mono text-lg font-bold text-[var(--color-graphite)]">{profile.detected_entity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Time</span>
                  <span className="font-mono text-lg font-bold text-[var(--color-graphite)]">{profile.detected_time}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-1">Target</span>
                  <span className="font-mono text-lg font-bold text-[var(--color-graphite)]">{profile.detected_target}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-start">
          <motion.button 
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            disabled={!entityCol || !timeCol || !targetCol}
            onClick={() => onTrain({ entity_column: entityCol, time_column: timeCol, target_column: targetCol })}
            className="px-10 py-5 bg-[var(--color-graphite)] text-white text-lg font-bold uppercase tracking-widest rounded-full hover:bg-[var(--color-industrial)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
          >
            Train Predictive Engine
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}
