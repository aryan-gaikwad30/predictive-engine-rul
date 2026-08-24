"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadSectionProps {
  onUploadSuccess: (file: File) => void;
  onDemoRequest: () => void;
  isUploading: boolean;
  error: string | null;
}

export default function UploadSection({ onUploadSuccess, onDemoRequest, isUploading, error }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    <section className="py-32 bg-[var(--color-offwhite)] relative" id="analyze">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
            Bring Your <br /> Machine Data.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upload a CSV containing your historical sensor telemetry, operating conditions, and failure events.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`
            relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300
            ${dragActive ? 'border-[var(--color-industrial)] bg-orange-50' : 'border-gray-300 bg-white hover:border-[var(--color-graphite)]'}
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
          />

          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center pointer-events-none"
              >
                <UploadCloud className="w-16 h-16 text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold mb-2">Drag and drop your CSV</h3>
                <p className="text-gray-500">or click anywhere to browse files</p>
              </motion.div>
            ) : (
              <motion.div 
                key="selected"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center relative z-20"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <FileIcon className="w-5 h-5" />
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500 mb-8">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="px-6 py-3 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="px-8 py-3 rounded-full font-semibold bg-[var(--color-industrial)] text-white hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Upload Dataset"
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

        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Don't have a dataset ready?</p>
          <button 
            onClick={onDemoRequest}
            disabled={isUploading}
            className="text-[var(--color-graphite)] font-bold border-b-2 border-[var(--color-graphite)] pb-1 hover:text-[var(--color-industrial)] hover:border-[var(--color-industrial)] transition-colors"
          >
            TRY DEMO DATASET
          </button>
        </div>
      </div>
    </section>
  );
}
