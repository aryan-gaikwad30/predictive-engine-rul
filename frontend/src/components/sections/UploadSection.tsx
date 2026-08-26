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
    <section className="py-24 md:py-32 bg-[var(--color-surface)] relative" id="analyze">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <motion.div 
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-6 text-[var(--color-graphite)] leading-[0.9]">
            Bring Your <br /> Machine Data.
          </h2>
          <p className="text-xl md:text-2xl text-[var(--color-muted)] max-w-2xl font-medium tracking-tight">
            Upload a CSV containing your historical sensor telemetry, operating conditions, and failure events.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`
            relative p-12 md:p-24 transition-all duration-300 overflow-hidden group border
            ${dragActive ? 'bg-[var(--color-surface)] border-[var(--color-industrial)]' : 'bg-[var(--color-offwhite)] border-[var(--color-border)] hover:border-[var(--color-graphite)]'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >

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
                <div className={`w-24 h-24 flex items-center justify-center mb-8 transition-colors duration-300 ${dragActive ? 'text-[var(--color-industrial)]' : 'text-[var(--color-graphite)]'}`}>
                  <UploadCloud className="w-12 h-12" strokeWidth={1} />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter uppercase text-[var(--color-graphite)]">Drop your CSV here</h3>
                <p className="text-lg md:text-xl text-[var(--color-muted)] font-medium">or click anywhere to browse</p>
                <div className="mt-12 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] font-mono">MAX 50 MB</div>
              </motion.div>
            ) : (
              <motion.div 
                key="selected"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center text-center relative z-20"
              >
                <div className="w-24 h-24 text-[var(--color-industrial)] flex items-center justify-center mb-8">
                  <CheckCircle className="w-12 h-12" strokeWidth={1} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3 tracking-tighter uppercase text-[var(--color-graphite)]">
                  <FileIcon className="w-6 h-6 text-[var(--color-muted)]" />
                  {selectedFile.name}
                </h3>
                <p className="text-lg md:text-xl text-[var(--color-muted)] mb-12 font-medium font-mono">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="px-8 py-4 font-bold border border-[var(--color-border)] text-[var(--color-graphite)] bg-transparent hover:border-[var(--color-graphite)] transition-colors disabled:opacity-50 text-xs md:text-sm tracking-widest uppercase"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="px-8 py-4 font-bold bg-[var(--color-graphite)] text-white hover:bg-[var(--color-industrial)] transition-colors disabled:opacity-50 flex items-center gap-3 group text-xs md:text-sm tracking-widest uppercase"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Upload Dataset
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            className="mt-6 p-4 bg-transparent text-[var(--color-industrial)] border border-[var(--color-industrial)] text-center font-bold tracking-widest uppercase text-xs"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-24 border-t border-[var(--color-border)] pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--color-muted)] text-xl font-medium tracking-tight">Don&apos;t have a dataset ready?</p>
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
