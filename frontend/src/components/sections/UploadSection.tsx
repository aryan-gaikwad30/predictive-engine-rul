"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface UploadSectionProps {
  onUploadSuccess: (file: File) => void;
  onDemoRequest: () => void;
  isUploading: boolean;
  error: string | null;
}

export default function UploadSection({ onUploadSuccess, onDemoRequest, isUploading, error }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUploadSuccess(selectedFile);
    }
  };

  return (
    <section className="py-32 bg-[var(--color-surface)] relative" id="analyze">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 text-[var(--color-graphite)]">
            Bring Your <br /> Machine Data.
          </h2>
          <p className="text-2xl text-[var(--color-muted)] max-w-2xl font-medium tracking-tight">
            Upload a CSV containing your historical sensor telemetry, operating conditions, and failure events.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`
            relative rounded-3xl p-12 md:p-24 transition-all duration-500 overflow-hidden group
            ${dragActive ? 'bg-orange-50 shadow-inner' : 'bg-[var(--color-offwhite)] shadow-sm hover:shadow-md'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Subtle animated border effect */}
          <div className={`absolute inset-0 border-[3px] rounded-3xl transition-colors duration-500 pointer-events-none ${dragActive ? 'border-[var(--color-industrial)]' : 'border-transparent group-hover:border-[var(--color-border)]'}`} />

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
            aria-label="Upload CSV File"
          />

          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center text-center pointer-events-none"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-colors duration-500 ${dragActive ? 'bg-[var(--color-industrial)] text-white' : 'bg-white text-[var(--color-graphite)] shadow-sm'}`}>
                  <UploadCloud className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight text-[var(--color-graphite)]">Drop your CSV here</h3>
                <p className="text-lg text-[var(--color-muted)] font-medium">or click anywhere to browse</p>
                <div className="mt-8 text-xs font-bold uppercase tracking-widest text-gray-400">MAX 50 MB</div>
              </motion.div>
            ) : (
              <motion.div 
                key="selected"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center text-center relative z-20"
              >
                <div className="w-24 h-24 bg-white shadow-sm text-green-600 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 tracking-tight text-[var(--color-graphite)]">
                  <FileIcon className="w-6 h-6 text-[var(--color-muted)]" />
                  {selectedFile.name}
                </h3>
                <p className="text-lg text-[var(--color-muted)] mb-10 font-medium">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="px-8 py-4 rounded-full font-bold border border-[var(--color-border)] text-[var(--color-graphite)] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="px-8 py-4 rounded-full font-bold bg-[var(--color-industrial)] text-white hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 group"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Upload Dataset
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-24 border-t border-[var(--color-border)] pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--color-muted)] text-lg font-medium tracking-tight">Don&apos;t have a dataset ready?</p>
          <button 
            onClick={onDemoRequest}
            disabled={isUploading}
            className="group flex items-center gap-3 text-[var(--color-graphite)] font-bold uppercase tracking-widest text-sm hover:text-[var(--color-industrial)] transition-colors"
          >
            Try Demo Dataset
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
