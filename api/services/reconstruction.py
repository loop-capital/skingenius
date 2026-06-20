"""
SKINgenius Treatment Simulation API — Reconstruction Service
============================================================
Loads FLAME 2023 Open, extracts MediaPipe landmarks from selfies,
and stores the resulting parameter bundle in an in-memory dict.
"""
from __future__ import annotations

import base64
import io
import pickle
import uuid
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image

# Guard MediaPipe import gracefully (may not have camera/GPU deps in some envs)
try:
    import mediapipe as mp
    _MP_AVAILABLE = True
except Exception:
    _MP_AVAILABLE = False
    mp = None

from api.config import FLAME_MODEL_PATH, N_EXPRESSION, N_IDENTITY, mesh_store


# ---------------------------------------------------------------------------
# FLAME wrapper
# ---------------------------------------------------------------------------

class FLAMEModel:
    """Minimal wrapper around FLAME 2023 Open model data."""

    def __init__(self, model_dict: dict, n_expr: int = N_EXPRESSION):
        self.v_template: np.ndarray = model_dict["v_template"]             # (V, 3)
        self.faces: np.ndarray = model_dict["f"]                           # (F, 3)
        shapedirs = model_dict["shapedirs"]                                # (V, 3, 400)
        # shapedirs bundles identity + expression PCs.
        self.identity_shapedirs = shapedirs[:, :, :-n_expr]                # (V, 3, 300)
        self.expr_shapedirs = shapedirs[:, :, -n_expr:]                  # (V, 3, n_expr)
        self.n_expr = n_expr
        self.V = self.v_template.shape[0]

    @classmethod
    def load(cls, path: Path | None = None) -> "FLAMEModel":
        path = path or FLAME_MODEL_PATH
        if not path.exists():
            raise FileNotFoundError(f"FLAME model not found at {path}")
        with open(path, "rb") as f:
            dd = pickle.load(f, encoding="latin1")
        return cls(dd)

    def verts(
        self,
        *,
        beta: np.ndarray | None = None,
        theta: np.ndarray | None = None,
    ) -> np.ndarray:
        """Generate mesh vertices from identity (β) and expression (θ) params."""
        out = self.v_template.copy().astype(np.float64)

        if beta is not None:
            beta = np.asarray(beta, dtype=np.float64)
            target = self.identity_shapedirs.shape[2]
            beta = _pad_or_trim(beta, target)
            out += np.tensordot(self.identity_shapedirs, beta, axes=([2], [0]))

        if theta is not None:
            theta = np.asarray(theta, dtype=np.float64)
            target = self.n_expr
            theta = _pad_or_trim(theta, target)
            out += np.tensordot(self.expr_shapedirs, theta, axes=([2], [0]))

        return out


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pad_or_trim(arr: np.ndarray, target: int) -> np.ndarray:
    if arr.size < target:
        padded = np.zeros(target, dtype=np.float64)
        padded[: arr.size] = arr.flatten()
        return padded
    if arr.size > target:
        return arr[:target].flatten()
    return arr.flatten()


# Lazy singleton — loaded on first use
_flame_instance: FLAMEModel | None = None


def get_flame() -> FLAMEModel:
    global _flame_instance
    if _flame_instance is None:
        _flame_instance = FLAMEModel.load()
    return _flame_instance


# ---------------------------------------------------------------------------
# Landmark extraction (MediaPipe)
# ---------------------------------------------------------------------------

class LandmarkResult:
    """Container for MediaPipe face-mesh output."""

    def __init__(self, landmarks: list[tuple[float, float, float]], image_size: tuple[int, int]):
        self.landmarks = landmarks
        self.image_size = image_size


def extract_landmarks(image_bytes: bytes) -> LandmarkResult:
    """Run MediaPipe Face Mesh on a selfie and return 468 3-D landmarks."""
    if not _MP_AVAILABLE:
        raise RuntimeError("MediaPipe is not installed / available in this environment")

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    arr = np.array(img)

    mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    )
    results = mp_face_mesh.process(arr)
    if not results.multi_face_landmarks:
        raise ValueError("No face detected in the provided image")

    face_landmarks = results.multi_face_landmarks[0]
    pts = [(lm.x, lm.y, lm.z) for lm in face_landmarks.landmark]
    return LandmarkResult(landmarks=pts, image_size=(w, h))


# ---------------------------------------------------------------------------
# Reconstruction facade
# ---------------------------------------------------------------------------

def reconstruct_from_selfie(image_bytes: bytes) -> dict:
    """
    1. Detect face landmarks via MediaPipe.
    2. Create a neutral FLAME mesh placeholder.
    3. Store in the in-memory mesh_store keyed by UUID.

    NOTE: Full DECA-based FLAME fitting is out-of-scope for this PoC;
          we store *placeholder* beta/theta derived heuristically from
          landmark extents so the downstream deformation pipeline has
          something realistic to work with.
    """
    lm_result = extract_landmarks(image_bytes)
    flame = get_flame()

    # ---- Heuristic: derive simple shape/expression priors from landmarks ----
    # In a real system DECA would regress beta/theta from the photo itself.
    # For the PoC we inject mild random variation so every selfie looks slightly
    # different and so preview deformation is visible.
    rng = np.random.default_rng(seed=42)  # deterministic for reproducibility
    beta = rng.normal(loc=0.0, scale=0.5, size=N_IDENTITY).astype(np.float64)
    theta = np.zeros(N_EXPRESSION, dtype=np.float64)

    # Encode face width → beta dimension 0 (first PC often correlates with width)
    xs = [p[0] for p in lm_result.landmarks]
    face_width = max(xs) - min(xs)
    beta[0] = (face_width - 0.35) * 2.0  # very crude scaling heuristic

    verts = flame.verts(beta=beta, theta=theta)
    mesh_id = str(uuid.uuid4())

    mesh_store[mesh_id] = {
        "vertices": verts,
        "faces": flame.faces.copy(),
        "beta": beta.tolist(),
        "theta": theta.tolist(),
        "psi": [0.0] * 6,
        "image_size": lm_result.image_size,
    }

    return {
        "mesh_id": mesh_id,
        "landmarks_count": len(lm_result.landmarks),
        "face_params": {
            "beta": beta.tolist(),
            "theta": theta.tolist(),
            "psi": [0.0] * 6,
        },
    }
