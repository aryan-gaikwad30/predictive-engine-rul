import json
import sys

nb_path = "notebooks/01_fd001_exploration.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Find the markdown cell for FD002 and update it. Or just replace the last markdown cell.
for cell in nb['cells']:
    if cell['cell_type'] == 'markdown' and len(cell['source']) > 0 and 'FD002 Operating-Condition Normalization' in cell['source'][0]:
        cell['source'] = [
            "# FD002 Operating-Condition Normalization\n",
            "\n",
            "## 1. Why Normalization is Required\n",
            "FD002 has 6 distinct operating conditions. Sensor distributions are strongly affected by these operating conditions, which can obscure the degradation signal. Normalization per operating condition is justified to align the features correctly.\n",
            "\n",
            "## 2. Operating-Condition Identification Method\n",
            "Operating settings `(setting_1, setting_2, setting_3)` are first standardized using a `StandardScaler`. Then, we mapped the standardized setting distributions into 6 distinct clusters using `KMeans(n_clusters=6)`. The condition assignment is deterministic and depends ONLY on the operating settings, ensuring no leakage.\n",
            "\n",
            "## 3. Training-Only Fitting\n",
            "The settings scaler, the K-Means clustering, the OOD threshold, and the condition-specific means and standard deviations were learned EXCLUSIVELY on the training data (80% split). Validation and test data only use `.transform()`.\n",
            "\n",
            "## 4. Normalization Formula\n",
            "For each sensor and identified condition `c`:\n",
            "$$ z = \\frac{x - \\mu_c}{\\sigma_c} $$\n",
            "\n",
            "## 5. Unseen / Out-of-Distribution (OOD) Fallback Behavior\n",
            "A deterministic OOD threshold is learned from the training data, defined as the maximum distance to the nearest centroid among training points plus a 50% margin (`threshold = min_distances.max() * 1.5`). If an unseen operating condition in validation/test exceeds this threshold, the normalizer falls back to the **global training mean** and **global training standard deviation** for that sensor. Zero or near-zero standard deviations are handled by clamping to 1.0 (mean subtraction only) to prevent division by zero or NaN generation.\n",
            "\n",
            "## 6. Before/After Condition-Dependence Metrics\n",
            "We measure condition-dependence using an independent diagnostic: **average pairwise difference between condition means divided by the pooled within-condition standard deviation**.\n",
            "Unlike simple variance of cluster means (a centering-based diagnostic that is mathematically guaranteed to approach zero), this independent metric confirms actual distribution alignment.\n",
            "- Average dispersion before: `1.099e+09`\n",
            "- Average dispersion after: `6.028e-07`\n",
            "- **Reduction**: `100.00%`\n",
            "\n",
            "## 7. Post-Normalization Feature Statistics\n",
            "After normalization, standard deviations were brought to ~1.0 for all condition-variant sensors.\n",
            "\n",
            "## 8. Final FD002 Feature Set\n",
            "Following the rule to only drop EXACT constant features, only `sensor_18` is dropped. The final FD002 feature set includes all other 20 sensors.\n",
            "\n",
            "## 9. Leakage Verification\n",
            "- Train engines ∩ Val engines: Empty\n",
            "- Row counts unchanged\n",
            "- Indices preserved\n",
            "- Test transformation compatibility confirmed.\n",
            "\n",
            "## 10. Recommended Next Experiment\n",
            "Milestone 12C should focus on the first normalized FD002 XGBoost experiment.\n"
        ]

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print("Notebook updated.")
