#!/usr/bin/env python3
"""
SKINgenius Treatment Simulation API — Integration Test
=======================================================
Tests all endpoints end-to-end. Run with: python api/test_api.py

Requires: FLAME model at data/models/flame/flame2023_Open.pkl
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Add workspace to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def create_test_image(size=(256, 256)) -> bytes:
    """Create a simple test image (face-like rectangle)."""
    img = Image.new("RGB", size, (200, 180, 160))
    # Draw a simple face shape
    arr = np.array(img)
    cy, cx = size[0] // 2, size[1] // 2
    Y, X = np.ogrid[:size[0], :size[1]]
    # Face oval
    face_mask = ((X - cx) ** 2 / (60**2) + (Y - cy) ** 2 / (80**2)) < 1
    arr[face_mask] = [220, 195, 175]
    # Eyes
    arr[cy - 20, cx - 25] = [60, 60, 60]
    arr[cy - 20, cx + 25] = [60, 60, 60]
    # Nose
    arr[cy + 5, cx] = [180, 160, 140]
    # Mouth
    arr[cy + 30, cx - 10:cx + 10] = [180, 100, 100]

    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_flame_model():
    """Test FLAME model loads and generates vertices."""
    print("── Testing FLAME model loading...")
    from api.services.reconstruction import get_flame

    flame = get_flame()
    v = flame.verts(beta=None, theta=None)
    assert v.shape == (5023, 3), f"Expected (5023, 3), got {v.shape}"
    print(f"  ✓ FLAME loaded: {v.shape[0]} vertices, {flame.faces.shape[0]} faces")


def test_deformation():
    """Test botox and filler deformation."""
    print("── Testing deformation...")
    from api.services.deformation import apply_botox, apply_filler
    from api.services.reconstruction import get_flame

    flame = get_flame()
    beta = np.zeros(300, dtype=np.float64)
    theta = np.zeros(100, dtype=np.float64)

    # Botox forehead — with expression first (Botox suppresses expression)
    theta_expr = np.zeros(100, dtype=np.float64)
    theta_expr[0] = 1.5   # brow raise
    theta_expr[2] = 1.0   # surprise
    beta_new, theta_new, disp = apply_botox(beta, theta_expr, "forehead", {"units": 20})
    assert disp >= 0, f"Displacement should be >= 0, got {disp}"
    print(f"  ✓ Botox forehead (w/ expression): {disp:.3f}mm displacement")

    # Filler lips
    beta_new, theta_new, disp = apply_filler(beta, theta, "lips", {"volume_ml": 1.0})
    assert disp >= 0, f"Displacement should be >= 0, got {disp}"
    print(f"  ✓ Filler lips: {disp:.3f}mm displacement")

    # Filler cheeks
    beta_new, theta_new, disp = apply_filler(beta, theta, "cheeks", {"volume_ml": 1.5})
    print(f"  ✓ Filler cheeks: {disp:.3f}mm displacement")


def test_rendering():
    """Test mesh rendering."""
    print("── Testing rendering...")
    from api.services.rendering import render_before_after_pair
    from api.services.reconstruction import get_flame
    from api.services.deformation import apply_botox

    flame = get_flame()
    beta = np.zeros(300, dtype=np.float64)
    theta = np.zeros(100, dtype=np.float64)
    v_before = flame.verts(beta=beta, theta=theta)

    _, theta_new, _ = apply_botox(beta, theta, "forehead", {"units": 20})
    v_after = flame.verts(beta=beta, theta=theta_new)

    before_png, after_png, max_disp = render_before_after_pair(
        v_before, v_after, flame.faces, "botox forehead"
    )
    assert len(before_png) > 0, "Before PNG should not be empty"
    assert len(after_png) > 0, "After PNG should not be empty"
    print(f"  ✓ Rendered before/after: {len(before_png)} / {len(after_png)} bytes, {max_disp:.3f}mm")


def test_reconstruction():
    """Test selfie → mesh reconstruction."""
    print("── Testing reconstruction...")
    from api.services.reconstruction import reconstruct_from_selfie

    test_img = create_test_image()
    result = reconstruct_from_selfie(test_img)

    assert "mesh_id" in result, "Should return mesh_id"
    assert "landmarks_count" in result, "Should return landmarks_count"
    assert "face_params" in result, "Should return face_params"
    print(f"  ✓ Reconstructed: mesh_id={result['mesh_id'][:8]}..., "
          f"landmarks={result['landmarks_count']}")


def test_full_pipeline():
    """Test complete pipeline: reconstruct → deform → render."""
    print("── Testing full pipeline...")
    from api.services.reconstruction import reconstruct_from_selfie, get_flame
    from api.services.deformation import apply_treatment
    from api.services.rendering import render_before_after_pair
    from api.config import mesh_store

    # Step 1: Reconstruct
    test_img = create_test_image()
    result = reconstruct_from_selfie(test_img)
    mesh_id = result["mesh_id"]

    # Step 2: Get stored mesh
    stored = mesh_store[mesh_id]
    beta = np.array(stored["beta"], dtype=np.float64)
    theta = np.array(stored["theta"], dtype=np.float64)
    faces = np.array(stored["faces"])

    # Step 3: Apply treatment
    beta_new, theta_new, disp = apply_treatment(
        beta, theta, "botox", "forehead", {"units": 20}
    )

    # Step 4: Render
    flame = get_flame()
    v_before = flame.verts(beta=beta, theta=theta)
    v_after = flame.verts(beta=beta_new, theta=theta_new)

    before_png, after_png, max_disp = render_before_after_pair(
        v_before, v_after, faces, "botox forehead"
    )

    print(f"  ✓ Full pipeline: {mesh_id[:8]}... → {disp:.3f}mm → "
          f"render {len(before_png)}/{len(after_png)} bytes")


def test_cut_availability():
    """Check if CUT model is available."""
    print("── Checking CUT model...")
    from api.services.cut_renderer import is_cut_available

    available = is_cut_available()
    print(f"  {'✓' if available else '⚠'} CUT model: {'available' if available else 'not trained yet'}")


def main():
    print("=" * 60)
    print("SKINgenius Treatment Simulation API — Integration Tests")
    print("=" * 60)

    tests = [
        test_flame_model,
        test_deformation,
        test_rendering,
        test_reconstruction,
        test_full_pipeline,
        test_cut_availability,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)}")
    print("=" * 60)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
