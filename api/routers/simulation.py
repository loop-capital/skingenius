"""
SKINgenius Treatment Simulation API — Router
============================================
Endpoints:
  GET  /health
  GET  /api/v1/simulation/treatments
  POST /api/v1/simulation/reconstruct
  POST /api/v1/simulation/preview
  POST /api/v1/simulation/feedback
  GET  /api/v1/simulation/renderers
"""
from __future__ import annotations

import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from api.config import TREATMENTS, mesh_store
from api.models.schemas import (
    FeedbackRequest,
    FeedbackResponse,
    HealthResponse,
    PreviewRequest,
    PreviewResponse,
    ReconstructResponse,
    RenderersResponse,
    TreatmentInfo,
    TreatmentsResponse,
)
from api.services.deformation import apply_treatment
from api.services.rendering import b64_encode_png, render_before_after_pair
from api.services.reconstruction import reconstruct_from_selfie
from api.services.cut_renderer import is_cut_available, render_before_after_cut

router = APIRouter()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", version="0.1.0", service="skingenius-treatment-simulation")


# ---------------------------------------------------------------------------
# Treatments catalogue
# ---------------------------------------------------------------------------

@router.get(
    "/api/v1/simulation/treatments",
    response_model=TreatmentsResponse,
    tags=["simulation"],
)
async def list_treatments() -> TreatmentsResponse:
    return TreatmentsResponse(
        treatments=[TreatmentInfo(**t) for t in TREATMENTS]
    )


# ---------------------------------------------------------------------------
# Reconstruct
# ---------------------------------------------------------------------------

@router.post(
    "/api/v1/simulation/reconstruct",
    response_model=ReconstructResponse,
    tags=["simulation"],
)
async def reconstruct(
    image: UploadFile = File(..., description="Selfie image (JPEG/PNG)"),
) -> ReconstructResponse:
    if image.content_type not in {"image/jpeg", "image/png", "image/jpg", "image/webp"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP images are supported.",
        )
    try:
        raw = await image.read()
        result = reconstruct_from_selfie(raw)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
    return ReconstructResponse(**result)


# ---------------------------------------------------------------------------
# Quick preview via CUT (no mesh required)
# ---------------------------------------------------------------------------

@router.post(
    "/api/v1/simulation/preview-cut",
    tags=["simulation"],
)
async def preview_cut(
    image: UploadFile = File(..., description="Selfie image"),
) -> dict:
    """
    Fast texture-based preview using CUT neural translation.
    No mesh reconstruction needed — single forward pass.
    """
    if not is_cut_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CUT model not trained yet. Run training/cut/train_cut.py first.",
        )
    try:
        raw = await image.read()
        before_png, after_png = render_before_after_cut(raw)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {
        "before_image": b64_encode_png(before_png),
        "after_image": b64_encode_png(after_png),
        "renderer": "cut",
    }


# ---------------------------------------------------------------------------
# Preview
# ---------------------------------------------------------------------------

@router.post(
    "/api/v1/simulation/preview",
    response_model=PreviewResponse,
    tags=["simulation"],
)
async def preview(body: PreviewRequest) -> PreviewResponse:
    stored = mesh_store.get(body.mesh_id)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mesh '{body.mesh_id}' not found. Upload via /reconstruct first.",
        )

    beta = np.array(stored["beta"], dtype=np.float64)
    theta = np.array(stored["theta"], dtype=np.float64)
    faces = np.array(stored["faces"])

    try:
        beta_new, theta_new, disp_mm = apply_treatment(
            beta, theta,
            body.treatment_type,
            body.zone,
            body.params,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Update stored mesh with deformed params so subsequent calls evolve state
    stored["beta"] = beta_new.tolist()
    stored["theta"] = theta_new.tolist()

    # Render before / after
    from api.services.reconstruction import get_flame
    flame = get_flame()
    verts_before = flame.verts(beta=beta, theta=theta)
    verts_after = flame.verts(beta=beta_new, theta=theta_new)

    before_png, after_png, _ = render_before_after_pair(
        verts_before, verts_after, faces,
        treatment_name=f"{body.treatment_type} {body.zone}",
    )

    return PreviewResponse(
        before_image=b64_encode_png(before_png),
        after_image=b64_encode_png(after_png),
        deformation_mm=round(disp_mm, 3),
    )


# ---------------------------------------------------------------------------
# Feedback (improve deformation accuracy over time)
# ---------------------------------------------------------------------------

@router.post(
    "/api/v1/simulation/feedback",
    response_model=FeedbackResponse,
    tags=["simulation"],
)
async def submit_feedback(body: FeedbackRequest) -> FeedbackResponse:
    """Record user feedback on simulation quality."""
    # TODO: Persist to Supabase in production
    print(f"[feedback] simulation={body.simulation_id} rating={body.rating} notes={body.notes}")
    return FeedbackResponse(status="recorded")


# ---------------------------------------------------------------------------
# Available renderers
# ---------------------------------------------------------------------------

@router.get(
    "/api/v1/simulation/renderers",
    response_model=RenderersResponse,
    tags=["simulation"],
)
async def list_renderers() -> RenderersResponse:
    """List available rendering backends."""
    return RenderersResponse(
        primary={
            "name": "flame_mesh",
            "available": True,
            "type": "3d_deformation",
            "latency_ms": 500,
        },
        fallback={
            "name": "cut",
            "available": is_cut_available(),
            "type": "neural_translation",
            "latency_ms": 300,
        },
    )
