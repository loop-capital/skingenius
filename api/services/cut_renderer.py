"""
SKINgenius Treatment Simulation API — CUT Fallback Renderer
============================================================
Fast texture-based rendering using the trained CUT model.
Used as fallback when IP-Adapter/ControlNet is unavailable.

Latency: ~300ms on GPU (single forward pass)
"""
from __future__ import annotations

import base64
import io
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import transforms

from api.config import WORKSPACE

# Lazy-loaded CUT generator
_cut_model = None
CUT_CHECKPOINT = WORKSPACE / "training" / "cut" / "checkpoints" / "best.pth"
IMAGE_SIZE = 256


def _get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _load_cut_model():
    """Load trained CUT generator (lazy singleton)."""
    global _cut_model
    if _cut_model is not None:
        return _cut_model

    if not CUT_CHECKPOINT.exists():
        raise FileNotFoundError(
            f"CUT checkpoint not found at {CUT_CHECKPOINT}. "
            "Run training/cut/train_cut.py first."
        )

    # Import here to avoid circular deps
    import sys
    sys.path.insert(0, str(WORKSPACE / "training" / "cut"))
    from train_cut import CUTGenerator, NGF

    device = _get_device()
    model = CUTGenerator(3, 3, NGF, n_blocks=6).to(device)
    ckpt = torch.load(CUT_CHECKPOINT, map_location=device, weights_only=True)
    model.load_state_dict(ckpt["G_state"])
    model.eval()
    _cut_model = model
    return _cut_model


def _get_transform():
    return transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
    ])


def render_with_cut(image_bytes: bytes) -> bytes:
    """
    Translate a before-treatment image to after-treatment using CUT.

    Parameters
    ----------
    image_bytes : bytes
        Raw JPEG/PNG image of the face.

    Returns
    -------
    bytes
        PNG image of the simulated after-treatment result.
    """
    model = _load_cut_model()
    device = _get_device()
    transform = _get_transform()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    x = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        y = model(x)

    # Denormalize
    y = (y.squeeze(0).cpu() + 1) / 2
    y = y.clamp(0, 1)

    # Convert to PNG bytes
    buf = io.BytesIO()
    result_img = transforms.ToPILImage()(y)
    result_img.save(buf, format="PNG")
    return buf.getvalue()


def render_before_after_cut(image_bytes: bytes) -> tuple[bytes, bytes]:
    """
    Render before/after pair using CUT fallback.

    Returns
    -------
    tuple[bytes, bytes]
        (before_png, after_png)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    before_png = buf.getvalue()

    after_png = render_with_cut(image_bytes)
    return before_png, after_png


def is_cut_available() -> bool:
    """Check if CUT model checkpoint exists."""
    return CUT_CHECKPOINT.exists()
