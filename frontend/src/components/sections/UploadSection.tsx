"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import MagneticButton from "../ui/MagneticButton";

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
    <section className="py-24 md:py-32 bg-[var(--color-background)] relative z-10" id="analyze">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <motion.div 
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-6 text-[var(--color-text)] leading-[0.9]">
            System Ready <br /> <span className="text-[var(--color-primary)] text-glow-primary">For Data Feed.</span>
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
            relative p-12 md:p-24 transition-all duration-300 overflow-hidden group glass-panel rounded-xl
            ${dragActive ? 'border-[var(--color-primary)] shadow-[0_0_30px_rgba(232,93,4,0.2)]' : 'hover:border-[var(--color-primary)]'}
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
                <div className={`w-24 h-24 flex items-center justify-center mb-8 transition-colors duration-300 ${dragActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-primary)]'}`}>
                  <UploadCloud className="w-12 h-12" strokeWidth={1} />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter uppercase text-[var(--color-text)]">Initialize Data Feed</h3>
                <p className="text-lg md:text-xl text-[var(--color-muted)] font-medium">Drop your CSV payload here</p>
                <div className="mt-12 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] font-mono">MAX 50 MB</div>
              </motion.div>
            ) : (
              <motion.div 
                key="selected"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center text-center relative z-20"
              >
                <div className="w-24 h-24 text-[var(--color-primary)] flex items-center justify-center mb-8">
                  <CheckCircle className="w-12 h-12" strokeWidth={1} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3 tracking-tighter uppercase text-[var(--color-text)]">
                  <FileIcon className="w-6 h-6 text-[var(--color-primary)]" />
                  {selectedFile.name}
                </h3>
                <p className="text-lg md:text-xl text-[var(--color-primary)] mb-12 font-medium font-mono">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 relative z-30">
                  <MagneticButton strength={0.3}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="px-8 py-4 font-bold border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-surface)] hover:border-[var(--color-critical)] hover:text-[var(--color-critical)] transition-colors disabled:opacity-50 text-xs md:text-sm tracking-widest uppercase rounded-md"
                      disabled={isUploading}
                    >
                      Abort
                    </button>
                  </MagneticButton>
                  <MagneticButton strength={0.3}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                      className="px-8 py-4 font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-3 group text-xs md:text-sm tracking-widest uppercase rounded-md glass-panel-glow"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[var(--color-background)] border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Execute Upload
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </MagneticButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 glass-panel border border-[var(--color-critical)] text-[var(--color-critical)] text-center font-bold tracking-widest uppercase text-xs rounded-md shadow-[0_0_15px_rgba(230,57,70,0.2)]"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-24 border-t border-[var(--color-border)] pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--color-muted)] text-xl font-medium tracking-tight">No live telemetry available?</p>
          <MagneticButton strength={0.2}>
            <button 
              onClick={onDemoRequest}
              disabled={isUploading}
              className="group flex items-center gap-3 text-[var(--color-primary)] font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
            >
              Simulate Demo Feed
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
