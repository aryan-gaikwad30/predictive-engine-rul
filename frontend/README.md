# Predictive Engine — Frontend Application

Interactive Next.js user interface for the **Predictive Engine** Remaining Useful Life (RUL) and fleet health intelligence platform.

[![Next.js](https://img.shields.io/badge/Next.js%2016-App%20Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-UI%20Components-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20Tests-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 🌟 Overview

The frontend delivers a streamlined condition-based maintenance interface that allows engineers and operators to:
1. **Upload & Profile Telemetry:** Upload arbitrary multi-sensor CSV datasets or load the bundled NASA C-MAPSS 100-engine demo dataset.
2. **Configure Pipeline Schema:** Inspect automatically inferred entity, time, target, feature, and operating condition columns.
3. **Monitor Asynchronous Training:** Track real-time training progress against the FastAPI backend via polling.
4. **Inspect Fleet Health Triage:** View categorized fleet status (`CRITICAL`, `WARNING`, `HEALTHY`) and mean predicted RUL.
5. **Analyze Single-Machine Trajectories:** Select specific engines to inspect predicted vs. actual degradation curves and multi-sensor telemetry trends over operating cycles.
6. **Review Model Performance & Interpretability:** Inspect validation RMSE, MAE, NASA PHM08 asymmetric loss, and top feature importance rankings.

---

## 📁 Key Components & Structure

```
frontend/src/
├── app/
│   ├── layout.tsx         # Root layout with fonts, metadata, and dark theme
│   └── page.tsx           # Main unified application controller and state machine
├── components/
│   ├── layout/
│   │   └── Navbar.tsx     # Navigation bar with live backend health indicator & reset
│   ├── sections/
│   │   ├── Hero.tsx               # Landing hero view with live API health check
│   │   ├── Storytelling.tsx       # Industrial predictive maintenance context
│   │   ├── ModelStory.tsx         # Detailed metrics (RMSE, NASA Score) & feature importance
│   │   ├── UploadSection.tsx      # CSV upload dropzone & sample dataset selector
│   │   ├── ProfileAndConfig.tsx   # Schema profiling & target RUL configuration
│   │   ├── TrainingSequence.tsx   # Model training animation & progress polling
│   │   ├── ResultsView.tsx        # Fleet health triage, machine selector & Recharts curves
│   │   ├── Engineering.tsx        # Engineering deep dives & architectural notes
│   │   ├── ProjectJourney.tsx     # Milestone evolution & engineering journey
│   │   └── About.tsx              # System boundaries, guardrails & technical specs
│   └── ui/
│       └── InteractiveBackground.tsx  # Dynamic particle / ambient canvas background
└── lib/
    └── api.ts             # Type-safe API client for FastAPI backend communication
```

---

## ⚙️ Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production deployment (e.g. Vercel), set `NEXT_PUBLIC_API_URL` to the production backend endpoint:
```env
NEXT_PUBLIC_API_URL=https://predictive-engine-rul.onrender.com
```

---

## 🚀 Development & Build Scripts

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run Vitest test suite
npm run test

# Run ESLint code style check
npm run lint

# Compile production bundle
npm run build
```

---

## 🧪 Testing

The frontend is tested using **Vitest** and **React Testing Library**:
```bash
npm run test
```
