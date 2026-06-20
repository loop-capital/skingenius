"""
SKINgenius Treatment Simulation API — Rendering Service
=======================================================
Lightweight mesh → image renderer using matplotlib 3-D scatter,
explicitly matching the visual style of the FLAME PoC script.
"""
from __future__ import annotations

import base64
import io
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from api.services.reconstruction import get_flame


# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------

def colour_by_displacement(
    verts_a: np.ndarray,
    verts_b: np.ndarray,
    threshold_mm: float = 0.75,
) -> np.ndarray:
    """
    Warm red-orange for vertices displaced more than threshold.
    Everything else pale grey.  Returns RGB (V, 3) in [0,1].
    """
    disp = np.linalg.norm(verts_b - verts_a, axis=1)
    t = threshold_mm / 1000.0                     # FLAME units are metres
    colours = np.ones((verts_a.shape[0], 3), dtype=np.float32) * 0.85
    highlight = disp > t
    colours[highlight] = np.array([1.0, 0.35, 0.25], dtype=np.float32)
    return colours


# ---------------------------------------------------------------------------
# Render to PNG
# ---------------------------------------------------------------------------

def render_mesh(
    vertices: np.ndarray,
    faces: np.ndarray,
    colours: np.ndarray | None = None,
    title: str = "",
    elev: float = 10.0,
    azim: float = 10.0,
) -> bytes:
    """Render a single viewpoint to a PNG byte buffer."""
    fig = plt.figure(figsize=(6, 6))
    ax = fig.add_subplot(111, projection="3d")

    ax.plot_trisurf(
        vertices[:, 0],
        vertices[:, 1],
        vertices[:, 2],
        triangles=faces,
        edgecolor="none",
        shade=False,
        alpha=0.9,
    )
    ax.set_xlim(-0.09, 0.09)
    ax.set_ylim(-0.13, 0.13)
    ax.set_zlim(-0.09, 0.09)
    ax.view_init(elev=elev, azim=azim)
    ax.axis("off")
    if title:
        ax.set_title(title, fontsize=10, fontweight="bold")

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    return buf.getvalue()


def render_before_after_pair(
    verts_before: np.ndarray,
    verts_after: np.ndarray,
    faces: np.ndarray,
    treatment_name: str = "",
) -> tuple[bytes, bytes, float]:
    """
    Render BEFORE and AFTER images for the preview endpoint.

    Returns (before_png_bytes, after_png_bytes, max_displacement_mm).
    """
    disp = np.linalg.norm(verts_after - verts_before, axis=1)
    max_disp_mm = float(disp.max() * 1000.0)

    # Before: neutral mesh (cool grey)
    before_bytes = render_mesh(verts_before, faces, title=f"Before {treatment_name}".strip())

    # After: highlight displaced vertices
    colours = colour_by_displacement(verts_before, verts_after)
    after_bytes = render_mesh(verts_after, faces, title=f"After {treatment_name}".strip())

    return before_bytes, after_bytes, max_disp_mm


# ---------------------------------------------------------------------------
# Convenience: base64 encode
# ---------------------------------------------------------------------------

def b64_encode_png(png_bytes: bytes) -> str:
    return base64.b64encode(png_bytes).decode("ascii")
