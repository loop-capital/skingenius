#!/usr/bin/env python3
"""
FLAME Treatment Deformation Proof of Concept
=============================================
Loads FLAME 2023 Open, generates 3D face meshes, applies treatment-specific
(expression) deformations, and visualizes before / after side-by-side.

Author:  SKINgenius Architect (Dermis)
Date:    2026-06-10
"""
from __future__ import annotations

import argparse
import os
import pickle
import sys
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
FLAME_PATH = ROOT / "data" / "models" / "flame" / "flame2023_Open.pkl"
OUT_DIR = ROOT / "data" / "visualizations"
OUT_DIR.mkdir(parents=True, exist_ok=True)

N_EXPR = 100

# Expression PCs that strongly affect forehead / brow raising.
# In FLAME, early expression components tend to encode eyebrow raise,
# surprise, and similar upper-face motions.  We use the first 5 PCs
# with moderate positive weights.
MAX_EXPR_PARAMS = np.array([2.0, 1.5, 1.0, 0.8, 0.5] + [0.0] * (N_EXPR - 5))

BOTOX_REDUCTION = 0.55          # global suppression factor for the chosen PCs
MOVE_THRESHOLD_MM = 0.75      # vertex displacement threshold for colouring

# ---------------------------------------------------------------------------
# FLAME helpers
# ---------------------------------------------------------------------------


class FLAMEModel:
    """Minimal wrapper around FLAME 2023 Open model data."""

    def __init__(self, model_dict: dict, n_expr: int = N_EXPR):
        self.v_template: np.ndarray = model_dict["v_template"]              # (V, 3)
        self.faces: np.ndarray = model_dict["f"]                            # (F, 3)
        shapedirs = model_dict["shapedirs"]                                 # (V, 3, 400)
        self.identity_shapedirs = shapedirs[:, :, :-n_expr]                # (V, 3, 300)
        self.expr_shapedirs = shapedirs[:, :, -n_expr:]                    # (V, 3, n_expr)
        self.n_expr = n_expr
        self.V = self.v_template.shape[0]

    def verts(self, *, beta: np.ndarray | None = None, theta: np.ndarray | None = None) -> np.ndarray:
        """
        Generate mesh vertices.

        Parameters
        ----------
        beta : ndarray, shape (300,) or None
            Identity (shape) parameters.  Neutral == zeros.
        theta : ndarray, shape (100,) or None
            Expression parameters.  Neutral == zeros.

        Returns
        -------
        verts : ndarray, shape (V, 3)
        """
        out = self.v_template.copy().astype(np.float64)

        if beta is not None:
            beta = np.asarray(beta, dtype=np.float64)
            if beta.size < self.identity_shapedirs.shape[2]:
                pad = np.zeros(self.identity_shapedirs.shape[2], dtype=np.float64)
                pad[:beta.size] = beta.flatten()
                beta = pad
            elif beta.size > self.identity_shapedirs.shape[2]:
                beta = beta[: self.identity_shapedirs.shape[2]]
            out += np.tensordot(self.identity_shapedirs, beta, axes=([2], [0]))

        if theta is not None:
            theta = np.asarray(theta, dtype=np.float64)
            if theta.size < self.n_expr:
                pad = np.zeros(self.n_expr, dtype=np.float64)
                pad[:theta.size] = theta.flatten()
                theta = pad
            elif theta.size > self.n_expr:
                theta = theta[: self.n_expr]
            out += np.tensordot(self.expr_shapedirs, theta, axes=([2], [0]))

        return out


# ---------------------------------------------------------------------------
# Geometry utilities
# ---------------------------------------------------------------------------


def forehead_mask(verts: np.ndarray) -> np.ndarray:
    """
    Boolean mask for vertices in the forehead / brow region.

    Heuristic: upper face, near the front of the skull, excluding ears.
    """
    y_top = np.percentile(verts[:, 1], 78)          # upper face
    z_front = verts[:, 2].max()                     # tip of nose / forehead protrusion
    z_thresh = z_front - 0.030                      # within ~3 cm behind front
    mask = (
        (verts[:, 1] > y_top)
        & (verts[:, 2] > z_thresh)
        & (np.abs(verts[:, 0]) < 0.08)               # midline ±8 cm
    )
    return mask


def colour_by_displacement(
    verts_a: np.ndarray,
    verts_b: np.ndarray,
    threshold_mm: float = MOVE_THRESHOLD_MM,
) -> np.ndarray:
    """
    Colour map that highlights vertices displaced more than ``threshold_mm``.
    Returns RGB array (V, 3) in [0, 1].
    """
    disp = np.linalg.norm(verts_b - verts_a, axis=1)
    t = threshold_mm / 1000.0  # mm -> metres (FLAME uses metres)
    colours = np.ones((verts_a.shape[0], 3), dtype=np.float32) * 0.85
    highlight = disp > t
    # highlight in warm red-orange
    colours[highlight] = np.array([1.0, 0.35, 0.25], dtype=np.float32)
    return colours


# ---------------------------------------------------------------------------
# Plotting
# ---------------------------------------------------------------------------


def _save_views(mesh_data: tuple, out_path: Path, title_prefix: str = "") -> None:
    """Render a mesh from multiple angles and save composite PNG."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    verts, faces, colours = mesh_data
    fig = plt.figure(figsize=(18, 5))

    elevations = [10, 10, 10]
    azimuths = [-90, 0, 90]  # profile, frontal, other profile
    titles = ["Left Profile", "Frontal", "Right Profile"]

    for i, (elev, azim, ttl) in enumerate(zip(elevations, azimuths, titles)):
        ax = fig.add_subplot(1, 3, i + 1, projection="3d")
        tri = faces
        ax.plot_trisurf(
            verts[:, 0],
            verts[:, 1],
            verts[:, 2],
            triangles=tri,
            edgecolor="none",
            shade=False,
            alpha=0.9,
        )
        ax.set_xlim(-0.08, 0.08)
        ax.set_ylim(-0.12, 0.12)
        ax.set_zlim(-0.08, 0.08)
        ax.view_init(elev=elev, azim=azim)
        ax.set_title(f"{title_prefix}{ttl}" if title_prefix else ttl, fontsize=10)
        ax.axis("off")

    plt.tight_layout()
    fig.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  Saved → {out_path}")


def plot_four_state_comparison(
    states: dict[str, tuple[np.ndarray, np.ndarray]],
    out_dir: Path,
) -> None:
    """
    Side-by-side grid of the four key states.
    
    states maps label -> (vertices, colours)
    """
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig = plt.figure(figsize=(20, 12))
    labels = [
        "Neutral (rest)",
        "Raised brows (before)",
        "Botox rest",
        "Botox raised",
    ]
    keys = ["neutral", "before_expr", "botox_rest", "botox_expr"]
    elevations = [10, 10, 10]
    azimuths = [-80, 10, 100]
    view_titles = ["Left", "Front", "Right"]

    for row, key in enumerate(keys):
        verts = states[key][0]
        # We do not actually have per-vertex colour support in plot_trisurf easily,
        # so we colour based on displacement vs neutral for the expression panels.
        for col, (elev, azim, vtitle) in enumerate(zip(elevations, azimuths, view_titles)):
            idx = row * 3 + col + 1
            ax = fig.add_subplot(4, 3, idx, projection="3d")
            ax.plot_trisurf(
                verts[:, 0],
                verts[:, 1],
                verts[:, 2],
                triangles=states[key][1],
                edgecolor="none",
                shade=False,
                alpha=0.9,
            )
            ax.set_xlim(-0.09, 0.09)
            ax.set_ylim(-0.13, 0.13)
            ax.set_zlim(-0.09, 0.09)
            ax.view_init(elev=elev, azim=azim)
            ax.axis("off")
            if col == 1:
                ax.set_title(labels[row], fontsize=11, fontweight="bold")

    plt.suptitle("Botox Forehead Deformation PoC  –  FLAME 2023 Open", fontsize=14, fontweight="bold")
    plt.tight_layout(rect=[0, 0, 1, 0.97])
    out_path = out_dir / "botox_forehead_four_states.png"
    fig.savefig(out_path, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved four-state comparison → {out_path}")


def save_mesh_obj(verts: np.ndarray, faces: np.ndarray, path: Path) -> None:
    """Export an OBJ file for external viewing."""
    with open(path, "w") as f:
        for v in verts:
            f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
        for tri in faces:
            # OBJ is 1-indexed
            f.write(f"f {tri[0]+1} {tri[1]+1} {tri[2]+1}\n")
    print(f"  OBJ saved → {path}")


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------


def load_model(path: Path) -> FLAMEModel:
    print(f"Loading FLAME model from {path} ...")
    with open(path, "rb") as f:
        dd = pickle.load(f, encoding="latin1")
    model = FLAMEModel(dd)
    print(f"  Template vertices : {model.V:,}")
    print(f"  Faces             : {model.faces.shape[0]:,}")
    print(f"  Identity PCs      : {model.identity_shapedirs.shape[2]}")
    print(f"  Expression PCs    : {model.n_expr}")
    return model


def run_botox_forehead_poc(model: FLAMEModel, out_dir: Path) -> dict:
    """Generate the four-state mesh set for Botox forehead PoC."""
    print("\n=== Botox Forehead PoC ===\n")

    # 1. Neutral at rest
    print("1. Generating neutral rest mesh ...")
    v_neutral = model.verts(beta=None, theta=None)

    # 2. Maximum expression BEFORE treatment
    print("2. Generating maximum forehead expression (before treatment) ...")
    v_before_expr = model.verts(beta=None, theta=MAX_EXPR_PARAMS)

    # 3. Apply Botox reduction to expression parameters affecting forehead
    print(f"3. Applying Botox suppression (reduction factor = {BOTOX_REDUCTION}) ...")
    botox_theta = MAX_EXPR_PARAMS * BOTOX_REDUCTION
    v_botox_rest = model.verts(beta=None, theta=botox_theta * 0.0)  # still rest, but we mainly need expr version
    v_botox_expr = model.verts(beta=None, theta=botox_theta)

    # Prepare coloured variants ------------------------------------------------
    # Before expression: highlight verts that move a lot compared to neutral
    colours_before = colour_by_displacement(v_neutral, v_before_expr)
    # Botox expression: highlight verts that STILL move vs neutral (should be fewer / weaker)
    colours_botox = colour_by_displacement(v_neutral, v_botox_expr)
    # Also compute actual difference between before-expr and botox-expr
    colours_diff = colour_by_displacement(v_before_expr, v_botox_expr)

    # Store in dict for plotting
    states = {
        "neutral":    (v_neutral,    model.faces),
        "before_expr":(v_before_expr, model.faces),
        "botox_rest": (v_botox_rest, model.faces),
        "botox_expr": (v_botox_expr, model.faces),
    }

    # Export OBJs -------------------------------------------------------------
    print("\nExporting OBJ snapshots ...")
    save_mesh_obj(v_neutral,    model.faces, out_dir / "botox_neutral.obj")
    save_mesh_obj(v_before_expr,model.faces, out_dir / "botox_before_expression.obj")
    save_mesh_obj(v_botox_expr, model.faces, out_dir / "botox_after_expression.obj")
    save_mesh_obj(v_botox_rest, model.faces, out_dir / "botox_at_rest.obj")

    # Quantitative metrics -----------------------------------------------------
    print("\nQuantitative metrics:")
    disp_before = np.linalg.norm(v_before_expr - v_neutral, axis=1)
    disp_after  = np.linalg.norm(v_botox_expr - v_neutral, axis=1)
    print(f"  Max forehead displacement (before) : {disp_before.max()*1000:.2f} mm")
    print(f"  Max forehead displacement (after)  : {disp_after.max()*1000:.2f} mm")
    print(f"  Mean forehead displacement (before): {disp_before.mean()*1000:.3f} mm")
    print(f"  Mean forehead displacement (after) : {disp_after.mean()*1000:.3f} mm")

    fore_mask = forehead_mask(v_neutral)
    print(f"  Forehead-ROI vertices: {fore_mask.sum()}/{model.V}")
    print(f"  Forehead mean Δ (before): {disp_before[fore_mask].mean()*1000:.3f} mm")
    print(f"  Forehead mean Δ (after) : {disp_after[fore_mask].mean()*1000:.3f} mm")

    return states


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="FLAME Botox Forehead Deformation PoC")
    parser.add_argument("--flame-path", type=Path, default=FLAME_PATH)
    parser.add_argument("--out-dir", type=Path, default=OUT_DIR)
    parser.add_argument("--reduction", type=float, default=BOTOX_REDUCTION)
    args = parser.parse_args(argv)

    if not args.flame_path.exists():
        print(f"ERROR: FLAME model not found at {args.flame_path}")
        return 1

    model = load_model(args.flame_path)
    states = run_botox_forehead_poc(model, args.out_dir)

    print("\nGenerating side-by-side visualization ...")
    plot_four_state_comparison(states, args.out_dir)
    print("\n✅ PoC complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
