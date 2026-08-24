"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Storytelling from "@/components/sections/Storytelling";
import UploadSection from "@/components/sections/UploadSection";
import ProfileAndConfig from "@/components/sections/ProfileAndConfig";
import TrainingSequence from "@/components/sections/TrainingSequence";
import ResultsView from "@/components/sections/ResultsView";
import { uploadProfile, startTraining, pollJobStatus, getPredictions, ProfileResponse, PredictionResponse } from "@/lib/api";

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
      const res = await uploadProfile(uploadedFile);
      setProfile(res);
      // Scroll to profile
      setTimeout(() => {
        document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
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
    } catch (err: any) {
      setUploadError("Failed to load demo dataset");
      setIsUploading(false);
    }
  };

  const handleTrain = async (config: any) => {
    if (!file) return;
    setIsTraining(true);
    try {
      const res = await startTraining(file, config);
      setTrainingJobId(res.job_id);
      
      // Because M16 is currently synchronous under the hood, 
      // startTraining actually waits for the job to complete on the backend 
      // before returning (unless they implemented background tasks).
      // We will pretend to poll to respect the contract, but it's likely done.
      let isDone = false;
      while (!isDone) {
        const statusRes = await pollJobStatus(res.job_id);
        if (statusRes.status === "completed") {
          isDone = true;
          setIsTrainingComplete(true);
          const predRes = await getPredictions(res.job_id);
          setResults(predRes);
          // Scroll to results
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
          }, 1500);
        } else if (statusRes.status === "failed") {
          throw new Error("Training failed");
        } else {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (err: any) {
      alert("Training error: " + err.message);
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

      {isTraining && !results && (
        <TrainingSequence jobId={trainingJobId || ""} isComplete={isTrainingComplete} />
      )}

      {results && (
        <ResultsView results={results} />
      )}
    </main>
  );
}
