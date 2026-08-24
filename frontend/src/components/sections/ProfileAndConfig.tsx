"use client";

import { motion } from "framer-motion";
import { ProfileResponse } from "@/lib/api";
import { useState } from "react";
import { AlertCircle, Database, Check } from "lucide-react";

interface ProfileAndConfigProps {
  profile: ProfileResponse;
  onTrain: (config: any) => void;
}

export default function ProfileAndConfig({ profile, onTrain }: ProfileAndConfigProps) {
  const [entityCol, setEntityCol] = useState(profile.detected_entity || "");
  const [timeCol, setTimeCol] = useState(profile.detected_time || "");
  const [targetCol, setTargetCol] = useState(profile.detected_target || "");

  const hasAmbiguity = !profile.detected_entity || !profile.detected_time || !profile.detected_target;

  return (
    <section className="py-24 bg-white" id="profile">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-[var(--color-graphite)]">
              Dataset Profile
            </h2>
          </motion.div>
          {profile.warnings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex items-center gap-2 bg-orange-50 text-[var(--color-industrial)] px-4 py-2 rounded-full font-medium border border-orange-100"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{profile.warnings.length} notice{profile.warnings.length > 1 ? 's' : ''} require attention</span>
            </motion.div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="p-8 bg-[var(--color-offwhite)] rounded-3xl"
          >
            <Database className="w-8 h-8 mb-4 text-gray-400" />
            <div className="text-5xl font-bold tracking-tighter text-[var(--color-graphite)] mb-1">
              {profile.row_count.toLocaleString()}
            </div>
            <div className="text-sm uppercase tracking-widest text-gray-500 font-semibold">Total Rows</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="p-8 bg-[var(--color-offwhite)] rounded-3xl"
          >
            <div className="w-8 h-8 mb-4 border-2 border-gray-400 rounded-sm" />
            <div className="text-5xl font-bold tracking-tighter text-[var(--color-graphite)] mb-1">
              {profile.column_count}
            </div>
            <div className="text-sm uppercase tracking-widest text-gray-500 font-semibold">Columns</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="p-8 bg-[var(--color-offwhite)] rounded-3xl"
          >
            <div className="w-8 h-8 mb-4 flex gap-1">
              <div className="w-2 h-full bg-[var(--color-industrial)] rounded-sm" />
              <div className="w-2 h-3/4 mt-auto bg-gray-400 rounded-sm" />
              <div className="w-2 h-1/2 mt-auto bg-gray-300 rounded-sm" />
            </div>
            <div className="text-5xl font-bold tracking-tighter text-[var(--color-graphite)] mb-1">
              {profile.feature_candidates.length}
            </div>
            <div className="text-sm uppercase tracking-widest text-gray-500 font-semibold">Sensor Features</div>
          </motion.div>
        </div>

        {hasAmbiguity ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="border-2 border-[var(--color-industrial)] rounded-3xl p-8 md:p-12 bg-white mb-16"
          >
            <h3 className="text-3xl font-bold mb-4 uppercase">We Need Your Input.</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Our engine detected multiple candidate columns for your machine identities or time cycles. Please confirm the correct schema before training.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Entity (Machine ID)</label>
                <select 
                  value={entityCol} 
                  onChange={e => setEntityCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-4 text-lg font-medium focus:ring-2 focus:ring-[var(--color-industrial)]"
                >
                  <option value="">Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Time / Cycle</label>
                <select 
                  value={timeCol} 
                  onChange={e => setTimeCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-4 text-lg font-medium focus:ring-2 focus:ring-[var(--color-industrial)]"
                >
                  <option value="">Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Target (RUL)</label>
                <select 
                  value={targetCol} 
                  onChange={e => setTargetCol(e.target.value)}
                  className="w-full bg-[var(--color-offwhite)] border-0 rounded-xl p-4 text-lg font-medium focus:ring-2 focus:ring-[var(--color-industrial)]"
                >
                  <option value="">Select column...</option>
                  {profile.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-start md:items-center justify-between flex-col md:flex-row gap-6 p-8 border border-gray-200 bg-gray-50 rounded-3xl mb-16"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold">Schema Detected Successfully</h3>
              </div>
              <p className="text-gray-600">
                Entity: <span className="font-mono text-black">{profile.detected_entity}</span> | 
                Time: <span className="font-mono text-black">{profile.detected_time}</span> | 
                Target: <span className="font-mono text-black">{profile.detected_target}</span>
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!entityCol || !timeCol || !targetCol}
            onClick={() => onTrain({ entity_column: entityCol, time_column: timeCol, target_column: targetCol })}
            className="px-12 py-5 bg-[var(--color-graphite)] text-white text-xl font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-industrial)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Train Model
          </motion.button>
        </div>

      </div>
    </section>
  );
}
