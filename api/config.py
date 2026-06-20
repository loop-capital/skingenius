"""
SKINgenius Treatment Simulation API — Configuration
=====================================================
Central config.  Keep secrets out of this file in production.
"""
from pathlib import Path

# Directories
API_ROOT = Path(__file__).resolve().parent
WORKSPACE = API_ROOT.parent
DATA_DIR = WORKSPACE / "data"
MODELS_DIR = DATA_DIR / "models" / "flame"
OUT_DIR = DATA_DIR / "visualizations"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# FLAME model
FLAME_MODEL_PATH = MODELS_DIR / "flame2023_Open.pkl"

# FLAME dimensions
N_IDENTITY = 300
N_EXPRESSION = 100
N_POSE = 6

# In-memory mesh store (production: Redis / Postgres)
mesh_store: dict = {}

# Treatment catalogue
TREATMENTS = [
    {
        "name": "Botox — Forehead",
        "type": "botox",
        "zones": ["forehead"],
        "description": "Smooth horizontal forehead lines by relaxing the frontalis muscle. "
                       "Units: 10–30. Onset 3–7 days, lasts 3–4 months.",
        "price_range": {"min": 200, "max": 400},
    },
    {
        "name": "Botox — Crow’s Feet",
        "type": "botox",
        "zones": ["crow_feet"],
        "description": "Soften lateral orbital rhytids by relaxing orbicularis oculi. "
                       "Units: 6–15 per side.",
        "price_range": {"min": 150, "max": 350},
    },
    {
        "name": "Filler — Lips",
        "type": "filler",
        "zones": ["lips"],
        "description": "Add vermillion volume, define border, or correct asymmetry. "
                       "Volume: 0.5–1.5 mL per session. HA products (Juvederm, Restylane).",
        "price_range": {"min": 500, "max": 900},
    },
    {
        "name": "Filler — Cheeks",
        "type": "filler",
        "zones": ["cheeks"],
        "description": "Restore malar projection and soften submalar hollowing. "
                       "Volume: 1.0–2.0 mL per side. Lasts 12–18 months with Voluma.",
        "price_range": {"min": 800, "max": 1600},
    },
    {
        "name": "Filler — Jawline",
        "type": "filler",
        "zones": ["jawline"],
        "description": "Augment mandibular border and pre-jowl sulcus for sharper contour. "
                       "Volume: 1.5–3.0 mL per side.",
        "price_range": {"min": 900, "max": 2000},
    },
]
