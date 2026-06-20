"""
SKINgenius Treatment Simulation API — Deformation Service
===========================================================
Applies treatment-specific modifications to FLAME parameters.

Mapping summary (from ADR-006):
• Botox  → attenuates θ (expression PCs) for the targeted muscles.
• Filler → modifies β (identity PCs) to simulate soft-tissue volume.
"""
from __future__ import annotations

import math

import numpy as np

from api.config import N_EXPRESSION, N_IDENTITY
from api.services.reconstruction import get_flame


# ---------------------------------------------------------------------------
# Botox — expression suppression
# ---------------------------------------------------------------------------

# Mapping of treatment_zone → indices in FLAME expression PCA that most
# strongly correlate with the muscle group.  Based on the architecture doc:
#   forehead   → brow raise / surprise / forehead tension
#   crow_feet  → squint / eye closure / laugh lines
_BOTOX_ZONE_PCS: dict[str, list[int]] = {
    "forehead": [0, 2, 14],
    "crow_feet": [8, 16, 21],
}

# Reference dose-response (sigmoid parameters)
_BOTOX_HALF_EFFECT_DOSE = 20.0   # units for 50 % of max effect
_BOTOX_MAX_REDUCTION = -0.85     # 85 % activation reduction at saturation
_BOTOX_SLOPE = 0.12


def _sigmoid_reduction(dose_units: float, sensitivity: float = 1.0) -> float:
    """Convert Botox dose (units) into a normalised activation-reduction factor."""
    ratio = 1.0 / (1.0 + math.exp(-_BOTOX_SLOPE * (dose_units - _BOTOX_HALF_EFFECT_DOSE)))
    return _BOTOX_MAX_REDUCTION * ratio * sensitivity


def apply_botox(
    beta: np.ndarray,
    theta: np.ndarray,
    zone: str,
    params: dict,
) -> tuple[np.ndarray, np.ndarray, float]:
    """
    Attenuate the expression PCs that drive the targeted muscle group.

    Returns (new_beta, new_theta, max_displacement_mm).
    """
    units = float(params.get("units", 20.0))
    sensitivity = float(params.get("sensitivity", 1.0))

    reduction = _sigmoid_reduction(units, sensitivity)
    pc_indices = _BOTOX_ZONE_PCS.get(zone, [0, 2])

    theta_new = theta.copy()
    for idx in pc_indices:
        if idx < theta_new.size:
            # Reduction is negative; here we subtract |reduction| from current val
            # If the user had raised brows (positive PC weight) Botox pushes toward 0.
            theta_new[idx] *= max(0.0, 1.0 + reduction)

    flame = get_flame()
    v_before = flame.verts(beta=beta, theta=theta)
    v_after = flame.verts(beta=beta, theta=theta_new)
    disp = float(np.linalg.norm(v_after - v_before, axis=1).max() * 1000.0)  # metres → mm
    return beta.copy(), theta_new, disp


# ---------------------------------------------------------------------------
# Filler — shape modification
# ---------------------------------------------------------------------------

# Mapping of treatment_zone → (β_PC_index, scale_factor_per_mL)
# In a full implementation these would come from a learned regression model
# trained on paired before/after scans.  For the PoC we hand-pick plausible
# dimensions informed by FLAME semantic interpretation literature.
_FILLER_ZONE_SHAPE_PCS: dict[str, list[tuple[int, float]]] = {
    "lips": [
        (141, +0.25),   # lip protrusion
        (142, +0.15),   # lip width
        (144, -0.10),   # philtrum depth (shallower with fuller lips)
    ],
    "cheeks": [
        (86, +0.20),    # cheek projection
        (87, +0.10),    # cheek width
        (88, -0.12),    # submalar hollow reduction
    ],
    "jawline": [
        (91, +0.25),    # jaw angle definition
        (92, +0.12),    # jaw width
        (93, -0.15),    # pre-jowl sulcus shallowing
    ],
}


def apply_filler(
    beta: np.ndarray,
    theta: np.ndarray,
    zone: str,
    params: dict,
) -> tuple[np.ndarray, np.ndarray, float]:
    """
    Add volume by shifting identity shape PCs associated with the zone.

    Returns (new_beta, new_theta, max_displacement_mm).
    """
    volume_ml = float(params.get("volume_ml", 1.0))
    product_factor = float(params.get("product_factor", 1.0))  # stiffer = more projection

    mods = _FILLER_ZONE_SHAPE_PCS.get(zone, [(0, 0.0)])
    beta_new = beta.copy()
    for pc_idx, per_ml in mods:
        if pc_idx < beta_new.size:
            beta_new[pc_idx] += per_ml * volume_ml * product_factor

    flame = get_flame()
    v_before = flame.verts(beta=beta, theta=theta)
    v_after = flame.verts(beta=beta_new, theta=theta)
    disp = float(np.linalg.norm(v_after - v_before, axis=1).max() * 1000.0)
    return beta_new, theta.copy(), disp


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

TREATMENT_HANDLERS = {
    "botox": apply_botox,
    "filler": apply_filler,
}


def apply_treatment(
    beta: np.ndarray,
    theta: np.ndarray,
    treatment_type: str,
    zone: str,
    params: dict,
) -> tuple[np.ndarray, np.ndarray, float]:
    handler = TREATMENT_HANDLERS.get(treatment_type)
    if handler is None:
        raise ValueError(f"Unknown treatment type: {treatment_type!r}")
    return handler(beta, theta, zone, params)
