# Product Preview Screenshots Guide

This directory is designated for storing real UI screenshots captured directly from the deployed production application ([predictive-engine-rul.vercel.app](https://predictive-engine-rul.vercel.app)).

---

## 📸 Required Screenshot Specifications

To maintain a consistent, high-fidelity portfolio presentation, capture screenshots using the following exact specifications:

### 1. Hero / Landing Experience
* **Filename:** `hero_dashboard.png`
* **Page State:** Root landing view (`https://predictive-engine-rul.vercel.app/`)
* **Recommended Viewport:** `1920 x 1080` (Desktop, Dark Theme)
* **What Should Be Visible:**
  * Application header and title ("Predictive Engine")
  * Live Backend API Status indicator (showing green "ONLINE" status)
  * Problem statement / value proposition cards
  * "Analyze Custom Dataset" and "Load C-MAPSS Demo" action CTAs
* **What Should NOT Appear:** Browser developer tools, bookmark bars, or extension icons.

---

### 2. Dataset Profiling & Schema Configuration
* **Filename:** `dataset_configuration.png`
* **Page State:** After uploading a CSV or clicking "Load C-MAPSS Demo"
* **Recommended Viewport:** `1920 x 1080` (Desktop)
* **What Should Be Visible:**
  * Dataset summary statistics (Total Rows: 20,631, Columns: 26, Missing Values: 0)
  * Automated entity detection (`unit_number` / `unit`)
  * Automated temporal sequence detection (`time_in_cycles` / `cycle`)
  * Inferred target column (`RUL`) with semantics set to `rul`
  * Sensor feature candidates and operating condition selector
  * "Start Model Training" action button
* **What Should NOT Appear:** File system picker dialogs or upload error banners.

---

### 3. Fleet Health Intelligence & Results Dashboard
* **Filename:** `fleet_health.png`
* **Page State:** Completed training view (`#results`)
* **Recommended Viewport:** `1920 x 1080` (Desktop)
* **What Should Be Visible:**
  * Fleet Health Triage KPI cards: Total Units, Critical ($RUL \le 25$), Warning ($RUL \le 50$), Healthy ($RUL > 50$), Mean Fleet RUL
  * Interactive Engine / Unit selector dropdown
  * Actual vs. Predicted RUL Degradation Trajectory chart (Recharts line chart)
  * Real-time Multi-Sensor Telemetry trend visualization
  * Maintenance Urgency Gauge indicator
* **What Should NOT Appear:** Incomplete loading spinners or truncated charts.

---

### 4. Model Story & Validation Diagnostics
* **Filename:** `model_story.png`
* **Page State:** Model Performance & Diagnostics section
* **Recommended Viewport:** `1920 x 1080` (Desktop)
* **What Should Be Visible:**
  * Validation Metrics card: RMSE (17.90), MAE, NASA PHM08 Asymmetric Penalty Score (831.55)
  * Early vs. Late prediction percentage breakdown
  * Top Feature Importance (Gain / Weight) bar chart
  * Unit-by-unit validation error distribution table
* **What Should NOT Appear:** Unstyled text or unrendered LaTeX formulas.

---

## 🔗 How to Embed in README.md

Once saved in this directory, link screenshots directly in markdown:

```markdown
![Hero Dashboard](docs/screenshots/hero_dashboard.png)
![Dataset Profiling](docs/screenshots/dataset_configuration.png)
![Fleet Health Dashboard](docs/screenshots/fleet_health.png)
![Model Story & Diagnostics](docs/screenshots/model_story.png)
```
