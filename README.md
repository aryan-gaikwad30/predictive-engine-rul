# Predictive Engine — Health & Remaining Useful Life (RUL) Platform

## 1. Project Title
Predictive Engine — Health & Remaining Useful Life (RUL) Platform

## 2. Product Vision
To build a real B2B predictive-maintenance platform where companies can upload industrial/engine telemetry datasets and receive RUL predictions, health analysis, fleet insights, and maintenance-policy comparisons through a premium product experience.

## 3. Business Problem
Unplanned downtime in industrial equipment leads to significant revenue loss, safety hazards, and inefficient maintenance scheduling. Companies need to transition from reactive or purely schedule-based maintenance to predictive Condition-Based Maintenance (CBM).

## 4. Predictive Maintenance / CBM Explanation
Predictive maintenance utilizes historical sensor data and machine learning to predict when equipment will fail (Remaining Useful Life - RUL). This allows organizations to perform maintenance exactly when it is needed, optimizing the lifecycle of components and minimizing downtime.

## 5. NASA C-MAPSS Description
The NASA Commercial Modular Aero-Propulsion System Simulation (C-MAPSS) dataset is a widely used benchmark for predictive maintenance. It consists of simulated turbofan engine degradation data over multiple operational cycles. The data includes operational settings and multiple sensor readings (temperature, pressure, fan speed, etc.) leading up to engine failure.

## 6. Why FD001 is the First Development Subset
FD001 is the simplest subset with a single operating condition and a single fault mode (HPC degradation). Focusing on FD001 allows us to establish a reliable data foundation, validation pipeline, and initial baseline models before introducing the complexity of multiple operating conditions and fault modes.

## 7. Future FD004 Generalization
FD004 is the most complex subset, containing multiple operating conditions and multiple fault modes. Ultimately, our platform's models and pipelines must generalize to handle this level of complexity.

## 8. High-Level Architecture
1. **Raw Data:** Telemetry datasets
2. **Data Pipeline:** Ingestion and validation
3. **Feature Engineering:** Signal processing, rolling statistics, health indicators
4. **ML Engine:** Sequence modeling for degradation prediction
5. **RUL / Health Engine:** Business logic layer for health and RUL
6. **FastAPI Backend:** API layer
7. **React Frontend:** Premium product interface

## 9. Custom Dataset Support
The platform now supports profiling and preparing arbitrary tabular industrial datasets (CSV).
- **Dataset profiling is automatic**: The system uses heuristics to identify Entity, Time, Target, Feature, and Operating Condition columns.
- **Ambiguity is surfaced**: If multiple columns are candidates for a role, the system surfaces a warning rather than silently guessing.
- **Explicit configuration**: Users can override automatic detection by providing a explicit column configuration (`DatasetConfig`).
- Model training on arbitrary custom datasets is planned for the next product stage.

## 10. Current Phase
**Phase 1: Data Foundation + Baseline RUL Prediction** (Specifically Milestone 1: Project Foundation + C-MAPSS Data Ingestion).

## 11. Future Roadmap
- **Phase 1:** Data foundation + baseline RUL prediction
- **Phase 2:** Sequence/degradation modeling
- **Phase 3:** Health index + status + uncertainty
- **Phase 4:** FastAPI backend
- **Phase 5:** React product frontend
- **Phase 6:** FD004 generalization
- **Phase 7:** Deployment/product hardening
