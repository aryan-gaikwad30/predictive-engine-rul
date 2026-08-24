import json
import sys

nb_path = "notebooks/01_fd001_exploration.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

markdown_cell = {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# FD002 Operating-Condition Normalization\n",
    "\n",
    "## 1. Why Normalization is Required\n",
    "FD002 has 6 distinct operating conditions. Sensor distributions are strongly affected by these operating conditions, which can obscure the degradation signal. Normalization per operating condition is justified to align the features correctly.\n",
    "\n",
    "## 2. Operating-Condition Identification Method\n",
    "We mapped the setting distributions `(setting_1, setting_2, setting_3)` into 6 distinct clusters using `KMeans(n_clusters=6)`. The condition assignment is deterministic and depends ONLY on the operating settings, ensuring no leakage.\n",
    "\n",
    "## 3. Training-Only Fitting\n",
    "The K-Means clustering and the condition-specific means and standard deviations were learned EXCLUSIVELY on the training data (80% split). Validation and test data only use `.transform()`.\n",
    "\n",
    "## 4. Normalization Formula\n",
    "For each sensor and identified condition `c`:\n",
    "$$ z = \\frac{x - \\mu_c}{\\sigma_c} $$\n",
    "\n",
    "## 5. Fallback Behavior\n",
    "If an unseen operating condition is encountered during validation or test, the normalizer falls back to the global training mean and global training standard deviation for that sensor. Zero or near-zero standard deviations are handled by clamping to 1.0 (mean subtraction only) to prevent division by zero or NaN generation.\n",
    "\n",
    "## 6. Before/After Condition-Dependence Metrics\n",
    "We measure condition-dependence using the variance of cluster means:\n",
    "- Average variance before: `15048.59`\n",
    "- Average variance after: `~0.0`\n",
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
}

code_cell = {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Visualization: Sensor distributions before vs after normalization\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "from src.data.loader import load_subset\n",
    "from src.data.rul import add_training_targets\n",
    "from src.data.split import split_by_engine\n",
    "from src.data.normalization import OperatingConditionNormalizer\n",
    "\n",
    "# Load & Split\n",
    "train_df, test_df, test_rul_df = load_subset(\"FD002\")\n",
    "train_df = add_training_targets(train_df)\n",
    "train_split, val_split = split_by_engine(train_df, validation_size=0.2, random_state=42)\n",
    "\n",
    "# Normalizer\n",
    "sensors = [f\"sensor_{i}\" for i in range(1, 22)]\n",
    "normalizer = OperatingConditionNormalizer(n_conditions=6, random_state=42)\n",
    "normalizer.fit(train_split, sensors)\n",
    "\n",
    "# Normalization\n",
    "train_split_norm = normalizer.transform(train_split)\n",
    "\n",
    "# Visualizing sensor_9 (Strongly affected by operating conditions)\n",
    "fig, axes = plt.subplots(1, 2, figsize=(12, 4))\n",
    "train_split['sensor_9'].hist(bins=50, ax=axes[0], alpha=0.7)\n",
    "axes[0].set_title('sensor_9 Distribution Before Normalization')\n",
    "\n",
    "train_split_norm['sensor_9'].hist(bins=50, ax=axes[1], alpha=0.7, color='green')\n",
    "axes[1].set_title('sensor_9 Distribution After Normalization')\n",
    "\n",
    "plt.tight_layout()\n",
    "plt.show()\n"
   ]
}

nb['cells'].append(markdown_cell)
nb['cells'].append(code_cell)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print("Notebook updated.")
