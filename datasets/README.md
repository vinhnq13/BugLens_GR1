# datasets/

This directory contains datasets used for training and evaluating the BugLens AI service.

| Subfolder | Contents |
|---|---|
| `raw/` | Original, unprocessed bug report data (CSV, JSON) |
| `processed/` | Cleaned, labeled, and feature-engineered data ready for model training |

## Data Sources

- Publicly available bug report datasets (e.g., from GitHub Issues, Bugzilla)
- Synthetic data generated for testing
- Labeled samples produced during project development

## Usage

Data in this directory is used exclusively by `services/ai-service/` for model training and evaluation. It is **not served** by any API endpoint.

> ⚠️ Sensitive or large datasets should be added to `.gitignore` and managed separately.
