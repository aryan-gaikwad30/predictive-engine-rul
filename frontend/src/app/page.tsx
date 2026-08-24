"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Storytelling from "@/components/sections/Storytelling";
import UploadSection from "@/components/sections/UploadSection";
import ProfileAndConfig from "@/components/sections/ProfileAndConfig";
import TrainingSequence from "@/components/sections/TrainingSequence";
import ResultsView from "@/components/sections/ResultsView";
import * as api from "@/lib/api";
import { ProfileResponse, PredictionResponse } from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  
  const [results, setResults] = useState<PredictionResponse | null>(null);

  const handleUploadSuccess = async (uploadedFile: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      setFile(uploadedFile);
      const res = await api.uploadProfile(uploadedFile);
      setProfile(res);
      // Scroll to profile
      setTimeout(() => {
        document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload file");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDemoRequest = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await fetch('/demo_dataset.csv');
      const blob = await response.blob();
      const demoFile = new File([blob], 'demo_dataset.csv', { type: 'text/csv' });
      await handleUploadSuccess(demoFile);
    } catch {
      setUploadError("Failed to load demo dataset");
      setIsUploading(false);
    }
  };

  const handleTrain = async (config: { entity_column?: string; time_column?: string; target_column?: string; feature_columns?: string; condition_columns?: string }) => {
    if (!file) return;
    setIsTraining(true);
    try {
      const { job_id } = await api.startTraining(file, config);
      setTrainingJobId(job_id);

      while (true) {
        const status = await api.pollJobStatus(job_id);
        if (status.status === 'completed') {
          setIsTrainingComplete(true);
          const finalResults = await api.getPredictions(job_id);
          setResults(finalResults);
          
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
          }, 1500);
          break;
        } else if (status.status === 'failed') {
          throw new Error("Training failed");
        } else {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (err: unknown) {
      alert("Training error: " + (err as Error).message);
      setIsTraining(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {!isTraining && !results && (
        <>
          <Hero />
          <Storytelling />
          <UploadSection 
            onUploadSuccess={handleUploadSuccess} 
            onDemoRequest={handleDemoRequest}
            isUploading={isUploading}
            error={uploadError}
          />
        </>
      )}

      {profile && !isTraining && !results && (
        <ProfileAndConfig profile={profile} onTrain={handleTrain} />
      )}

      {isTraining && trainingJobId && (
        <TrainingSequence 
          isComplete={isTrainingComplete} 
        />
      )}

      {results && (
        <ResultsView results={results} />
      )}
    </main>
  );
}
