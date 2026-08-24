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

## Product Frontend (M17)

The frontend is a commercial-quality, design-led Next.js application built with React, TypeScript, Tailwind CSS, and Framer Motion. It consumes the FastAPI backend.

### Architecture

```
Frontend (Next.js)
   ↓
FastAPI Backend
   ↓
Dataset Profiling & Abstraction
   ↓
Leakage-Safe ML Pipeline
   ↓
XGBoost Regression
   ↓
Predictions & Maintenance Insights
```

### Running the Application

1. **Start the Backend:**
   Ensure you have installed the Python dependencies and activated the virtual environment (`.venv-cnn`).
   ```bash
   python -m uvicorn src.api.app:app --reload
   ```

2. **Start the Frontend:**
   Navigate to the `frontend/` directory and run:
   ```bash
   npm install
   npm run dev
   ```

3. **Demo Workflow:**
   - Open `http://localhost:3000`
   - Scroll through the storytelling experience
   - Click **TRY DEMO DATASET** to automatically upload the synthetic industrial dataset (`public/demo_dataset.csv`)
   - Confirm the detected schema and click **Train Model**
   - The system will execute the pipeline synchronously and visualize the RUL, Maintenance Horizon, and Feature Importance.

## 9. Custom Dataset Support
The platform now supports end-to-end integration of arbitrary tabular industrial datasets (CSV).
- **Dataset profiling is automatic**: The system uses heuristics to identify Entity, Time, Target, Feature, and Operating Condition columns.
- **Ambiguity is surfaced**: If multiple columns are candidates for a role, the system surfaces a warning rather than silently guessing.
- **Explicit configuration**: Users can override automatic detection by providing a explicit column configuration (`DatasetConfig`).
- **Leakage-Safe XGBoost Pipeline**: Prepared custom datasets can be fed directly into `train_custom_xgboost`, which performs deterministic entity-aware splitting, train-only constant feature removal, and train-only operating condition normalization.

## 10. Backend API
The platform provides a FastAPI backend to communicate with the ML engine. 

### How to start the API:
```bash
uvicorn src.api.app:app --reload
```
You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.

### Available Endpoints:
- `GET /health`: Basic health check.
- `POST /profile`: Upload a CSV dataset to get an automated feature and schema profile.
- `POST /train`: Upload a CSV dataset to execute the full leakage-safe XGBoost training pipeline. Returns a `job_id`.
- `GET /job/{job_id}`: Poll for training status (e.g., queued, running, completed, failed).
- `GET /prediction/{job_id}`: Retrieve training results, model metrics, maintenance metrics, and prediction arrays.

*Note: This is a local prototype. Jobs are stored in memory, and authentication/databases are not implemented yet. The React frontend will consume these endpoints in the next phase.*

## 11. Current Phase
**Phase 1: Data Foundation + Baseline RUL Prediction** (Specifically Milestone 16: Product Backend / API Contract).

## 12. Future Roadmap
- **Phase 1:** Data foundation + baseline RUL prediction
- **Phase 2:** Sequence/degradation modeling
- **Phase 3:** Health index + status + uncertainty
- **Phase 4:** FastAPI backend
- **Phase 5:** React product frontend
- **Phase 6:** FD004 generalization
- **Phase 7:** Deployment/product hardening
