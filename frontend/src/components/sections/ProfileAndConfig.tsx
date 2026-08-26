"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProfileResponse } from "@/lib/api";
import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

interface ProfileAndConfigProps {
  profile: ProfileResponse;
  onTrain: (config: { entity_column?: string; time_column?: string; target_column?: string; target_semantics?: string; feature_columns?: string; condition_columns?: string }) => void;
  trainingError?: string | null;
}

export default function ProfileAndConfig({ profile, onTrain, trainingError }: ProfileAndConfigProps) {
  const [entityCol, setEntityCol] = useState(profile.detected_entity || "");
  const [timeCol, setTimeCol] = useState(profile.detected_time || "");
  const [targetCol, setTargetCol] = useState(profile.detected_target || "");
  const [targetSemantics, setTargetSemantics] = useState<string>("rul");
  const prefersReducedMotion = useReducedMotion();

  const hasAmbiguity = !profile.detected_entity || !profile.detected_time || !profile.detected_target;
  const isCompatible = Boolean(timeCol && targetCol && entityCol && targetSemantics === "rul");

  return (
    <section className="py-24 md:py-32 bg-[var(--color-offwhite)]" id="profile">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <motion.div initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase text-[var(--color-graphite)] leading-[0.9]">
              Your Dataset <br />
              <span className="text-[var(--color-muted)] text-3xl md:text-4xl tracking-tighter capitalize">Parsed and Ready</span>
            </h2>
          </motion.div>
          {profile.warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex items-center gap-3 bg-[var(--color-surface)] text-[var(--color-industrial)] px-6 py-4 font-bold border border-[var(--color-border)] uppercase tracking-widest text-xs"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{profile.warnings.length} notice{profile.warnings.length > 1 ? 's' : ''} require attention</span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
            className="flex flex-col border-l-2 border-[var(--color-industrial)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2 font-mono">
              {profile.row_count.toLocaleString()}
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Total Observations</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            className="flex flex-col border-l-2 border-[var(--color-border)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2 font-mono">
              {profile.column_count}
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Data Variables</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
            className="flex flex-col border-l-2 border-[var(--color-border)] pl-8"
          >
            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[var(--color-graphite)] mb-2 font-mono">
              {profile.feature_candidates.length}
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Sensor Features</div>
          </motion.div>
        </div>

        {trainingError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 bg-transparent border-2 border-[var(--color-industrial)] flex gap-4 items-start"
          >
            <AlertCircle className="w-6 h-6 text-[var(--color-industrial)] shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-[var(--color-industrial)] tracking-widest uppercase mb-1">Training Failed</h4>
              <p className="text-[var(--color-graphite)] font-medium leading-relaxed font-mono text-sm">{trainingError}</p>
            </div>
          </motion.div>
        )}

        {hasAmbiguity ? (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-[var(--color-surface)] p-8 md:p-16 border border-[var(--color-border)] mb-20"
          >
            <h3 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter uppercase text-[var(--color-graphite)]">We Need Your Input.</h3>
            <p className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl font-medium leading-[1.3]">
              Our engine detected multiple candidate columns for your machine identities or time cycles. Please confirm the correct schema before training.
            </p>

            <div className="grid md:grid-cols-3 gap-10 border-t border-[var(--color-border)] pt-12">
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-4">Entity (Machine ID)</label>
                <select
                  value={entityCol}
                  onChange={e => setEntityCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border border-[var(--color-border)] rounded-none p-4 text-sm md:text-base font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] focus:outline-none appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-4">Time / Cycle</label>
                <select
                  value={timeCol}
                  onChange={e => setTimeCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border border-[var(--color-border)] rounded-none p-4 text-sm md:text-base font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] focus:outline-none appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-4">Target (RUL)</label>
                <select
                  value={targetCol}
                  onChange={e => setTargetCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border border-[var(--color-border)] rounded-none p-4 text-sm md:text-base font-bold text-[var(--color-graphite)] focus:ring-2 focus:ring-[var(--color-industrial)] focus:outline-none appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="" disabled>Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <input
                type="checkbox"
                id="target_semantics_rul"
                checked={targetSemantics === "rul"}
                onChange={(e) => setTargetSemantics(e.target.checked ? "rul" : "")}
                className="w-6 h-6 accent-[var(--color-industrial)] cursor-pointer"
              />
              <label htmlFor="target_semantics_rul" className="text-sm font-bold text-[var(--color-graphite)] cursor-pointer select-none uppercase tracking-widest">
                This target represents Remaining Useful Life (Enable NASA Scoring)
              </label>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 p-8 md:p-12 bg-[var(--color-surface)] border border-[var(--color-border)] mb-20"
          >
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-8 tracking-tighter uppercase text-[var(--color-graphite)]">Schema Detected Successfully</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-8">
                <div className="flex flex-col border-l border-[var(--color-industrial)] pl-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">Entity</span>
                  <span className="font-mono text-xl md:text-2xl font-bold text-[var(--color-graphite)] uppercase">{profile.detected_entity}</span>
                </div>
                <div className="flex flex-col border-l border-[var(--color-industrial)] pl-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">Time</span>
                  <span className="font-mono text-xl md:text-2xl font-bold text-[var(--color-graphite)] uppercase">{profile.detected_time}</span>
                </div>
                <div className="flex flex-col border-l border-[var(--color-industrial)] pl-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-industrial)] mb-2">Target</span>
                  <span className="font-mono text-xl md:text-2xl font-bold text-[var(--color-graphite)] uppercase">{profile.detected_target}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 lg:mt-0 bg-[var(--color-offwhite)] p-6 border border-[var(--color-border)] shrink-0">
              <input
                type="checkbox"
                id="target_semantics_rul_auto"
                checked={targetSemantics === "rul"}
                onChange={(e) => setTargetSemantics(e.target.checked ? "rul" : "")}
                className="w-6 h-6 accent-[var(--color-industrial)] cursor-pointer"
              />
              <label htmlFor="target_semantics_rul_auto" className="text-sm font-bold text-[var(--color-graphite)] cursor-pointer select-none uppercase tracking-widest">
                Target is Remaining Useful Life
              </label>
            </div>
          </motion.div>
        )}

        {!isCompatible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 border border-[var(--color-industrial)] bg-transparent flex flex-col gap-6"
          >
            <div className="flex items-center gap-3 text-[var(--color-industrial)]">
              <AlertCircle className="w-6 h-6" />
              <h4 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">Dataset Not Compatible</h4>
            </div>

            <p className="text-[var(--color-graphite)] font-medium leading-relaxed max-w-2xl text-lg">
              The current Predictive Engine requires: <br />
              <strong className="font-bold tracking-widest uppercase text-xs mt-4 inline-block text-[var(--color-industrial)]">Entity → Time/Cycle → RUL Target → Features</strong>
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl text-xs font-bold tracking-widest uppercase">
              <div className="flex items-center gap-3 text-[var(--color-graphite)]">
                <span className="text-lg text-[var(--color-industrial)]">✓</span> {entityCol ? "Entity candidate" : "Entity candidate"}
              </div>
              <div className="flex items-center gap-3 text-[var(--color-graphite)]">
                <span className="text-lg text-[var(--color-industrial)]">✓</span> Numeric sensor features
              </div>
              <div className={`flex items-center gap-3 ${timeCol ? 'text-[var(--color-graphite)]' : 'text-[var(--color-muted)]'}`}>
                <span className={`text-lg ${timeCol ? 'text-[var(--color-industrial)]' : ''}`}>{timeCol ? '✓' : '✕'}</span> Time/Cycle
              </div>
              <div className={`flex items-center gap-3 ${targetSemantics === "rul" ? 'text-[var(--color-graphite)]' : 'text-[var(--color-muted)]'}`}>
                <span className={`text-lg ${targetSemantics === "rul" ? 'text-[var(--color-industrial)]' : ''}`}>{targetSemantics === "rul" ? '✓' : '✕'}</span> Remaining Useful Life target
              </div>
            </div>
            <p className="text-[var(--color-muted)] text-xs font-bold uppercase tracking-widest mt-4 max-w-3xl leading-relaxed">
              {!timeCol ? "A temporal column representing time or cycles must be selected. " : ""}
              {targetSemantics !== "rul" ? "The target must represent Remaining Useful Life (RUL) regression, not classification or categorical labels." : ""}
            </p>
          </motion.div>
        )}

        <div className="flex justify-start">
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            disabled={!isCompatible}
            onClick={() => onTrain({ entity_column: entityCol, time_column: timeCol, target_column: targetCol, target_semantics: targetSemantics || undefined })}
            className="px-10 py-5 bg-[var(--color-graphite)] text-white text-sm md:text-base font-bold uppercase tracking-widest rounded-none hover:bg-[var(--color-industrial)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
          >
            Train Predictive Engine
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}
