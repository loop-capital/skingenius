#!/usr/bin/env python3
"""
SKINgenius Synthetic Before/After Generator
=============================================
Generates synthetic facial treatment pairs using the FLAME 2023 Open model.

Treatments supported:
  - Botox:   reduce expression blendshape magnitudes (forehead, glabella, crow's feet)
  - Fillers: amplify identity shape parameters (lips, cheeks, jawline)

Rendering uses matplotlib + trimesh (NO PyTorch3D).
"""

from __future__ import annotations

import argparse
import json
import os
import pickle
import sys
from pathlib import Path
from typing import Tuple

import numpy as np
import trimesh
from PIL import Image

# Matplotlib is imported lazily inside functions to avoid backend issues on headless servers.


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_PATH = Path(__file__).resolve().parents[1] / "data" / "models" / "flame" / "flame2023_Open.pkl"
OUT_DIR = Path(__file__).resolve().parents[1] / "data" / "synthetic"
DOC_DIR = Path(__file__).resolve().parents[1] / "project-docs" / "research"

N_VERTICES = 5023
N_FACES = 9976
N_SHAPE = 300          # first 300 shapedirs → identity
N_EXPRESSION = 100     # last 100 shapedirs → expression
N_POSE = 36            # posedirs for jaw/eye/neck articulation

# Expression ranges inside shapedirs (indices 300-399 of total 400)
EXPR_START = 300
EXPR_END = 400

# Head joint index for pose-based articulation
HEAD_JOINT_IDX = 0

# Seed for reproducibility
RNG_SEED = 42

np.random.seed(RNG_SEED)


# ---------------------------------------------------------------------------
# FLAME Loader
# ---------------------------------------------------------------------------
class FLAMEModel:
    """Lightweight FLAME loader using only NumPy / SciPy."""

    def __init__(self, model_path: str | Path):
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"FLAME model not found: {model_path}")

        with open(model_path, "rb") as f:
            model = pickle.load(f, encoding="latin1")

        self.v_template: np.ndarray = model["v_template"]          # (5023, 3)
        self.shapedirs: np.ndarray = model["shapedirs"]          # (5023, 3, 400)
        self.posedirs: np.ndarray = model["posedirs"]              # (5023, 3, 36)
        self.weights: np.ndarray = model["weights"]                # (5023, 5)
        self.J_regressor: np.ndarray = model["J_regressor"]        # (5, 5023)
        self.faces: np.ndarray = model["f"]                        # (9976, 3)
        self.kintree_table: np.ndarray = model["kintree_table"]    # (2, 5)
        self.J_template: np.ndarray = model["J"]                    # (5, 3)

        # Verify shapes
        assert self.v_template.shape == (N_VERTICES, 3)
        assert self.shapedirs.shape == (N_VERTICES, 3, N_SHAPE + N_EXPRESSION)
        assert self.posedirs.shape == (N_VERTICES, 3, N_POSE)
        assert self.weights.shape == (N_VERTICES, 5)
        assert self.faces.shape == (N_FACES, 3)

    # ------------------------------------------------------------------
    # Core deformation helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _rodrigues(rot_vec: np.ndarray) -> np.ndarray:
        """Rodrigues formula: 3-vector -> 3x3 rotation matrix."""
        theta = np.linalg.norm(rot_vec)
        if theta < 1e-8:
            return np.eye(3)
        k = rot_vec / theta
        K = np.array([[0, -k[2], k[1]],
                      [k[2], 0, -k[0]],
                      [-k[1], k[0], 0]])
        return np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)

    def _compute_joints(self, vertices: np.ndarray) -> np.ndarray:
        """Regress joints from current vertex positions."""
        return self.J_regressor @ vertices  # (5, 3)

    def _lbs_deform(self, vertices: np.ndarray, pose: np.ndarray) -> np.ndarray:
        """
        Linear Blend Skinning (LBS).
        pose: (5, 3) axis-angle rotations for 5 joints.
        Returns deformed vertices (N_VERTICES, 3).
        """
        # Global transforms
        transforms = []
        for j_idx in range(len(self.kintree_table[0])):
            parent = int(self.kintree_table[0, j_idx])
            local_rot = self._rodrigues(pose[j_idx])
            local_T = np.eye(4)
            local_T[:3, :3] = local_rot
            if parent >= 0 and parent < len(self.J_template):
                parent_joint = self.J_template[parent]
                curr_joint = self.J_template[j_idx]
                # Translation relative to parent
                local_T[:3, 3] = (curr_joint - parent_joint)
                T = transforms[parent] @ local_T
            else:
                T = local_T
            transforms.append(T)

        # Skinning
        skinned = np.zeros_like(vertices)
        for v_idx in range(N_VERTICES):
            pos = np.zeros(3)
            for j_idx in range(5):
                w = self.weights[v_idx, j_idx]
                if w == 0:
                    continue
                T = transforms[j_idx]
                # Standard LBS: T * (v - j_rest) + j_transformed
                # Simplified here: transform around rest joint position
                rest_j = self.J_template[j_idx]
                v_rel = vertices[v_idx] - rest_j
                v_trans = (T[:3, :3] @ v_rel) + T[:3, 3]
                pos += w * v_trans
            skinned[v_idx] = pos

        # Pose corrective blend shapes (posedirs)
        # posedirs shape is (5023, 3, 36); pose is (5, 3) => 15 params.
        # We zero-pad to 36 dims for compatibility.
        pose_params_padded = np.zeros(N_POSE, dtype=pose.dtype)
        pose_params_padded[:15] = pose.flatten()
        pose_correction = np.einsum('ijk,k->ij', self.posedirs, pose_params_padded)
        skinned += pose_correction

        return skinned

    # ------------------------------------------------------------------
    # Public generators
    # ------------------------------------------------------------------
    def generate_base_face(
        self,
        beta_identity: np.ndarray | None = None,
        beta_expression: np.ndarray | None = None,
        pose: np.ndarray | None = None,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate a FLAME face mesh.

        Parameters
        ----------
        beta_identity : (300,)  identity shape parameters (default zeros)
        beta_expression : (100,) expression parameters (default zeros)
        pose : (5, 3) axis-angle pose params (default zeros)

        Returns
        -------
        vertices : (5023, 3)
        faces    : (9976, 3)
        """
        if beta_identity is None:
            beta_identity = np.zeros(N_SHAPE)
        if beta_expression is None:
            beta_expression = np.zeros(N_EXPRESSION)
        if pose is None:
            pose = np.zeros((5, 3))

        assert beta_identity.shape == (N_SHAPE,)
        assert beta_expression.shape == (N_EXPRESSION,)

        # Shape + expression blend shapes
        beta_full = np.concatenate([beta_identity, beta_expression])
        shape_expr = np.einsum('ijk,k->ij', self.shapedirs, beta_full)
        vertices = self.v_template + shape_expr

        # LBS pose deformation
        vertices = self._lbs_deform(vertices, pose)

        return vertices, self.faces

    # ------------------------------------------------------------------
    # Treatment-specific deformation creators
    # ------------------------------------------------------------------
    def botox_effect(
        self,
        beta_identity: np.ndarray | None = None,
        beta_expression: np.ndarray | None = None,
        forehead_strength: float = 0.5,
        glabella_strength: float = 0.5,
        crow_feet_strength: float = 0.4,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Simulate Botox by reducing key expression blendshapes.

        Returns (before_vertices, after_vertices, faces, expression_delta)
        """
        if beta_identity is None:
            beta_identity = np.zeros(N_SHAPE)
        if beta_expression is None:
            # Use a mild expressive face as baseline
            beta_expression = np.zeros(N_EXPRESSION)
            # Slight forehead raise + brow furrow (demo purposes)
            beta_expression[0] = 0.6   # brow raise proxy
            beta_expression[2] = 0.4   # forehead wrinkle proxy
            beta_expression[5] = 0.5   # glabella frown proxy

        before_vertices, faces = self.generate_base_face(
            beta_identity, beta_expression.copy()
        )

        # Reduce expression magnitudes
        expr_after = beta_expression.copy()
        expr_after[0] *= (1.0 - forehead_strength)
        expr_after[2] *= (1.0 - forehead_strength)
        expr_after[5] *= (1.0 - glabella_strength)
        # Crow's feet region (proxy indices near end of expression basis)
        expr_after[60:65] *= (1.0 - crow_feet_strength)

        after_vertices, _ = self.generate_base_face(
            beta_identity, expr_after
        )

        delta = after_vertices - before_vertices
        return before_vertices, after_vertices, faces, delta

    def filler_effect(
        self,
        beta_identity: np.ndarray | None = None,
        beta_expression: np.ndarray | None = None,
        lips_strength: float = 0.45,
        cheeks_strength: float = 0.45,
        jawline_strength: float = 0.30,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Simulate fillers by amplifying identity shape parameters.

        Returns (before_vertices, after_vertices, faces, delta)
        """
        if beta_identity is None:
            beta_identity = np.zeros(N_SHAPE)
        if beta_expression is None:
            beta_expression = np.zeros(N_EXPRESSION)

        before_vertices, faces = self.generate_base_face(
            beta_identity.copy(), beta_expression.copy()
        )

        # Filler amplification on identity params
        id_after = beta_identity.copy()

        # Lips region (proxied by early shape PCs known to influence mouth region)
        # Based on FLAME paper: first ~20 PCs strongly correlate with mouth/lip area
        id_after[10:18] += lips_strength * 0.8
        id_after[20:25] += lips_strength * 0.5

        # Cheeks / midface (slightly higher PC indices)
        id_after[35:45] += cheeks_strength * 0.7
        id_after[50:58] += cheeks_strength * 0.4

        # Jawline
        id_after[70:78] += jawline_strength * 0.6
        id_after[80:88] += jawline_strength * 0.4

        after_vertices, _ = self.generate_base_face(
            id_after, beta_expression.copy()
        )

        delta = after_vertices - before_vertices
        return before_vertices, after_vertices, faces, delta


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------
def render_pair(
    before: np.ndarray,
    after: np.ndarray,
    faces: np.ndarray,
    title: str,
    out_path: Path,
    elev: float = 10.0,
    azim: float = -70.0,
    show_mesh: bool = False,
) -> None:
    """
    Render a before/after pair as a composite figure.

    Parameters
    ----------
    before, after : (5023, 3)
    faces         : (9976, 3)
    title         : plot suptitle
    out_path      : where to save PNG
    elev, azim    : matplotlib 3D view angles
    show_mesh     : if True, draw wireframe; else scatter points
    """
    import matplotlib
    matplotlib.use("Agg")  # non-interactive backend
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d import Axes3D  # noqa: F401

    fig = plt.figure(figsize=(14, 6))
    fig.suptitle(title, fontsize=14, fontweight="bold")

    # ---- BEFORE ----
    ax1 = fig.add_subplot(131, projection="3d")
    if show_mesh:
        mesh = trimesh.Trimesh(vertices=before, faces=faces)
        for face in mesh.faces:
            verts = mesh.vertices[face]
            xs = np.append(verts[:, 0], verts[0, 0])
            ys = np.append(verts[:, 1], verts[0, 1])
            zs = np.append(verts[:, 2], verts[0, 2])
            ax1.plot(xs, ys, zs, color="steelblue", alpha=0.15, lw=0.3)
    else:
        ax1.scatter(
            before[:, 0],
            before[:, 1],
            before[:, 2],
            s=0.4,
            c="steelblue",
            alpha=0.5,
            edgecolors="none",
        )
    ax1.set_title("Before", fontsize=12)
    ax1.view_init(elev=elev, azim=azim)
    _equalize_axes(ax1, before)
    ax1.set_axis_off()

    # ---- AFTER ----
    ax2 = fig.add_subplot(132, projection="3d")
    if show_mesh:
        mesh = trimesh.Trimesh(vertices=after, faces=faces)
        for face in mesh.faces:
            verts = mesh.vertices[face]
            xs = np.append(verts[:, 0], verts[0, 0])
            ys = np.append(verts[:, 1], verts[0, 1])
            zs = np.append(verts[:, 2], verts[0, 2])
            ax2.plot(xs, ys, zs, color="firebrick", alpha=0.15, lw=0.3)
    else:
        ax2.scatter(
            after[:, 0],
            after[:, 1],
            after[:, 2],
            s=0.4,
            c="firebrick",
            alpha=0.5,
            edgecolors="none",
        )
    ax2.set_title("After", fontsize=12)
    ax2.view_init(elev=elev, azim=azim)
    _equalize_axes(ax2, after)
    ax2.set_axis_off()

    # ---- DIFFERENCE (heatmap overlay) ----
    ax3 = fig.add_subplot(133, projection="3d")
    diff = np.linalg.norm(after - before, axis=1)
    cmap = plt.cm.plasma
    colors = cmap(diff / (diff.max() + 1e-8))
    ax3.scatter(
        after[:, 0],
        after[:, 1],
        after[:, 2],
        s=0.5,
        c=colors,
        alpha=0.7,
        edgecolors="none",
    )
    ax3.set_title("Deformation Magnitude", fontsize=12)
    ax3.view_init(elev=elev, azim=azim)
    _equalize_axes(ax3, after)
    ax3.set_axis_off()
    # Colorbar
    m = plt.cm.ScalarMappable(cmap=cmap, norm=plt.Normalize(vmin=0, vmax=diff.max()))
    m.set_array([])
    fig.colorbar(m, ax=ax3, shrink=0.5, aspect=10, pad=0.05)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig(out_path, dpi=200, bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)
    print(f"Saved: {out_path}")


def _equalize_axes(ax, verts: np.ndarray) -> None:
    """Set equal aspect ratio for 3D axes."""
    max_range = np.array([
        verts[:, 0].max() - verts[:, 0].min(),
        verts[:, 1].max() - verts[:, 1].min(),
        verts[:, 2].max() - verts[:, 2].min(),
    ]).max() / 2.0
    mid_x = (verts[:, 0].max() + verts[:, 0].min()) * 0.5
    mid_y = (verts[:, 1].max() + verts[:, 1].min()) * 0.5
    mid_z = (verts[:, 2].max() + verts[:, 2].min()) * 0.5
    ax.set_xlim(mid_x - max_range, mid_x + max_range)
    ax.set_ylim(mid_y - max_range, mid_y + max_range)
    ax.set_zlim(mid_z - max_range, mid_z + max_range)


# ---------------------------------------------------------------------------
# Additional per-treatment viewers
# ---------------------------------------------------------------------------
def render_treatment_views(
    before: np.ndarray,
    after: np.ndarray,
    faces: np.ndarray,
    out_dir: Path,
    prefix: str,
    views: Tuple[Tuple[float, float], ...] = ((10, -70), (10, 20), (10, 110)),
) -> None:
    """Render multiple azimuth/elevation views for richer documentation."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    for idx, (elev, azim) in enumerate(views, 1):
        fig = plt.figure(figsize=(12, 5))
        ax1 = fig.add_subplot(121, projection="3d")
        ax1.scatter(before[:, 0], before[:, 1], before[:, 2], s=0.4, c="steelblue", alpha=0.5, edgecolors="none")
        ax1.set_title("Before")
        ax1.view_init(elev=elev, azim=azim)
        _equalize_axes(ax1, before)
        ax1.set_axis_off()

        ax2 = fig.add_subplot(122, projection="3d")
        ax2.scatter(after[:, 0], after[:, 1], after[:, 2], s=0.4, c="firebrick", alpha=0.5, edgecolors="none")
        ax2.set_title("After")
        ax2.view_init(elev=elev, azim=azim)
        _equalize_axes(ax2, after)
        ax2.set_axis_off()

        fname = out_dir / f"{prefix}_view{idx}.png"
        plt.tight_layout()
        plt.savefig(fname, dpi=180, bbox_inches="tight")
        plt.close(fig)
        print(f"Saved view {idx}: {fname}")


# ---------------------------------------------------------------------------
# Mesh export (for downstream pipelines)
# ---------------------------------------------------------------------------
def export_mesh_obj(vertices: np.ndarray, faces: np.ndarray, path: Path) -> None:
    """Export a trimesh to Wavefront OBJ."""
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.export(str(path))
    print(f"Exported OBJ: {path}")


# ---------------------------------------------------------------------------
# CLI / Main
# ---------------------------------------------------------------------------
def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SKINgenius Synthetic Before/After Generator")
    parser.add_argument(
        "--model", type=Path, default=MODEL_PATH,
        help="Path to flame2023_Open.pkl",
    )
    parser.add_argument(
        "--out-dir", type=Path, default=OUT_DIR,
        help="Directory for output images",
    )
    parser.add_argument(
        "--num-samples", type=int, default=3,
        help="Number of random identity samples per treatment",
    )
    parser.add_argument(
        "--treatments", nargs="+", choices=["botox", "fillers", "all"], default=["all"],
        help="Which treatments to render",
    )
    parser.add_argument(
        "--mesh-mode", action="store_true",
        help="Render wireframe meshes instead of point clouds",
    )
    parser.add_argument(
        "--export-obj", action="store_true",
        help="Also export .obj meshes",
    )
    args = parser.parse_args(argv)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)

    flame = FLAMEModel(args.model)

    treatments = ["botox", "fillers"] if "all" in args.treatments else args.treatments

    meta_log: list[dict] = []

    for treatment in treatments:
        for sample_idx in range(args.num_samples):
            # Random identity
            beta_id = np.random.normal(0, 0.6, N_SHAPE).astype(np.float64)
            beta_id = np.clip(beta_id, -2.5, 2.5)

            if treatment == "botox":
                # Mild expressive base + random expression variation
                beta_expr = np.zeros(N_EXPRESSION)
                beta_expr[0] = np.random.uniform(0.3, 0.9)   # brow
                beta_expr[2] = np.random.uniform(0.2, 0.7)   # forehead
                beta_expr[5] = np.random.uniform(0.3, 0.8)   # glabella

                forehead_str = np.random.uniform(0.35, 0.70)
                glabella_str = np.random.uniform(0.35, 0.70)
                crow_str = np.random.uniform(0.25, 0.55)

                before_v, after_v, faces, delta = flame.botox_effect(
                    beta_identity=beta_id,
                    beta_expression=beta_expr,
                    forehead_strength=forehead_str,
                    glabella_strength=glabella_str,
                    crow_feet_strength=crow_str,
                )

                img_name = f"botox_sample{sample_idx + 1}.png"
                prefix = f"botox_sample{sample_idx + 1}"
                title = (
                    f"Botox Simulation #{sample_idx + 1}\n"
                    f"forehead={forehead_str:.2f}, glabella={glabella_str:.2f}, crow's-feet={crow_str:.2f}"
                )

            elif treatment == "fillers":
                lips = np.random.uniform(0.30, 0.60)
                cheeks = np.random.uniform(0.30, 0.60)
                jaw = np.random.uniform(0.20, 0.40)

                before_v, after_v, faces, delta = flame.filler_effect(
                    beta_identity=beta_id,
                    lips_strength=lips,
                    cheeks_strength=cheeks,
                    jawline_strength=jaw,
                )

                img_name = f"fillers_sample{sample_idx + 1}.png"
                prefix = f"fillers_sample{sample_idx + 1}"
                title = (
                    f"Filler Simulation #{sample_idx + 1}\n"
                    f"lips={lips:.2f}, cheeks={cheeks:.2f}, jawline={jaw:.2f}"
                )
            else:
                raise ValueError(f"Unknown treatment: {treatment}")

            # Main composite render
            out_png = args.out_dir / img_name
            render_pair(before_v, after_v, faces, title, out_png, show_mesh=args.mesh_mode)

            # Multi-angle views
            render_treatment_views(before_v, after_v, faces, args.out_dir, prefix)

            # Optionally export OBJ
            if args.export_obj:
                export_mesh_obj(before_v, faces, args.out_dir / f"{prefix}_before.obj")
                export_mesh_obj(after_v, faces, args.out_dir / f"{prefix}_after.obj")

            meta_log.append({
                "treatment": treatment,
                "sample": sample_idx + 1,
                "image": str(out_png),
                "max_displacement_mm": float(np.max(np.linalg.norm(delta, axis=1)) * 1000),
                "mean_displacement_mm": float(np.mean(np.linalg.norm(delta, axis=1)) * 1000),
            })

    # Write metadata JSON
    meta_path = args.out_dir / "synthetic_metadata.json"
    with open(meta_path, "w") as fh:
        json.dump(meta_log, fh, indent=2)
    print(f"Metadata written: {meta_path}")

    # Generate notes markdown
    notes_md = _build_notes(meta_log)
    notes_path = DOC_DIR / "synthetic-generation-notes.md"
    with open(notes_path, "w") as fh:
        fh.write(notes_md)
    print(f"Notes written: {notes_path}")

    return 0


def _build_notes(meta_log: list[dict]) -> str:
    """Generate human-readable research notes."""
    lines = [
        "# SKINgenius Synthetic Before/After Generation Notes",
        "",
        f"**Date:** {os.environ.get('DATE', 'auto-generated')}",
        f"**Model:** FLAME 2023 Open ({N_VERTICES} vertices, {N_FACES} faces)",
        "",
        "## Overview",
        "",
        "This pipeline generates synthetic facial treatment pairs by deformin FLAME meshes and rendering them with matplotlib/trimesh.",
        "No PyTorch3D is used.",
        "",
        "## Treatments",
        "",
        "### 1. Botox",
        "",
        "- **Mechanism:** Reduces expression blendshape magnitudes.",
        "- **Target PCs:**",
        "  - PC 0: brow raise",
        "  - PC 2: forehead wrinkle",
        "  - PC 5: glabella frown",
        "  - PC 60-64: crow's-feet proxy",
        "- **Strength range:** 0.3 – 0.7 (1.0 = full suppression)",
        "",
        "### 2. Fillers",
        "",
        "- **Mechanism:** Amplifies identity shape parameters associated with facial volume.",
        "- **Target PC ranges:**",
        "  - Lips: 10–18, 20–25",
        "  - Cheeks / midface: 35–45, 50–58",
        "  - Jawline: 70–78, 80–88",
        "- **Strength range:** 0.2 – 0.6",
        "",
        "## Sample Summary",
        "",
        "| Treatment | Sample | Max Δ (mm) | Mean Δ (mm) |",
        "|-------------|--------|------------|-------------|",
    ]
    for entry in meta_log:
        lines.append(
            f"| {entry['treatment']} | {entry['sample']} | "
            f"{entry['max_displacement_mm']:.3f} | {entry['mean_displacement_mm']:.3f} |"
        )
    lines.extend([
        "",
        "## Implementation Details",
        "",
        "- **Shape params (β):** 300 identity PCs + 100 expression PCs.",
        "- **Pose params (θ):** 5 joints × 3 axis-angle = 15; posedirs expect 36 (includes eye/neck correctives).",
        "- **LBS:** Joint regression from `J_regressor`, rotation matrices via Rodrigues.",
        "- **Renderer:** Matplotlib 3D scatter (point cloud) with synchronized axes and view angles.",
        "",
        "## Known Limitations",
        "",
        "1. Expression ↔ anatomical mapping is approximate (proxy PCs).",
        "2. LBS implementation is lightweight; no smooth skinning weight optimization.",
        "3. Rendering is stylised point-cloud; not photorealistic.",
        "4. Filler effect is linear additive; real filler behavior is viscoelastic and non-linear.",
        "",
        "## Next Steps",
        "",
        "- [ ] Validate proxy PCs against FLAME expression semantic labels (if available).",
        "- [ ] Integrate skin texture synthesis (GAN / diffusion) for photorealism.",
        "- [ ] Add per-vertex wrinkle maps driven by expression magnitude.",
    ])
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    sys.exit(main())
